import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, phone } = body
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    let targetPhone = phone?.trim()

    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user && !targetPhone) {
      const { data: profile } = await supabase
        .from('users')
        .select('whatsapp_number')
        .eq('user_id', user.id)
        .single()
      targetPhone = profile?.whatsapp_number
    }

    if (!targetPhone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
    }

    // Format phone number to international E.164 without spaces/dashes
    let cleanPhone = targetPhone.replace(/[^\d+]/g, '')
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '+44' + cleanPhone.slice(1)
      } else {
        cleanPhone = '+' + cleanPhone
      }
    }

    const { data: content } = await supabase
      .from('protocols')
      .select('title, slug')
      .eq('slug', slug)
      .eq('status', 'Published')
      .single()

    const title = content?.title || slug.toUpperCase().replace(/-/g, ' ')
    const richUrl = `${SITE}/r/${slug}`
    const messageBody = `Here is your link for *${title}* from PLANET SOR7ED:\n\n${richUrl}`

    // Send directly from Business WhatsApp Meta API
    await sendWhatsAppMessage(cleanPhone, messageBody, richUrl)

    return NextResponse.json({ success: true, phone: cleanPhone })
  } catch (err: any) {
    console.error('[send-protocol-link error]', err)
    return NextResponse.json({ error: 'Failed to send WhatsApp message' }, { status: 500 })
  }
}
