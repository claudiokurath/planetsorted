import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'

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

  const metadata = authUser.user_metadata || {}
  const storedOtp = metadata.whatsapp_verification_otp
  const pendingNumber = metadata.whatsapp_pending_number
  const expiry = Number(metadata.whatsapp_otp_expiry ?? 0)
  const attempts = Number(metadata.whatsapp_otp_attempts ?? 0)

  if (!storedOtp || !pendingNumber) {
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

  if (storedOtp !== otp) {
    await supabase.auth.admin.updateUserById(authUser.id, {
      user_metadata: { ...metadata, whatsapp_otp_attempts: attempts + 1 },
    })
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

    await supabase.auth.admin.updateUserById(authUser.id, {
      user_metadata: {
        ...metadata,
        whatsapp_verification_otp: null,
        whatsapp_pending_number: null,
        whatsapp_otp_expiry: null,
        whatsapp_otp_attempts: null,
      },
    })

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
