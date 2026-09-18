import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { hashOtp, timingSafeEqualHex } from '@/lib/crypto/tokens'

const MAX_ATTEMPTS = 5

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
    typeof body === 'object' && body !== null && 'otp' in body
      ? String((body as { otp?: unknown }).otp ?? '').trim()
      : ''

  if (!/^\d{6}$/.test(otp)) {
    return NextResponse.json(
      { error: 'Please enter a valid 6-digit code' },
      { status: 400 }
    )
  }

  // The challenge lives in a service-role-only table. It used to sit in
  // user_metadata, where the browser could read the code straight out of the
  // access token and verify a number it did not control.
  const { data: challenge } = await supabase
    .from('whatsapp_otp_challenges')
    .select('phone, otp_hash, expires_at, attempts')
    .eq('user_id', authUser.id)
    .maybeSingle()

  const storedHash = challenge?.otp_hash
  const pendingNumber = challenge?.phone
  const expiry = challenge?.expires_at ? Date.parse(challenge.expires_at) : 0
  const attempts = challenge?.attempts ?? 0

  if (!storedHash || !pendingNumber) {
    return NextResponse.json(
      {
        error:
          'No active verification session found. Please request a new code.',
      },
      { status: 400 }
    )
  }

  if (!expiry || Date.now() > expiry) {
    return NextResponse.json(
      { error: 'Verification code has expired. Please request a new code.' },
      { status: 400 }
    )
  }

  if (attempts >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: 'Too many incorrect attempts. Please request a new code.' },
      { status: 429 }
    )
  }

  if (!timingSafeEqualHex(hashOtp(otp, authUser.id), storedHash)) {
    await supabase
      .from('whatsapp_otp_challenges')
      .update({ attempts: attempts + 1, updated_at: new Date().toISOString() })
      .eq('user_id', authUser.id)
    return NextResponse.json(
      { error: 'Incorrect verification code. Please try again.' },
      { status: 400 }
    )
  }

  try {
    // Refuse to steal a number already linked to a different account.
    const { data: existingOwner } = await supabase
      .from('users')
      .select('user_id')
      .eq('whatsapp_number', pendingNumber)
      .maybeSingle()

    if (
      existingOwner?.user_id &&
      existingOwner.user_id !== authUser.id
    ) {
      return NextResponse.json(
        {
          error:
            'This WhatsApp number is already linked to a different account.',
        },
        { status: 409 }
      )
    }

    // Update existing row for this account (do not upsert — avoids wiping
    // weekly_opted_in / first_name on re-verify).
    const { data: updatedRows, error: dbError } = await supabase
      .from('users')
      .update({
        whatsapp_number: pendingNumber,
        whatsapp_verified: true,
        whatsapp_opted_out: false,
      })
      .eq('user_id', authUser.id)
      .select('user_id')

    if (dbError) {
      console.error('[OTP DB update error]', dbError)
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      )
    }

    if (!updatedRows || updatedRows.length === 0) {
      // No profile row yet. Insert only — never upsert-on-phone, which could
      // reassign another account's row if the unique check above raced.
      const { error: insertError } = await supabase.from('users').insert({
        user_id: authUser.id,
        first_name: authUser.user_metadata?.first_name || '',
        email: authUser.email || '',
        whatsapp_number: pendingNumber,
        whatsapp_verified: true,
        weekly_opted_in: false,
        whatsapp_opted_out: false,
      })

      if (insertError) {
        console.error('[OTP DB insert error]', insertError)
        return NextResponse.json(
          {
            error:
              'This WhatsApp number is already linked to a different account.',
          },
          { status: 409 }
        )
      }
    }

    // Consume the challenge. The send-rate counters are deliberately left
    // intact so verifying cannot be used to reset the hourly allowance.
    await supabase
      .from('whatsapp_otp_challenges')
      .update({
        phone: null,
        otp_hash: null,
        expires_at: null,
        attempts: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', authUser.id)

    return NextResponse.json({
      success: true,
      message: 'WhatsApp number successfully verified!',
    })
  } catch (err) {
    console.error('[OTP verify internal error]', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
