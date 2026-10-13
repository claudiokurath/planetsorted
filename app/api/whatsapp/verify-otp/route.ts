import { scheduleCrmSync } from '@/lib/notion/syncCrmAccount'
import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { hashOtp } from '@/lib/crypto/tokens'
import { verifyOtpChallenge } from '@/lib/whatsapp/otp'

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

  const otp =
    typeof body === 'object' && body !== null && 'otp' in body &&
    typeof body.otp === 'string'
      ? body.otp.trim()
      : ''

  if (!/^\d{6}$/.test(otp)) {
    return NextResponse.json(
      { error: 'Please enter a valid 6-digit code' },
      { status: 400 }
    )
  }

  try {
    // The database transaction checks the stored digest under a row lock,
    // counts failures, links the number and consumes the challenge together.
    // Browser-supplied phone/user/profile values never decide the owner.
    const outcome = await verifyOtpChallenge(
      supabase,
      authUser.id,
      hashOtp(otp, authUser.id),
      typeof authUser.user_metadata?.first_name === 'string'
        ? authUser.user_metadata.first_name
        : '',
      authUser.email || ''
    )
    switch (outcome) {
      case 'verified':
        try {
          scheduleCrmSync(authUser.id)
        } catch {
          // Verification has committed. A background scheduling failure must
          // not present it as failed; CRM reconciliation can retry separately.
          console.error('[WhatsApp OTP] CRM reconciliation will retry')
        }
        return NextResponse.json({
          success: true,
          message: 'WhatsApp number successfully verified!',
        })
      case 'missing':
        return NextResponse.json(
          { error: 'No active verification session found. Please request a new code.' },
          { status: 400 }
        )
      case 'expired':
        return NextResponse.json(
          { error: 'Verification code has expired. Please request a new code.' },
          { status: 400 }
        )
      case 'limit':
        return NextResponse.json(
          { error: 'Too many incorrect attempts. Please request a new code.' },
          { status: 429 }
        )
      case 'incorrect':
        return NextResponse.json(
          { error: 'Incorrect verification code. Please try again.' },
          { status: 400 }
        )
      case 'conflict':
        return NextResponse.json(
          { error: 'This WhatsApp number is already linked to a different account.' },
          { status: 409 }
        )
    }
  } catch {
    console.error('[WhatsApp OTP] Verification session could not be checked')
    return NextResponse.json(
      { error: 'Could not verify your WhatsApp number. Please try again later.' },
      { status: 503 }
    )
  }
}
