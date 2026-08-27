import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createSessionClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'
import type { User, Protocol } from '@/lib/types/database'
import { getContentDeliveryUrl } from '@/lib/content/deliveryUrl'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug } = body
    // Constrain to the slug shape used throughout the site. This also keeps the
    // value safe to interpolate into the link we send out.
    if (typeof slug !== 'string' || !/^[a-z0-9-]{1,100}$/.test(slug)) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    // Identify the caller from their session cookies. The previous version
    // called getUser() on a service-role client, which carries no session, so
    // no member was ever resolved and the caller-supplied `phone` was the only
    // route through — turning this into an open relay that would send a
    // WhatsApp from the SOR7ED Business number to any number on request.
    const session = await createSessionClient()
    const { data: { user } } = await session.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to send this to your WhatsApp.' }, { status: 401 })
    }

    // Service-role client for the reads below, now that we know who is asking.
    const supabase = createServerClient()

    // The destination always comes from the signed-in member's own verified
    // number. A number supplied in the request body is deliberately ignored.
    const { data: rawProfile } = await supabase
      .from('users')
      .select('whatsapp_number, whatsapp_verified, whatsapp_opted_out')
      .eq('user_id', user.id)
      .single()

    const profile = rawProfile as Pick<
      User,
      'whatsapp_number' | 'whatsapp_verified' | 'whatsapp_opted_out'
    > | null

    if (!profile?.whatsapp_verified || !profile?.whatsapp_number) {
      return NextResponse.json({ error: 'Please verify your WhatsApp number in your dashboard settings first.' }, { status: 403 })
    }

    // Honour STOP — never message a number that has opted out, even if verified.
    if (profile.whatsapp_opted_out) {
      return NextResponse.json({ error: 'This number has opted out of WhatsApp messages.' }, { status: 403 })
    }

    // Format phone number to international E.164 without spaces/dashes
    let cleanPhone = profile.whatsapp_number.replace(/[^\d+]/g, '')
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '+44' + cleanPhone.slice(1)
      } else {
        cleanPhone = '+' + cleanPhone
      }
    }

    const { data: rawContent } = await supabase
      .from('protocols')
      .select('title, slug, type, gamma_url')
      .eq('slug', slug)
      .eq('status', 'Published')
      .single()

    const content = rawContent as Pick<Protocol, 'title' | 'slug' | 'type' | 'gamma_url'> | null

    const title = content?.title || slug.toUpperCase().replace(/-/g, ' ')
    const richUrl = getContentDeliveryUrl(SITE, {
      slug,
      type: content?.type,
      gammaUrl: content?.gamma_url,
    })
    const messageBody = `Here is your link for *${title}* from SOR7ED:\n\n${richUrl}`

    // Send directly from Business WhatsApp Meta API
    await sendWhatsAppMessage(cleanPhone, messageBody, richUrl)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[send-protocol-link error]', err)
    return NextResponse.json({ error: 'Failed to send WhatsApp message' }, { status: 500 })
  }
}
