export class WhatsAppSendError extends Error {
  status?: number
  body?: string

  constructor(message: string, status?: number, body?: string) {
    super(message)
    this.name = 'WhatsAppSendError'
    this.status = status
    this.body = body
  }
}

const DEFAULT_GRAPH_VERSION = 'v23.0'
// Already approved and active in the SOR7ED WhatsApp Business account.
// Body: "Saved from {{1}} ✓ — {{2}}. Tap below to revisit it."
// Button: https://sor7ed.com/{{1}}
const DEFAULT_CARD_TEMPLATE = 'sor7ed_saved_card'

type WhatsAppPayload = Record<string, unknown>

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
): Promise<void> {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID
  const token = process.env.META_WHATSAPP_TOKEN
  if (!phoneNumberId || !token) {
    throw new WhatsAppSendError('WhatsApp is not configured on the server.')
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
      }
    )
  } catch (err) {
    console.error(`[WhatsApp ${errorLabel} exception]`, err)
    throw new WhatsAppSendError('Could not reach the WhatsApp API.')
  }

  if (!res.ok) {
    const error = await res.text()
    console.error(`[WhatsApp ${errorLabel} error]`, res.status, error)
    throw new WhatsAppSendError(
      `WhatsApp rejected the ${errorLabel}.`,
      res.status,
      error
    )
  }
}

export function buildWhatsAppTemplateCardPayload(
  card: WhatsAppContentCard,
  templateName = DEFAULT_CARD_TEMPLATE
): WhatsAppPayload {
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
          parameters: [
            { type: 'text', text: 'SOR7ED' },
            { type: 'text', text: card.title.slice(0, 250) },
          ],
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
  const summary = card.summary?.trim()
  const body = summary
    ? `*${card.title}*\n\n${summary}`
    : `*${card.title}*\n\nYour SOR7ED protocol is ready.`

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
      footer: { text: 'SOR7ED • One clear next step' },
      action: {
        name: 'cta_url',
        parameters: {
          display_text: 'Open protocol',
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

/**
 * Send a large SOR7ED image card. The approved template works at any time;
 * while it is awaiting approval, active conversations use the interactive
 * image card automatically.
 */
export async function sendWhatsAppContentCard(
  card: WhatsAppContentCard
): Promise<'template' | 'interactive' | 'link'> {
  const templateName =
    process.env.WHATSAPP_CONTENT_CARD_TEMPLATE?.trim() || DEFAULT_CARD_TEMPLATE

  try {
    await postWhatsAppPayload(
      buildWhatsAppTemplateCardPayload(card, templateName),
      'content-card template'
    )
    return 'template'
  } catch {
    console.warn('[WhatsApp card] Template unavailable; trying interactive card')
  }

  try {
    await postWhatsAppPayload(
      buildWhatsAppInteractiveCardPayload(card),
      'interactive content card'
    )
    return 'interactive'
  } catch (interactiveError) {
    if (isWhatsAppConversationWindowError(interactiveError)) {
      throw interactiveError
    }
  }

  await sendWhatsAppMessage(card.to, card.url, card.url)
  return 'link'
}

export async function sendWhatsAppMessage(
  to: string,
  body: string,
  urlForPreview?: string
): Promise<void> {
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body, preview_url: !!urlForPreview },
  }

  await postWhatsAppPayload(payload)
}

export async function sendWhatsAppAudio(
  to: string,
  audioUrl: string
): Promise<void> {
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'audio',
    audio: { link: audioUrl },
  }

  await postWhatsAppPayload(payload, 'audio message')
}
