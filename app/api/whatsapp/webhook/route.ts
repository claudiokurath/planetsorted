import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { detectCrisis, CRISIS_RESPONSE } from '@/lib/whatsapp/crisis'
import { parseCommand } from '@/lib/whatsapp/parseCommand'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

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
  try {
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
      case 'MENU': {
        const menuRichUrl = `${SITE}/r/tools`
        const helpMessage = `*Planet Sorted Toolbox*\n\nExplore tools, protocols, and your saved library online 👇\n${menuRichUrl}`
        await sendWhatsAppMessage(from, helpMessage, menuRichUrl)
        break
      }

      case 'STOP':
        if (user) await supabase.from('users').update({ whatsapp_opted_out: true }).eq('user_id', user.user_id)
        await sendWhatsAppMessage(from, `You've been unsubscribed from WhatsApp messages. Text START to re-subscribe. Account & saved library: ${SITE}/dashboard`)
        break

      case 'STOPWEEKLY':
        if (user) await supabase.from('users').update({ weekly_opted_in: false }).eq('user_id', user.user_id)
        await sendWhatsAppMessage(from, "Done — turned off weekly updates. Text STARTWEEKLY to resume.")
        break

      case 'START':
        if (user) await supabase.from('users').update({ whatsapp_opted_out: false }).eq('user_id', user.user_id)
        await sendWhatsAppMessage(from, `Welcome back to Planet Sorted! Explore interactive tools & protocols 👇\n${SITE}/r/tools`, `${SITE}/r/tools`)
        break

      case 'STARTWEEKLY':
        if (user) await supabase.from('users').update({ weekly_opted_in: true }).eq('user_id', user.user_id)
        await sendWhatsAppMessage(from, "Weekly updates enabled ✓ We'll send you one practical nudge every Tuesday.")
        break

      case 'LOGIN': {
        const loginUrl = `${SITE}/r/login`
        await sendWhatsAppMessage(from, `Access your Planet Sorted account & library 👇\n${loginUrl}`, loginUrl)
        break
      }

      case 'TOOL': {
        const keyword = arg.toUpperCase()
        const slug = toolSlugs[keyword]
        if (!slug) {
          await sendWhatsAppMessage(from, `Explore all interactive tools on Sorted Lab 👇\n${SITE}/r/tools`, `${SITE}/r/tools`)
          break
        }

        const richUrl = `${SITE}/r/${slug}`
        await sendWhatsAppMessage(from, `Tap to open your tool 👇\n${richUrl}`, richUrl)
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
        await sendWhatsAppMessage(from, `Saved ✓ View in your library 👇\n${richUrl}`, richUrl)
        break
      }

      case 'LIBRARY': {
        const libraryUrl = `${SITE}/r/library`
        await sendWhatsAppMessage(from, `Open your saved library on Planet Sorted 👇\n${libraryUrl}`, libraryUrl)
        break
      }

      case 'ARTICLE_KEYWORD':
      default: {
        const searchTerm = arg.trim().toLowerCase()
        const { data: protocols } = await supabase
          .from('protocols')
          .select('title, summary, cover_image, slug, keyword')
          .eq('status', 'Published')

        const match = (protocols || []).find((p: any) => 
          (p.keyword && p.keyword.toLowerCase() === searchTerm) ||
          (p.slug && p.slug.toLowerCase() === searchTerm)
        )

        if (match) {
          const richUrl = `${SITE}/r/${match.slug}`
          // Update rich_links table with high-res cover_image for WhatsApp preview
          await supabase.from('rich_links').upsert({
            slug: match.slug,
            target_url: `${SITE}/intelligence/${match.slug}`,
            title: match.title,
            description: match.summary || 'Read full protocol on Planet Sorted.',
            image_url: match.cover_image
          }, { onConflict: 'slug' })

          // Send clean, elegant 2-line response with rich link preview only!
          const cleanMessage = `*${match.title}*\n\nTap to read full guide 👇\n${richUrl}`
          await sendWhatsAppMessage(from, cleanMessage, richUrl)
        } else {
          const exploreUrl = `${SITE}/r/tools`
          await sendWhatsAppMessage(from, `Didn't recognise "${rawText}". Explore tools & protocols 👇\n${exploreUrl}`, exploreUrl)
        }
        break
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error('[Webhook error]', err)
    return NextResponse.json({ status: 'error_logged' }, { status: 200 })
  }
}
