export async function sendWhatsAppMessage(
  to: string,
  body: string,
  urlForPreview?: string
): Promise<void> {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID!
  const token = process.env.META_WHATSAPP_TOKEN!

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body, preview_url: !!urlForPreview },
  }

  const res = await fetch(
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

  if (!res.ok) {
    const error = await res.text()
    console.error('[WhatsApp send error]', error)
    throw new Error(`WhatsApp send failed: ${res.status}`)
  }
}
