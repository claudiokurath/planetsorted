import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'
import { generateOtp } from '@/lib/crypto/tokens'

const OTP_TTL_MS = 10 * 60 * 1000
const MIN_RESEND_INTERVAL_MS = 60 * 1000
const MAX_SENDS_PER_HOUR = 5

export async function POST(req: NextRequest) {
  const auth = await requireUser(req)
  if (!auth.user) return auth.error
  const { user: authUser, admin: supabase } = auth

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const whatsappNumber =
    typeof body === 'object' && body !== null && 'whatsappNumber' in body
      ? String((body as { whatsappNumber?: unknown }).whatsappNumber ?? '')
      : ''

  if (!whatsappNumber || !/^\d{10,15}$/.test(whatsappNumber)) {
    return NextResponse.json(
      {
        error:
          'Please enter a valid WhatsApp number including country code (e.g. 447591922247)',
      },
      { status: 400 }
    )
  }

  const metadata = authUser.user_metadata || {}
  const lastSentAt = Number(metadata.whatsapp_otp_last_sent_at ?? 0)
  const sendCount = Number(metadata.whatsapp_otp_send_count ?? 0)
  const sendWindowStart = Number(metadata.whatsapp_otp_send_window_start ?? 0)
  const now = Date.now()

  if (lastSentAt && now - lastSentAt < MIN_RESEND_INTERVAL_MS) {
    return NextResponse.json(
      { error: 'Please wait a minute before requesting another code.' },
      { status: 429 }
    )
  }

  const windowFresh = sendWindowStart && now - sendWindowStart < 60 * 60 * 1000
  const nextSendCount = windowFresh ? sendCount + 1 : 1
  const nextWindowStart = windowFresh ? sendWindowStart : now

  if (nextSendCount > MAX_SENDS_PER_HOUR) {
    return NextResponse.json(
      { error: 'Too many verification codes requested. Please try again later.' },
      { status: 429 }
    )
  }

  // Cryptographically secure 6-digit OTP (not Math.random).
  const otp = generateOtp()

  try {
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      authUser.id,
      {
        user_metadata: {
          ...metadata,
          whatsapp_verification_otp: otp,
          whatsapp_pending_number: whatsappNumber,
          whatsapp_otp_expiry: now + OTP_TTL_MS,
          whatsapp_otp_attempts: 0,
          whatsapp_otp_last_sent_at: now,
          whatsapp_otp_send_count: nextSendCount,
          whatsapp_otp_send_window_start: nextWindowStart,
        },
      }
    )

    if (updateError) {
      console.error('[OTP storage error]', updateError)
      return NextResponse.json(
        { error: 'Failed to generate verification session' },
        { status: 500 }
      )
    }

    const messageBody = `Your PLANET SOR7ED verification code is: ${otp}\n\nThis code will expire in 10 minutes.`
    await sendWhatsAppMessage(whatsappNumber, messageBody)

    return NextResponse.json({ success: true, message: 'OTP sent successfully' })
  } catch (err) {
    console.error('[OTP send error]', err)
    return NextResponse.json(
      {
        error:
          'Failed to send WhatsApp message. Please check the number and try again.',
      },
      { status: 500 }
    )
  }
}
