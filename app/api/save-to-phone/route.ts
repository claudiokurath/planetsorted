import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'

export async function POST(req: NextRequest) {
  const { slug } = await req.json()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: { user: authUser } } = await supabase.auth.getUser(
    req.headers.get('authorization')?.replace('Bearer ', '') ?? ''
  )
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
