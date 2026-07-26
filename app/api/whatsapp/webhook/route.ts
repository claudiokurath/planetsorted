import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { detectCrisis, CRISIS_RESPONSE } from '@/lib/whatsapp/crisis'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

const TOOL_KEYWORDS: Record<string, string> = {
  TAX: 'adhd-tax-calculator',
  AUTOPILOT: 'financial-autopilot',
  CLARITY: 'decision-paralysis-solver',
}

const HELP_TEXT = `Planet SOR7ED — just text a word to get its link:

TAX · AUTOPILOT · CLARITY — tools
DEBT · THERAPY · CARE — protocols (or any live keyword)

STOP — pause all messages · START — turn back on
STOPWEEKLY / STARTWEEKLY — weekly check-in only
LOGIN — get a sign-in link

Not a crisis service. In danger: call 999. To talk: text SHOUT to 85258.`

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
    const body = await req.json()
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    if (!message || message.type !== 'text') {
      return NextResponse.json({ status: 'ignored' })
    }

    const from: string = message.from
    const text: string = message.text.body.trim()

    // Crisis check runs before anything else — never remove this ordering
    if (detectCrisis(text)) {
      await sendWhatsAppMessage(from, CRISIS_RESPONSE)
      return NextResponse.json({ status: 'crisis' })
    }

    const verb = text.toUpperCase()
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // ── System commands — the only "special" words left ──────────────────────
    if (verb === 'HELP' || verb === 'MENU') {
      await sendWhatsAppMessage(from, HELP_TEXT)
      return NextResponse.json({ status: 'ok' })
    }
    if (verb === 'STOP') {
      await sb.from('users').update({ whatsapp_opted_out: true }).eq('whatsapp_number', from)
      await sendWhatsAppMessage(from, "You've been unsubscribed from everything. Text START to turn it back on.")
      return NextResponse.json({ status: 'ok' })
    }
    if (verb === 'START') {
      await sb.from('users').update({ whatsapp_opted_out: false }).eq('whatsapp_number', from)
      await sendWhatsAppMessage(from, "You're back on. Text a keyword to get started.")
      return NextResponse.json({ status: 'ok' })
    }
    if (verb === 'STOPWEEKLY') {
      await sb.from('users').update({ weekly_opted_in: false }).eq('whatsapp_number', from)
      await sendWhatsAppMessage(from, "You're off the weekly check-in. Text STARTWEEKLY to turn it back on.")
      return NextResponse.json({ status: 'ok' })
    }
    if (verb === 'STARTWEEKLY') {
      await sb.from('users').update({ weekly_opted_in: true }).eq('whatsapp_number', from)
      await sendWhatsAppMessage(from, "Weekly check-in is on — every Tuesday, one nudge.")
      return NextResponse.json({ status: 'ok' })
    }
    if (verb === 'LOGIN') {
      await sendWhatsAppMessage(from, `Sign in at ${SITE}/signup — no password, just your email.`)
      return NextResponse.json({ status: 'ok' })
    }

    // ── Everything else: one keyword → one rich link, nothing more ───────────
    if (TOOL_KEYWORDS[verb]) {
      const url = `${SITE}/r/${TOOL_KEYWORDS[verb]}`
      await sendWhatsAppMessage(from, url, url) // bare URL, preview_url: true
      return NextResponse.json({ status: 'ok' })
    }

    const { data: article } = await sb
      .from('protocols')
      .select('slug')
      .eq('status', 'Published')
      .or(`keyword.ilike.${verb},slug.ilike.${text.toLowerCase()}`)
      .maybeSingle() // 0 rows = null, no error noise

    if (article) {
      const url = `${SITE}/r/${article.slug}`
      await sendWhatsAppMessage(from, url, url)
      return NextResponse.json({ status: 'ok' })
    }

    // Nothing matched — fallback to /tools
    await sendWhatsAppMessage(
      from,
      `Didn't recognise "${text}". Text HELP to see what's live, or browse ${SITE}/tools`
    )
    return NextResponse.json({ status: 'ok' })

  } catch (err) {
    console.error('[Webhook error]', err)
    return NextResponse.json({ status: 'error_logged' }, { status: 200 })
  }
}
