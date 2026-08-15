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

export async function sendWhatsAppMessage(
  to: string,
  body: string,
  urlForPreview?: string
): Promise<void> {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID
  const token = process.env.META_WHATSAPP_TOKEN
  if (!phoneNumberId || !token) {
    throw new WhatsAppSendError('WhatsApp is not configured on the server.')
  }

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body, preview_url: !!urlForPreview },
  }

  let res: Response
  try {
    res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
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
    console.error('[WhatsApp send exception]', err)
    throw new WhatsAppSendError('Could not reach the WhatsApp API.')
  }

  if (!res.ok) {
    const error = await res.text()
    console.error('[WhatsApp send error]', res.status, error)
    throw new WhatsAppSendError(
      'WhatsApp rejected the message.',
      res.status,
      error
    )
  }
}

export async function sendWhatsAppAudio(
  to: string,
  audioUrl: string
): Promise<void> {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID
  const token = process.env.META_WHATSAPP_TOKEN
  if (!phoneNumberId || !token) {
    throw new WhatsAppSendError('WhatsApp is not configured on the server.')
  }

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'audio',
    audio: { link: audioUrl },
  }

  let res: Response
  try {
    res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
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
    console.error('[WhatsApp send audio exception]', err)
    throw new WhatsAppSendError('Could not reach the WhatsApp API.')
  }

  if (!res.ok) {
    const error = await res.text()
    console.error('[WhatsApp send audio error]', res.status, error)
    throw new WhatsAppSendError(
      'WhatsApp rejected the audio message.',
      res.status,
      error
    )
  }
}
