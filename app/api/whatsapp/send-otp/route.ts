import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  
  // Get authenticated user
  const { data: { user: authUser } } = await supabase.auth.getUser(
    req.headers.get('authorization')?.replace('Bearer ', '') ?? ''
  )
  
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { whatsappNumber } = await req.json()
  if (!whatsappNumber || !/^\d{10,15}$/.test(whatsappNumber)) {
    return NextResponse.json({ error: 'Please enter a valid WhatsApp number including country code (e.g. 447360277713)' }, { status: 400 })
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  try {
    // Store OTP and pending number in auth user_metadata using admin role
    const { error: updateError } = await supabase.auth.admin.updateUserById(authUser.id, {
      user_metadata: {
        whatsapp_verification_otp: otp,
        whatsapp_pending_number: whatsappNumber,
        whatsapp_otp_expiry: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
      }
    })

    if (updateError) {
      console.error('[OTP storage error]', updateError)
      return NextResponse.json({ error: 'Failed to generate verification session' }, { status: 500 })
    }

    // Send OTP to user's WhatsApp number
    const messageBody = `Your Planet Sorted verification code is: ${otp}\n\nThis code will expire in 10 minutes.`
    await sendWhatsAppMessage(whatsappNumber, messageBody)

    return NextResponse.json({ success: true, message: 'OTP sent successfully' })
  } catch (err: any) {
    console.error('[OTP send error]', err)
    return NextResponse.json({ error: 'Failed to send WhatsApp message. Please check the number and try again.' }, { status: 500 })
  }
}
