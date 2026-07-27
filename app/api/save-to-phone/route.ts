import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'

export async function POST(req: NextRequest) {
  // Use cookie-based auth — the browser sends session cookies automatically
  // on same-origin fetch calls; reading from an Authorization header would
  // require SaveToPhoneButton to explicitly attach a token, which it does not.
  const supabase = createServerClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await req.json()

  const { data: profile } = await supabase
    .from('users').select('whatsapp_number, whatsapp_verified').eq('user_id', authUser.id).single()

  if (!profile?.whatsapp_verified || !profile.whatsapp_number) {
    return NextResponse.json({ error: 'WhatsApp not verified' }, { status: 400 })
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
  const url = `${site}/r/${slug}`
  await sendWhatsAppMessage(profile.whatsapp_number, `Here you go 👇\n${url}`, url)
  return NextResponse.json({ status: 'sent' })
}
