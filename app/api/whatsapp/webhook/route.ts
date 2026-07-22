import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { detectCrisis, CRISIS_RESPONSE } from '@/lib/whatsapp/crisis'
import { parseCommand } from '@/lib/whatsapp/parseCommand'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

const HELP_TEXT = `Here's what you can do:

SAVE [slug] — save anything to your library (always free)
RUN [tool] — run a tool and get your result
ARTICLE [keyword] — get a protocol delivered here
AUDIO [keyword] — listen to the deep dive podcast
LIBRARY — see everything you've saved
LOGIN — get a magic link to your dashboard

Quick tools: TAX · AUTOPILOT · CLARITY · DOPAMINE · TRIAGE · RSD · SENSORY · BURNOUT

STOP — unsubscribe from everything
STOPWEEKLY — stop just the weekly check-in
START / STARTWEEKLY — turn them back on

Planet Sorted is not a crisis service.
In immediate danger: call 999. To talk now: text SHOUT to 85258.`

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
      await sendWhatsAppMessage(from, "You've been unsubscribed from all Planet Sorted WhatsApp messages. Text START to re-subscribe. Your account and saved library are still at planetsorted.com.")
      break

    case 'STOPWEEKLY':
      if (user) await supabase.from('users').update({ weekly_opted_in: false }).eq('user_id', user.user_id)
      await sendWhatsAppMessage(from, "Done — you're off the weekly update. Text STARTWEEKLY to turn it back on, or STOP to stop everything.")
      break

    case 'START':
      if (user) await supabase.from('users').update({ whatsapp_opted_out: false }).eq('user_id', user.user_id)
      await sendWhatsAppMessage(from, "You're back on. Text MENU to see what you can do, or jump straight in: TAX · CLARITY · BURNOUT · DOPAMINE")
      break

    case 'STARTWEEKLY':
      if (user) await supabase.from('users').update({ weekly_opted_in: true }).eq('user_id', user.user_id)
      await sendWhatsAppMessage(from, "Weekly check-in is on. Every Tuesday around 10am we'll send you one practical nudge. Text STOPWEEKLY to turn it off again.")
      break

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

    case 'LOGIN': {
      if (!user) {
        await sendWhatsAppMessage(from, `Sign up first at ${SITE}/signup — no password needed, just your email.`)
        break
      }
      await sendWhatsAppMessage(from, `Here's your magic link to sign in 👇\n${SITE}/signup\n\nIt'll send a link straight to your email. No password needed.`)
      break
    }

    case 'RUN': {
      if (!user) {
        await sendWhatsAppMessage(from, `Sign up free at ${SITE}/signup to run tools — no password needed.`)
        break
      }
      const { data: entitlement } = await supabase
        .from('entitlements').select('status').eq('user_id', user.user_id).single()
      const hasPaidPlan = entitlement?.status === 'active'

      if (!hasPaidPlan) {
        const { data: ledger } = await supabase.from('credits_ledger').select('delta').eq('user_id', user.user_id)
        const balance = (ledger ?? []).reduce((sum: number, r: any) => sum + r.delta, 0)
        if (balance <= 0) {
          await sendWhatsAppMessage(from, `You've used your 5 free tool runs. Upgrade to Plus for unlimited runs, saved history, and full plans — £5.99/month or £49/year. Scholarships available, no questions asked: ${SITE}/r/upgrade`)
          break
        }
        await supabase.from('credits_ledger').insert({ user_id: user.user_id, delta: -1, reason: 'run_command', source: 'whatsapp' })
      }

      const richUrl = `${SITE}/r/${arg}`
      await sendWhatsAppMessage(from, `Here's your tool 👇\n${richUrl}`, richUrl)
      break
    }

    case 'ARTICLE': {
      const { data: protocol } = await supabase
        .from('protocols').select('title, protocol, audio_url').eq('slug', arg).eq('status', 'Published').single()
      if (!protocol) {
        await sendWhatsAppMessage(from, `Couldn't find that article. Text MENU to see what's available.`)
        break
      }
      const articleUrl = `${SITE}/intelligence/${arg}`
      let msg = `*${protocol.title}*\n\n${protocol.protocol}\n\nRead the full article: ${articleUrl}`
      if (protocol.audio_url) {
        msg += `\n\n🎧 Prefer to listen? Text AUDIO ${arg} for the deep dive.`
      }
      await sendWhatsAppMessage(from, msg, articleUrl)
      break
    }

    case 'AUDIO': {
      const { data: protocol } = await supabase
        .from('protocols').select('title, audio_url').eq('slug', arg).eq('status', 'Published').single()
      if (!protocol) {
        await sendWhatsAppMessage(from, `Couldn't find that article. Text MENU to see what's available.`)
        break
      }
      if (protocol.audio_url) {
        await sendWhatsAppMessage(from, `*${protocol.title} — Audio Deep Dive*\n\nListen to the podcast overview:\n${protocol.audio_url}`, protocol.audio_url)
      } else {
        await sendWhatsAppMessage(from, `There isn't an audio deep dive for this one yet.`)
      }
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
        await sendWhatsAppMessage(from, "Your library is empty. Save any article by texting SAVE [slug], or browse at planetsorted.com.")
        break
      }
      const list = items.map((i: any) => `• ${i.title || 'Saved item'}: ${i.target_url}`).join('\n')
      await sendWhatsAppMessage(from, `Your saved items 👇\n\n${list}`)
      break
    }

    default:
      await sendWhatsAppMessage(from, `Sorry, didn't catch that.\n\n${HELP_TEXT}`)
  }

  return NextResponse.json({ status: 'ok' })
}
