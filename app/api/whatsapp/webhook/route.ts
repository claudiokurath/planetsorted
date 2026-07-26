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
    if (!message || message.type !== 'text') return NextResponse.json({ status: 'ignored' })

    const from: string = message.from
    const text: string = message.text.body.trim()

    // Safety-critical — always plain text, never a card, no exceptions.
    if (detectCrisis(text)) {
      await sendWhatsAppMessage(from, CRISIS_RESPONSE)
      return NextResponse.json({ status: 'crisis' })
    }

    const verb = text.toUpperCase()
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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

    // ── LOGIN — bare link, no card wrapper needed
    if (verb === 'LOGIN') {
      const url = `${SITE}/signup`
      await sendWhatsAppMessage(from, url, url)
      return NextResponse.json({ status: 'ok' })
    }

    // Strip legacy action prefixes (SAVE, RUN, ARTICLE, AUDIO) if present
    const cleanText = text.replace(/^(SAVE|RUN|ARTICLE|AUDIO)\s+/i, '').trim()
    const cleanVerb = cleanText.toUpperCase()

    // ── Known tool keyword → that tool's card
    if (TOOL_KEYWORDS[cleanVerb]) {
      const url = `${SITE}/r/${TOOL_KEYWORDS[cleanVerb]}`
      await sendWhatsAppMessage(from, url, url)
      return NextResponse.json({ status: 'ok' })
    }

    // ── Known article keyword or slug → that article's card
    const { data: article } = await sb
      .from('protocols')
      .select('slug')
      .eq('status', 'Published')
      .or(`keyword.ilike.${cleanVerb},slug.ilike.${cleanText.toLowerCase()}`)
      .maybeSingle()

    if (article) {
      const url = `${SITE}/r/${article.slug}`
      await sendWhatsAppMessage(from, url, url)
      return NextResponse.json({ status: 'ok' })
    }

    // ── HELP / MENU / unrecognized word / first contact —
    //    all collapse to exactly one universal fallback card.
    await sendWhatsAppMessage(from, START_URL, START_URL)
    return NextResponse.json({ status: 'ok' })

  } catch (err) {
    console.error('[Webhook error]', err)
    return NextResponse.json({ status: 'error_logged' }, { status: 200 })
  }
}
