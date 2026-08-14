import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  
  // Get authenticated user
  const { data: { user: authUser } } = await supabase.auth.getUser(
    req.headers.get('authorization')?.replace('Bearer ', '') ?? ''
  )
  
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { otp } = await req.json()
  if (!otp || otp.length !== 6) {
    return NextResponse.json({ error: 'Please enter a valid 6-digit code' }, { status: 400 })
  }

  const metadata = authUser.user_metadata || {}
  const storedOtp = metadata.whatsapp_verification_otp
  const pendingNumber = metadata.whatsapp_pending_number
  const expiry = metadata.whatsapp_otp_expiry
  const attempts = metadata.whatsapp_otp_attempts ?? 0
  const MAX_ATTEMPTS = 5

  if (!storedOtp || !pendingNumber) {
    return NextResponse.json({ error: 'No active verification session found. Please request a new code.' }, { status: 400 })
  }

  if (Date.now() > expiry) {
    return NextResponse.json({ error: 'Verification code has expired. Please request a new code.' }, { status: 400 })
  }

  if (attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Too many incorrect attempts. Please request a new code.' }, { status: 429 })
  }

  if (storedOtp !== otp.trim()) {
    await supabase.auth.admin.updateUserById(authUser.id, {
      user_metadata: { ...metadata, whatsapp_otp_attempts: attempts + 1 }
    })
    return NextResponse.json({ error: 'Incorrect verification code. Please try again.' }, { status: 400 })
  }

  try {
    // 1. Update the user profile row in the `users` table.
    //    `update` rather than `upsert`: an upsert of a partial row would reset
    //    weekly_opted_in / first_name to defaults every time an existing user
    //    re-verifies their number. `.select()` lets us detect the no-row case,
    //    which a bare update would silently report as success.
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
      return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 })
    }

    if (!updatedRows || updatedRows.length === 0) {
      // No row for this account yet. Conflict is resolved on `whatsapp_number` (a real
      // unique constraint) so that verifying a number already claimed by an earlier
      // WhatsApp-first signup links it to this account instead of failing on the
      // unique index. `user_id` is nullable and NOT unique, so it can't be the target.
      const { error: insertError } = await supabase.from('users').upsert({
        user_id: authUser.id,
        first_name: authUser.user_metadata?.first_name || '',
        email: authUser.email || '',
        whatsapp_number: pendingNumber,
        whatsapp_verified: true,
        weekly_opted_in: false,
        whatsapp_opted_out: false,
      }, { onConflict: 'whatsapp_number' })

      if (insertError) {
        console.error('[OTP DB insert error]', insertError)
        return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 })
      }
    }

    // 2. Clear OTP metadata from auth user
    await supabase.auth.admin.updateUserById(authUser.id, {
      user_metadata: {
        ...metadata,
        whatsapp_verification_otp: null,
        whatsapp_pending_number: null,
        whatsapp_otp_expiry: null,
        whatsapp_otp_attempts: null
      }
    })

    return NextResponse.json({ success: true, message: 'WhatsApp number successfully verified!' })
  } catch (err) {
    console.error('[OTP verify internal error]', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
