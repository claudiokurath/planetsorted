import { createHash, timingSafeEqual } from 'node:crypto'

export function signInTokenDigest(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function matchesPendingSignInToken(token: string, digest: unknown): boolean {
  if (typeof digest !== 'string' || !/^[a-f0-9]{64}$/.test(digest)) return false
  return timingSafeEqual(Buffer.from(signInTokenDigest(token)), Buffer.from(digest))
}

/** The existing approved link-card template can be delivered outside 24 hours. */
export function buildSignInLinkPayload(phone: string, token: string, site: string) {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phone,
    type: 'template',
    template: {
      name: 'sor7ed_saved_card',
      language: { code: process.env.WHATSAPP_CONTENT_CARD_LANGUAGE?.trim() || 'en_GB' },
      components: [
        { type: 'header', parameters: [{ type: 'image', image: { link: `${site}/images/tangle-yellow.png` } }] },
        { type: 'body', parameters: [
          { type: 'text', text: 'SOR7ED' },
          { type: 'text', text: 'YOUR PRIVATE SIGN-IN LINK — EXPIRES IN 10 MINUTES' },
        ] },
        { type: 'button', sub_type: 'url', index: '0', parameters: [
          { type: 'text', text: `auth/whatsapp-confirm?token=${encodeURIComponent(token)}` },
        ] },
      ],
    },
  }
}

export async function sendWhatsAppSignInLink(phone: string, token: string, site: string): Promise<void> {
  const phoneId = process.env.META_PHONE_NUMBER_ID
  const accessToken = process.env.META_WHATSAPP_TOKEN
  if (!phoneId || !accessToken) throw new Error('WhatsApp sign-in is unavailable.')
  const configuredVersion = process.env.META_GRAPH_API_VERSION?.trim() || ''
  const version = /^v\d+\.\d+$/.test(configuredVersion) ? configuredVersion : 'v23.0'
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(buildSignInLinkPayload(phone, token, site)),
    signal: AbortSignal.timeout(15_000),
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.messages?.[0]?.id) {
    // Never log the private link, recipient, access token or raw response.
    console.error('[WhatsApp sign-in] Template request failed', { status: response.status, code: result?.error?.code })
    throw new Error('WhatsApp sign-in is unavailable.')
  }
  // API acceptance is not a delivery receipt. Do not fall back to free-form
  // text: Meta can accept that request and reject it asynchronously (131047).
}
