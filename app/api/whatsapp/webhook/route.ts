import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { detectCrisis, CRISIS_RESPONSE } from '@/lib/whatsapp/crisis'
import { parseCommand } from '@/lib/whatsapp/parseCommand'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

const HELP_TEXT = `Here's what you can do on Planet Sorted:

Text one of these keywords to run a tool instantly:
• TAX — ADHD Tax Calculator
• AUTOPILOT — Financial Autopilot Map
• CLARITY — Decision Paralysis Solver

System commands:
• MENU / HELP — see this list
• LOGIN — get a magic link to your account
• STOP — pause all messages
• START — turn messages back on

Planet Sorted is not a crisis service.
In immediate danger: call 999. To talk now: text SHOUT to 85258.`

const toolSlugs: Record<string, string> = {
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
  const body = await req.json()
  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
  if (!message || message.type !== 'text') return NextResponse.json({ status: 'ignored' })

  const from: string = message.from
  const rawText: string = message.text.body.trim()

  if (detectCrisis(rawText)) {
    await sendWhatsAppMessage(from, CRISIS_RESPONSE)
    return NextResponse.json({ status: 'crisis_handled' })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: user } = await supabase
    .from('users')
    .select('user_id, whatsapp_opted_out')
    .eq('whatsapp_number', from)
    .single()

  const { verb, arg } = parseCommand(rawText)

  switch (verb) {
    case 'HELP':
    case 'MENU':
      await sendWhatsAppMessage(from, HELP_TEXT)
      break

    case 'STOP':
      if (user) await supabase.from('users').update({ whatsapp_opted_out: true }).eq('user_id', user.user_id)
      await sendWhatsAppMessage(from, "You've been unsubscribed from all Planet Sorted WhatsApp messages. Text START to re-subscribe. Your account and saved history are still at planetsorted.com.")
      break

    case 'STOPWEEKLY':
      if (user) await supabase.from('users').update({ weekly_opted_in: false }).eq('user_id', user.user_id)
      await sendWhatsAppMessage(from, "Done — you're off the weekly update. Text STARTWEEKLY to turn it back on, or STOP to stop everything.")
      break

    case 'START':
      if (user) await supabase.from('users').update({ whatsapp_opted_out: false }).eq('user_id', user.user_id)
      await sendWhatsAppMessage(from, "You're back on. Text MENU to see what you can do, or jump straight in: TAX · CLARITY · AUTOPILOT")
      break

    case 'STARTWEEKLY':
      if (user) await supabase.from('users').update({ weekly_opted_in: true }).eq('user_id', user.user_id)
      await sendWhatsAppMessage(from, "Weekly check-in is on. Every Tuesday around 10am we'll send you one practical nudge. Text STOPWEEKLY to turn it off again.")
      break

    case 'LOGIN': {
      if (!user) {
        await sendWhatsAppMessage(from, `Sign up first at ${SITE}/signup — no password needed, just your email.`)
        break
      }
      await sendWhatsAppMessage(from, `Here's your magic link to sign in 👇\n${SITE}/signup\n\nIt'll send a link straight to your email. No password needed.`)
      break
    }

    case 'TOOL': {
      const keyword = arg.toUpperCase()
      const slug = toolSlugs[keyword]
      if (!slug) {
        await sendWhatsAppMessage(from, "That one's coming soon — text MENU to see what's live right now.")
        break
      }

      const richUrl = `${SITE}/r/${slug}`
      await sendWhatsAppMessage(from, `Here's your tool 👇\n${richUrl}`, richUrl)
      break
    }

    case 'SAVE': {
      const targetUrl = `${SITE}/intelligence/${arg}`
      const richUrl = `${SITE}/r/${arg}`
      if (user) {
        await supabase.from('saved_items').upsert(
          { user_id: user.user_id, type: 'blog', source_url: targetUrl, target_url: targetUrl, title: arg },
          { onConflict: 'user_id,source_url' }
        )
      }
      await supabase.from('rich_links').upsert({ slug: arg, target_url: targetUrl, title: arg }, { onConflict: 'slug' })
      await sendWhatsAppMessage(from, `Saved ✓ Come back to it any time:\n${richUrl}`, richUrl)
      break
    }

    case 'LIBRARY': {
      if (!user) {
        await sendWhatsAppMessage(from, `Sign up to save things to your library: ${SITE}/signup`)
        break
      }
      const { data: items } = await supabase
        .from('saved_items').select('title, target_url, created_at').eq('user_id', user.user_id).order('created_at', { ascending: false }).limit(10)
      if (!items || items.length === 0) {
        await sendWhatsAppMessage(from, "Your library is empty. Browse protocols at planetsorted.com.")
        break
      }
      const list = items.map((i: any) => `• ${i.title || 'Saved item'}: ${i.target_url}`).join('\n')
      await sendWhatsAppMessage(from, `Your saved items 👇\n\n${list}`)
      break
    }

    case 'ARTICLE_KEYWORD':
    default: {
      const searchTerm = arg.trim().toLowerCase()
      // Try searching protocols by keyword or slug
      const { data: protocols } = await supabase
        .from('protocols')
        .select('title, protocol, slug, keyword')
        .eq('status', 'Published')

      const match = (protocols || []).find((p: any) => 
        (p.keyword && p.keyword.toLowerCase() === searchTerm) ||
        (p.slug && p.slug.toLowerCase() === searchTerm)
      )

      if (match) {
        const articleUrl = `${SITE}/intelligence/${match.slug}`
        await sendWhatsAppMessage(
          from,
          `*${match.title}*\n\n${match.protocol || ''}\n\nRead full guide: ${articleUrl}`,
          articleUrl
        )
      } else {
        await sendWhatsAppMessage(from, `Sorry, didn't recognise "${rawText}". Text MENU to see what's live right now.`)
      }
      break
    }
  }

  return NextResponse.json({ status: 'ok' })
}
