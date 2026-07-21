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

  if (!storedOtp || !pendingNumber) {
    return NextResponse.json({ error: 'No active verification session found. Please request a new code.' }, { status: 400 })
  }

  if (Date.now() > expiry) {
    return NextResponse.json({ error: 'Verification code has expired. Please request a new code.' }, { status: 400 })
  }

  if (storedOtp !== otp.trim()) {
    return NextResponse.json({ error: 'Incorrect verification code. Please try again.' }, { status: 400 })
  }

  try {
    // 1. Update/Upsert the user profile row in the `users` table
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        user_id: authUser.id,
        email: authUser.email || '',
        whatsapp_number: pendingNumber,
        whatsapp_verified: true,
        whatsapp_opted_out: false,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (dbError) {
      console.error('[OTP DB update error]', dbError)
      return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 })
    }

    // 2. Clear OTP metadata from auth user
    await supabase.auth.admin.updateUserById(authUser.id, {
      user_metadata: {
        ...metadata,
        whatsapp_verification_otp: null,
        whatsapp_pending_number: null,
        whatsapp_otp_expiry: null
      }
    })

    return NextResponse.json({ success: true, message: 'WhatsApp number successfully verified!' })
  } catch (err: any) {
    console.error('[OTP verify internal error]', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
