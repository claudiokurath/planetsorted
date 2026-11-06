import { isIP } from 'node:net'

type ObjectValue = Record<string, unknown>
function object(value: unknown): ObjectValue | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as ObjectValue : null
}
function publicDestination(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2000) return null
  try {
    const url = new URL(value), host = url.hostname.replace(/^\[|\]$/g, '')
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password && !isIP(host) &&
      host.includes('.') && !/(^|\.)(localhost|local|internal|test|invalid)$/.test(host) ? url.href : null
  } catch { return null }
}
function cardImage(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.hostname !== 'api.sor7ed.com' || url.port || url.username || url.password || url.hash ||
      !/^\/api\/card-images\/[a-zA-Z0-9_-]{8,40}$/.test(url.pathname) || url.searchParams.size !== 1 ||
      !/^[a-f0-9]{64}$/.test(url.searchParams.get('signature') || '')) return null
    return url.href
  } catch { return null }
}

/** Reconstruct a narrow allowlist; never forward arbitrary signed provider fields. */
export function buttonRelayPayload(input: unknown) {
  const payload = object(input)
  if (!payload || payload.messaging_product !== 'whatsapp' || typeof payload.to !== 'string' || !/^\d{7,15}$/.test(payload.to)) return null
  const base = { messaging_product: 'whatsapp', recipient_type: 'individual', to: payload.to }
  const text = object(payload.text)
  if (payload.type === 'text' && typeof text?.body === 'string' && text.body.length >= 1 && text.body.length <= 4096) {
    return { ...base, type: 'text', text: { body: text.body, preview_url: text.preview_url === true } }
  }
  if (payload.type !== 'interactive') return null
  const interactive = object(payload.interactive), header = object(interactive?.header)
  const image = object(header?.image), body = object(interactive?.body)
  const action = object(interactive?.action), parameters = object(action?.parameters)
  if (interactive?.type !== 'cta_url' || header?.type !== 'image' || action?.name !== 'cta_url' ||
    typeof body?.text !== 'string' || !body.text.trim() || body.text.length > 1024 || parameters?.display_text !== 'Open') return null
  const imageUrl = cardImage(image?.link), destination = publicDestination(parameters.url)
  if (!imageUrl || !destination) return null
  return { ...base, type: 'interactive', interactive: {
    type: 'cta_url', header: { type: 'image', image: { link: imageUrl } }, body: { text: body.text },
    action: { name: 'cta_url', parameters: { display_text: 'Open', url: destination } },
  } }
}
