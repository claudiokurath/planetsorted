export class WhatsAppSendError extends Error {
  status?: number
  body?: string
  outcome: 'failed' | 'unknown'

  constructor(message: string, status?: number, body?: string, outcome?: 'failed' | 'unknown') {
    super(message)
    this.name = 'WhatsAppSendError'
    this.status = status
    this.body = body
    this.outcome = outcome ?? (status && status < 500 && status !== 408 ? 'failed' : 'unknown')
  }
}

const DEFAULT_GRAPH_VERSION = 'v23.0'
// Approved templates are retained for conversations where Meta rejects the
// immediate image/title card. Their static wording is managed in Meta.
// Body: "{{1}}\n\nType below to revisit."
// Button: https://sor7ed.com/{{1}}
const DEFAULT_CARD_TEMPLATE = 'sor7ed_revisit_card'
const LEGACY_CARD_TEMPLATE = 'sor7ed_saved_card'

type WhatsAppPayload = Record<string, unknown>

export type WhatsAppSendReceipt = { kind: 'template' | 'interactive' | 'link' | 'text' | 'audio'; messageId: string }

export type WhatsAppContentCard = {
  to: string
  slug: string
  title: string
  summary?: string | null
  imageUrl: string
  url: string
}

function graphVersion(): string {
  const configured = process.env.META_GRAPH_API_VERSION?.trim()
  return configured && /^v\d+\.\d+$/.test(configured)
    ? configured
    : DEFAULT_GRAPH_VERSION
}

async function postWhatsAppPayload(
  payload: WhatsAppPayload,
  errorLabel = 'message'
): Promise<string> {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID
  const token = process.env.META_WHATSAPP_TOKEN
  if (!phoneNumberId || !token) {
    throw new WhatsAppSendError('WhatsApp is not configured on the server.', undefined, undefined, 'failed')
  }

  let res: Response
  try {
    res = await fetch(
      `https://graph.facebook.com/${graphVersion()}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15_000),
      }
    )
  } catch {
    throw new WhatsAppSendError('WhatsApp sending could not be confirmed.')
  }

  if (!res.ok) {
    const error = await res.text().catch(() => '')
    throw new WhatsAppSendError(
      `WhatsApp rejected the ${errorLabel}.`,
      res.status,
      error
    )
  }

  try {
    const body = await res.json() as { messages?: { id?: unknown }[] }
    const id = body.messages?.[0]?.id
    if (body.messages?.length === 1 && typeof id === 'string' && id.trim().length > 0) return id
  } catch {}
  throw new WhatsAppSendError('WhatsApp sending could not be confirmed.')
}

function canTryAnotherFormat(error: unknown): boolean {
  // Only an explicit bad-request rejection permits a different message
  // format. A timeout/5xx/missing ID may already have sent the first card.
  return error instanceof WhatsAppSendError && error.outcome === 'failed' && error.status === 400
}

export function buildWhatsAppTemplateCardPayload(
  card: WhatsAppContentCard,
  templateName = DEFAULT_CARD_TEMPLATE,
  layout: 'revisit' | 'legacy' = templateName === LEGACY_CARD_TEMPLATE ? 'legacy' : 'revisit'
): WhatsAppPayload {
  const title = card.title.toLocaleUpperCase('en-GB').slice(0, 250)

  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: card.to,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: process.env.WHATSAPP_CONTENT_CARD_LANGUAGE?.trim() || 'en_GB',
      },
      components: [
        {
          type: 'header',
          parameters: [{ type: 'image', image: { link: card.imageUrl } }],
        },
        {
          type: 'body',
          parameters: layout === 'legacy'
            ? [
                { type: 'text', text: 'SOR7ED' },
                { type: 'text', text: title },
              ]
            : [{ type: 'text', text: title }],
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [{ type: 'text', text: `go/${card.slug}` }],
        },
      ],
    },
  }
}

export function buildWhatsAppInteractiveCardPayload(
  card: WhatsAppContentCard
): WhatsAppPayload {
  const title = card.title.toLocaleUpperCase('en-GB')
  const body = `*${title}*`

  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: card.to,
    type: 'interactive',
    interactive: {
      type: 'cta_url',
      header: {
        type: 'image',
        image: { link: card.imageUrl },
      },
      body: { text: body.slice(0, 1024) },
      action: {
        name: 'cta_url',
        parameters: {
          display_text: 'Open',
          url: card.url,
        },
      },
    },
  }
}

export function isWhatsAppConversationWindowError(error: unknown): boolean {
  if (!(error instanceof WhatsAppSendError)) return false
  return /24[- ]?hour|conversation window|re-?engagement|outside.*window|131047/i.test(
    `${error.message} ${error.body ?? ''}`
  )
}

/** Prefer the title-only image CTA in active conversations. Templates are
 * a compatibility fallback only after an explicit rejection, never after
 * an uncertain send. Their static wording cannot be changed in application code.
 */
export async function sendWhatsAppContentCard(
  card: WhatsAppContentCard
): Promise<WhatsAppSendReceipt> {
  let initialError: unknown
  try {
    const messageId = await postWhatsAppPayload(buildWhatsAppInteractiveCardPayload(card), 'interactive content card')
    return { kind: 'interactive', messageId }
  } catch (error) {
    if (!canTryAnotherFormat(error)) throw error
    initialError = error
  }

  const templateName = process.env.WHATSAPP_CONTENT_CARD_TEMPLATE?.trim() || DEFAULT_CARD_TEMPLATE
  try {
    const messageId = await postWhatsAppPayload(buildWhatsAppTemplateCardPayload(card, templateName), 'content-card template')
    return { kind: 'template', messageId }
  } catch (error) {
    if (!canTryAnotherFormat(error)) throw error
    console.warn('[WhatsApp card] Preferred template unavailable; trying approved fallback')
  }

  if (templateName !== LEGACY_CARD_TEMPLATE) {
    try {
      const messageId = await postWhatsAppPayload(buildWhatsAppTemplateCardPayload(card, LEGACY_CARD_TEMPLATE, 'legacy'), 'legacy content-card template')
      return { kind: 'template', messageId }
    } catch (error) {
      if (!canTryAnotherFormat(error)) throw error
    }
  }
  // A text message cannot reopen a closed conversation. Do not retry it.
  if (isWhatsAppConversationWindowError(initialError)) throw initialError
  const receipt = await sendWhatsAppMessage(card.to, card.url, card.url)
  return { ...receipt, kind: 'link' }
}

export async function sendWhatsAppMessage(
  to: string,
  body: string,
  urlForPreview?: string
): Promise<WhatsAppSendReceipt> {
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body, preview_url: !!urlForPreview },
  }

  const messageId = await postWhatsAppPayload(payload)
  return { kind: 'text', messageId }
}

export async function sendWhatsAppAudio(
  to: string,
  audioUrl: string
): Promise<WhatsAppSendReceipt> {
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'audio',
    audio: { link: audioUrl },
  }

  const messageId = await postWhatsAppPayload(payload, 'audio message')
  return { kind: 'audio', messageId }
}
