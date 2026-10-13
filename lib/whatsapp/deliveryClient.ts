/** Client-side journal: one deliberate request keeps its identity across retries. */
export type WhatsAppDeliveryStatus = 'pending' | 'accepted' | 'failed' | 'skipped' | 'unknown'

export interface WhatsAppDeliveryResult {
  success: boolean
  actionId: string
  saveStatus: 'saved'
  deliveryStatus: WhatsAppDeliveryStatus
  deliveryReason: string | null
}

export interface WhatsAppDeliveryRequest {
  slug: string
  context: 'article' | 'tool'
  includeLink?: boolean
  includeProtocol?: boolean
  includeAudio?: boolean
}

type Action = { id: string; submitted: boolean; deliveryStatus?: WhatsAppDeliveryStatus }
const actions = new Map<string, Action>()
const requests = new Map<string, Promise<WhatsAppDeliveryResult>>()
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isDeliveryActionId(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value)
}

function storageKey(request: WhatsAppDeliveryRequest, userId?: string): string {
  // Context is presentation only. Match the server's canonical delivery flags.
  return `sor7ed:delivery:v1:${userId || 'visitor'}:${JSON.stringify([
    request.slug, request.includeLink !== false, request.includeProtocol === true, request.includeAudio === true,
  ])}`
}

function readAction(key: string): Action | undefined {
  if (typeof window !== 'undefined') {
    try {
      const value = JSON.parse(window.sessionStorage.getItem(key) || 'null')
      if (value && isDeliveryActionId(value.id) && typeof value.submitted === 'boolean') {
        actions.set(key, value)
        return value
      }
    } catch { /* Storage can be disabled; the in-memory journal still guards clicks. */ }
  }
  return actions.get(key)
}

function writeAction(key: string, action: Action): void {
  actions.set(key, action)
  if (typeof window !== 'undefined') {
    try { window.sessionStorage.setItem(key, JSON.stringify(action)) }
    catch { /* Do not prevent a save when browser storage is unavailable. */ }
  }
}

export function prepareDeliveryAction(request: WhatsAppDeliveryRequest, userId?: string, preferredId?: string): string {
  const key = storageKey(request, userId)
  const existing = readAction(key)
  if (existing && (!isDeliveryActionId(preferredId) || preferredId === existing.id)) return existing.id
  const id = isDeliveryActionId(preferredId) ? preferredId : crypto.randomUUID()
  writeAction(key, { id, submitted: false })
  return id
}

export function hasSubmittedDelivery(request: WhatsAppDeliveryRequest, userId: string, preferredId?: string): boolean {
  prepareDeliveryAction(request, userId, preferredId)
  return readAction(storageKey(request, userId))?.submitted === true
}

/** Only a deliberate retry of a confirmed unsuccessful send creates a new ID. */
export function startNewDeliveryAction(request: WhatsAppDeliveryRequest, userId: string): string {
  const key = storageKey(request, userId)
  const existing = readAction(key)
  if (!existing || !['failed', 'skipped'].includes(existing.deliveryStatus || '')) {
    throw new Error('Check the status of your previous request before sending again.')
  }
  const id = crypto.randomUUID()
  writeAction(key, { id, submitted: false })
  return id
}

function parseResult(value: unknown, actionId: string): WhatsAppDeliveryResult {
  const result = value as Partial<WhatsAppDeliveryResult> | null
  if (!result || result.actionId !== actionId || result.saveStatus !== 'saved' ||
    !['pending', 'accepted', 'failed', 'skipped', 'unknown'].includes(result.deliveryStatus || '') ||
    typeof result.success !== 'boolean' ||
    result.success !== (result.deliveryStatus === 'accepted')) {
    throw new Error('We could not confirm the WhatsApp status. Check again in a moment.')
  }
  return {
    success: result.success,
    actionId,
    saveStatus: 'saved',
    deliveryStatus: result.deliveryStatus as WhatsAppDeliveryStatus,
    deliveryReason: typeof result.deliveryReason === 'string' ? result.deliveryReason : null,
  }
}

export function deliveryStatusMessage(result: WhatsAppDeliveryResult): string {
  switch (result.deliveryStatus) {
    case 'accepted': return 'Message sent. WhatsApp has accepted it; delivery is not yet confirmed.'
    case 'pending': return 'Saved. WhatsApp sending is still in progress. Check status in a moment.'
    case 'failed': return 'Saved to your account. WhatsApp sending failed. Check status for this request.'
    case 'skipped': return 'Saved to your account. A WhatsApp message was not sent. Check your messaging preferences.'
    case 'unknown': return 'Saved to your account. WhatsApp sending could not be confirmed. Check status before requesting another message.'
  }
}

async function readStatus(actionId: string): Promise<Response> {
  try {
    return await fetch(`/api/save-to-phone?${new URLSearchParams({ actionId })}`, { cache: 'no-store', signal: AbortSignal.timeout(15_000) })
  } catch {
    throw new Error('We could not check this request. Check your connection and try again.')
  }
}

async function readResult(response: Response, actionId: string, key: string): Promise<WhatsAppDeliveryResult> {
  let value: unknown
  try { value = await response.json() }
  catch { throw new Error('We could not confirm the WhatsApp status. Check again in a moment.') }
  const result = parseResult(value, actionId)
  writeAction(key, { id: actionId, submitted: true, deliveryStatus: result.deliveryStatus })
  return result
}

/** A submitted action is checked, never silently sent again. */
export async function requestWhatsAppDelivery(request: WhatsAppDeliveryRequest, userId: string, preferredId?: string): Promise<WhatsAppDeliveryResult> {
  const key = storageKey(request, userId)
  const actionId = prepareDeliveryAction(request, userId, preferredId)
  const active = requests.get(`${userId}:${actionId}`)
  if (active) return active

  const operation = (async () => {
    const action = readAction(key)!
    if (action.submitted) {
      const response = await readStatus(actionId)
      if (response.status === 404) {
        // No owned journal row exists. An explicit next click may retry the
        // same identity; this lookup does not send or create a replacement ID.
        writeAction(key, { id: actionId, submitted: false })
        throw new Error('No saved request was found. Tap again to try safely.')
      }
      if (!response.ok) throw new Error('We could not check this request. Check your connection and try again.')
      return readResult(response, actionId, key)
    }

    // Persist before dispatch, including across a reload while the request runs.
    writeAction(key, { id: actionId, submitted: true })
    let response: Response
    try {
      response = await fetch('/api/save-to-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(30_000),
        body: JSON.stringify({ ...request, includeLink: request.includeLink !== false, idempotencyKey: actionId }),
      })
    } catch {
      throw new Error('We could not confirm sending. Tap again to check this request safely.')
    }
    if (!response.ok) {
      // These failures occur before a delivery claim. Keep the same ID for a
      // deliberate retry. A conflict or server failure remains status-only.
      if ([400, 401, 403, 404, 429].includes(response.status)) writeAction(key, { id: actionId, submitted: false })
      throw new Error(response.status === 401 ? 'Please sign in again to send this item.' :
        response.status === 429 ? 'Please wait a moment before trying this request again.' :
        'We could not confirm sending. Tap again to check this request safely.')
    }
    return readResult(response, actionId, key)
  })()
  requests.set(`${userId}:${actionId}`, operation)
  try { return await operation }
  finally { requests.delete(`${userId}:${actionId}`) }
}
