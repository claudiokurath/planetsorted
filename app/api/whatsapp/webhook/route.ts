import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { detectCrisis, CRISIS_RESPONSE } from '@/lib/whatsapp/crisis'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'
import { verifyMetaSignature } from '@/lib/crypto/tokens'
import type { Database } from '@/lib/types/database'

const SITE = process.env.SITE_URL ?? 'https://www.sor7ed.com'

// The inbound command bot has been removed. This endpoint now does three things
// and nothing else:
//
//   1. Answers Meta's subscription handshake.
//   2. Replies to a crisis message — always first, before anything else.
//   3. Handles the consent commands (STOP / START / STOPWEEKLY / STARTWEEKLY),
//      which Meta's Business Policy and UK PECR both require us to honour, and
//      which the outbound senders read via `whatsapp_opted_out`.
//
// Outbound messaging is untouched: save-to-phone, send-protocol-link, the weekly
// broadcast and OTP delivery all still push to members as before.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (
    searchParams.get('hub.mode') === 'subscribe' &&
    searchParams.get('hub.verify_token') === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return new NextResponse(searchParams.get('hub.challenge'), { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(req: NextRequest) {
  try {
    // Read the raw body first so we can verify Meta's HMAC signature.
    const rawBody = await req.text()
    const signature = req.headers.get('x-hub-signature-256')
    if (!verifyMetaSignature(rawBody, signature)) {
      console.error('[Webhook] Invalid or missing X-Hub-Signature-256')
      return new NextResponse('Invalid signature', { status: 401 })
    }

    let body: unknown
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ status: 'ignored' })
    }

    type WebhookChange = {
      field?: string
      value?: {
        messages?: Array<{ type?: string; from?: string; text?: { body?: string } }>
        statuses?: Array<{
          status?: string
          recipient_id?: string
          errors?: Array<{ code?: number; title?: string; error_data?: { details?: string } }>
        }>
      }
    }

    const change = (body as { entry?: Array<{ changes?: WebhookChange[] }> })?.entry?.[0]?.changes?.[0]
    const value = change?.value
    const message = value?.messages?.[0]

    if (!message || message.type !== 'text' || !message.from || !message.text?.body) {
      // Diagnostics only — behaviour below is unchanged. This branch used to
      // discard every non-text payload silently, which made "WhatsApp never
      // replied" impossible to diagnose: delivery failures arrive here as
      // `statuses` callbacks and were dropped without a trace.
      // console.error (not log) so these land in the runtime-errors table,
      // which retains for days rather than the 1h runtime-log window.
      // Never logs message content; phone numbers are truncated to 4 digits.
      const status = value?.statuses?.[0]
      if (status) {
        console.error(
          '[Webhook diag] delivery status',
          JSON.stringify({
            status: status.status,
            recipient: status.recipient_id ? `...${status.recipient_id.slice(-4)}` : null,
            errors:
              status.errors?.map((e) => ({
                code: e.code,
                title: e.title,
                details: e.error_data?.details,
              })) ?? null,
          })
        )
      } else {
        console.error(
          '[Webhook diag] ignored payload',
          JSON.stringify({
            field: change?.field ?? null,
            valueKeys: value ? Object.keys(value) : null,
            messageCount: value?.messages?.length ?? 0,
            messageType: message?.type ?? null,
            hasFrom: Boolean(message?.from),
            hasTextBody: Boolean(message?.text?.body),
          })
        )
      }
      return NextResponse.json({ status: 'ignored' })
    }

    const from: string = message.from
    const text: string = message.text.body.trim()

    // Safety-critical — always plain text, never a card, no exceptions.
    // Deliberately retained when the command bot was removed: someone in crisis
    // texting this number must still be signposted to help.
    if (detectCrisis(text)) {
      await sendWhatsAppMessage(from, CRISIS_RESPONSE)
      return NextResponse.json({ status: 'crisis' })
    }

    const verb = text.toUpperCase()
    const sb = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const cacheBust = Date.now()
    const START_URL = `${SITE}/r/start?v=${cacheBust}`
    const GOODBYE_URL = `${SITE}/r/goodbye?v=${cacheBust}`

    // ── Consent commands — isolated on purpose.
    if (verb === 'STOP') {
      await sb.from('users').update({ whatsapp_opted_out: true }).eq('whatsapp_number', from)
      await sendWhatsAppMessage(from, GOODBYE_URL, GOODBYE_URL)
      return NextResponse.json({ status: 'ok' })
    }
    if (verb === 'START') {
      await sb.from('users').update({ whatsapp_opted_out: false }).eq('whatsapp_number', from)
      await sendWhatsAppMessage(from, START_URL, START_URL)
      return NextResponse.json({ status: 'ok' })
    }
    if (verb === 'STOPWEEKLY') {
      await sb.from('users').update({ weekly_opted_in: false }).eq('whatsapp_number', from)
      await sendWhatsAppMessage(from, GOODBYE_URL, GOODBYE_URL)
      return NextResponse.json({ status: 'ok' })
    }
    if (verb === 'STARTWEEKLY') {
      await sb.from('users').update({ weekly_opted_in: true }).eq('whatsapp_number', from)
      await sendWhatsAppMessage(from, START_URL, START_URL)
      return NextResponse.json({ status: 'ok' })
    }

    // ── Anything else. There are no tool keywords, no LOGIN, SAVE or LIBRARY
    //    any more, so say so once in plain English rather than leaving the
    //    sender wondering whether the number is broken.
    await sendWhatsAppMessage(
      from,
      'This number only handles STOP and START. Everything else — your tools, ' +
        `your saves and your account — lives at ${SITE}.`
    )
    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error('[Webhook error]', err)
    // Always 200 to Meta so it does not retry forever on application errors.
    return NextResponse.json({ status: 'error_logged' }, { status: 200 })
  }
}
