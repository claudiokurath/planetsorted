import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { generateOtp, hashOtp } from '@/lib/crypto/tokens'
import { reserveOtpChallenge, sendOtpCode } from '@/lib/whatsapp/otp'

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
    typeof body === 'object' && body !== null && 'whatsappNumber' in body &&
    typeof body.whatsappNumber === 'string'
      ? body.whatsappNumber
      : ''

  if (!/^\d{10,15}$/.test(whatsappNumber)) {
    return NextResponse.json(
      { error: 'Please enter a valid WhatsApp number including country code (e.g. 447591922247)' },
      { status: 400 }
    )
  }

  const phoneNumberId = process.env.META_PHONE_NUMBER_ID
  const token = process.env.META_WHATSAPP_TOKEN
  if (!phoneNumberId || !token) {
    console.error('[WhatsApp OTP] Server configuration is unavailable')
    return NextResponse.json(
      { error: 'WhatsApp is temporarily unavailable. Please try again later.' },
      { status: 503 }
    )
  }

  try {
    // Only the HMAC is passed to storage. The plaintext code is used solely
    // in the approved authentication template sent to Meta.
    const otp = generateOtp()
    const reservation = await reserveOtpChallenge(
      supabase, authUser.id, whatsappNumber, hashOtp(otp, authUser.id)
    )
    if (reservation.outcome === 'cooldown') {
      return NextResponse.json(
        { error: 'Please wait a minute before requesting another code.' },
        { status: 429 }
      )
    }
    if (reservation.outcome === 'limit') {
      return NextResponse.json(
        { error: 'Too many verification codes requested. Please try again later.' },
        { status: 429 }
      )
    }

    // A rejected/uncertain request retains its reservation and send counters.
    // Releasing them here would permit retry loops and duplicate messages.
    const outcome = await sendOtpCode(whatsappNumber, otp, {
      phoneNumberId,
      token,
      templateName: process.env.WHATSAPP_OTP_TEMPLATE?.trim() || 'sor7ed_auth',
      language: process.env.WHATSAPP_CONTENT_CARD_LANGUAGE?.trim() || 'en_GB',
    })
    if (outcome === 'accepted') {
      return NextResponse.json({
        success: true,
        state: 'accepted',
        message: 'Verification code sent to WhatsApp.',
      })
    }
    if (outcome === 'unknown') {
      console.error('[WhatsApp OTP] Message acceptance could not be confirmed')
      return NextResponse.json(
        {
          state: 'unknown',
          error: 'We could not confirm whether your code was sent. If it arrives, enter it. Otherwise wait a minute before requesting another code.',
        },
        { status: 503 }
      )
    }
    console.error('[WhatsApp OTP] Authentication template was rejected')
    return NextResponse.json(
      { state: 'rejected', error: 'Could not send your WhatsApp code. Please check the number and try again after a minute.' },
      { status: 502 }
    )
  } catch {
    console.error('[WhatsApp OTP] Verification session could not be created')
    return NextResponse.json(
      { error: 'Could not create your verification session. Please try again later.' },
      { status: 503 }
    )
  }
}
