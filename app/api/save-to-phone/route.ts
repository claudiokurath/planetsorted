import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createSessionClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage, sendWhatsAppAudio } from '@/lib/whatsapp/send'
import { splitIntoChunks } from '@/lib/whatsapp/splitIntoChunks'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
const SAFE_LIMIT = 3500

export async function POST(req: NextRequest) {
  try {
    // Identify the caller from their session cookies — a service-role client
    // (createServerClient) carries no session, so getUser() on it always
    // resolves to null. Same fix already applied in send-protocol-link/route.ts.
    const session = await createSessionClient()
    const { data: { user } } = await session.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await req.json()
    const slug = typeof body?.slug === 'string' ? body.slug : ''
    // Default true: one rich-link card is the product. Callers that still
    // want the full protocol dump can pass includeProtocol: true.
    const includeLink = body?.includeLink !== false
    const includeProtocol = body?.includeProtocol === true
    const includeAudio = body?.includeAudio === true
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

    // Service-role client for the reads below, now that we know who is asking.
    const supabase = createServerClient()
    const { data: profile } = await supabase
      .from('users')
      .select('whatsapp_number, whatsapp_verified, whatsapp_opted_out')
      .eq('user_id', user.id)
      .single()

    if (!profile?.whatsapp_verified || !profile?.whatsapp_number) {
      return NextResponse.json({ error: 'WhatsApp not verified' }, { status: 403 })
    }
    // Honour STOP — never push to a number that has opted out, even if verified
    if (profile.whatsapp_opted_out) {
      return NextResponse.json({ error: 'Number has opted out of WhatsApp messages' }, { status: 403 })
    }

    const { data: content } = await supabase
      .from('protocols')
      .select('title, protocol, audio_url, slug')
      .eq('slug', slug)
      .eq('status', 'Published')
      .single()

    if (!content) return NextResponse.json({ error: 'Content not found' }, { status: 404 })

    // Default path: ONE rich-link card. Sending the URL body twice (card +
    // protocol dump) was the "two messages" bug in WhatsApp.
    if (includeLink) {
      const richUrl = `${SITE}/r/${content.slug}`
      await sendWhatsAppMessage(profile.whatsapp_number, richUrl, richUrl)
    }

    // Opt-in full protocol text (legacy / power-user). Off by default.
    if (includeProtocol && content.protocol) {
      const text = `*${content.title}*\n\n${content.protocol}`
      if (text.length <= SAFE_LIMIT) {
        await sendWhatsAppMessage(profile.whatsapp_number, text)
      } else {
        for (const chunk of splitIntoChunks(text, SAFE_LIMIT)) {
          await sendWhatsAppMessage(profile.whatsapp_number, chunk)
        }
      }
    }

    if (includeAudio && content.audio_url) {
      await sendWhatsAppAudio(profile.whatsapp_number, content.audio_url)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    // Surface WHY it failed — especially the 24-hour-window/template case —
    // instead of a generic 500 that hides the real reason.
    const message = err?.message ?? 'Unknown error'
    const isWindowClosed = /re-?engagement|template|window/i.test(message)
    console.error('[save-to-phone error]', message)
    return NextResponse.json(
      {
        error: isWindowClosed
          ? 'This member has not messaged us recently — a template message is required. See the fallback plan.'
          : 'Internal error',
      },
      { status: 500 }
    )
  }
}
