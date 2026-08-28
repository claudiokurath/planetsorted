import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import { buildConnectToken, CONNECT_TOKEN_TTL_SECONDS } from '@/lib/crypto/tokens'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'
import { safeNext } from '@/lib/safeNext'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
const RESEND_WINDOW_MS = 60 * 1000

function cleanName(value: unknown): string {
  return String(value ?? '').trim().slice(0, 40).replace(/[^\p{L}\p{N}\s'-]/gu, '')
}

function cleanEmail(value: unknown): string {
  const email = String(value ?? '').trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ''
}

function cleanPhone(countryCode: unknown, phone: unknown): string {
  const code = String(countryCode ?? '').replace(/\D/g, '')
  let national = String(phone ?? '').replace(/\D/g, '')
  if (national.startsWith('0')) national = national.slice(1)
  const combined = `${code}${national}`
  return /^\d{10,15}$/.test(combined) ? combined : ''
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Please complete the form.' }, { status: 400 })
  }

  const data = body as Record<string, unknown>
  const firstName = cleanName(data.firstName)
  const submittedEmail = cleanEmail(data.email)
  const phone = cleanPhone(data.countryCode, data.phone)
  const nextPath = safeNext(typeof data.next === 'string' ? data.next : undefined)

  if (!firstName) return NextResponse.json({ error: 'Please enter your first name.' }, { status: 400 })
  if (!phone) return NextResponse.json({ error: 'Please enter a valid WhatsApp number.' }, { status: 400 })
  if (data.email && !submittedEmail) return NextResponse.json({ error: 'Please check the email address.' }, { status: 400 })

  const admin = createServerClient()
  const { data: phoneOwner } = await admin
    .from('users')
    .select('user_id, email')
    .eq('whatsapp_number', phone)
    .maybeSingle()

  let userId = phoneOwner?.user_id
  let authEmail = phoneOwner?.email || submittedEmail || `${phone}@users.planetsorted.com`

  if (!userId) {
    const { data: generated, error: generateError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: authEmail,
      options: {
        redirectTo: `${SITE}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        data: { first_name: firstName },
      },
    })

    if (generateError || !generated.user?.id) {
      // Distinguish a genuine "this email is already registered" from a backend
      // failure (bad config, Supabase outage) — the old code reported both as a
      // conflict, which sent people chasing an account problem that wasn't real.
      const alreadyRegistered =
        (generateError as { status?: number } | null)?.status === 422 ||
        /already|exist|registered/i.test(generateError?.message ?? '')

      return NextResponse.json(
        {
          error: alreadyRegistered
            ? 'That email is already linked to an account. Use "Returning email-only member? Sign in here" below.'
            : 'We could not start sign-up just now. Please try again in a moment.',
        },
        { status: alreadyRegistered ? 409 : 502 }
      )
    }
    userId = generated.user.id
    authEmail = generated.user.email || authEmail
  }

  const { data: authUserResult, error: lookupError } = await admin.auth.admin.getUserById(userId)
  if (lookupError || !authUserResult.user) {
    return NextResponse.json({ error: 'We could not start sign-up. Please try again.' }, { status: 500 })
  }

  const authUser = authUserResult.user
  const lastSentAt = Number(authUser.app_metadata?.signup_links_sent_at ?? 0)
  if (lastSentAt && Date.now() - lastSentAt < RESEND_WINDOW_MS) {
    return NextResponse.json({ error: 'Your links were just sent. Please wait a minute before trying again.' }, { status: 429 })
  }

  const { error: metadataError } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: { ...authUser.user_metadata, first_name: firstName },
    app_metadata: {
      ...authUser.app_metadata,
      pending_whatsapp_number: phone,
      pending_signup_next: nextPath,
      signup_links_sent_at: Date.now(),
    },
  })
  if (metadataError) {
    return NextResponse.json({ error: 'We could not prepare your verification links.' }, { status: 500 })
  }

  const { token } = buildConnectToken(userId, CONNECT_TOKEN_TTL_SECONDS)
  const whatsappLink = `${SITE}/auth/whatsapp-confirm?token=${encodeURIComponent(token)}`

  try {
    await sendWhatsAppMessage(
      phone,
      `VERIFY YOUR WHATSAPP\n\nTap this private link once to connect your number to SOR7ED:\n${whatsappLink}`
    )
  } catch {
    return NextResponse.json({ error: 'We could not reach that WhatsApp number. Please check it and try again.' }, { status: 502 })
  }

  const emailSent = Boolean(submittedEmail && !authEmail.endsWith('@users.planetsorted.com'))
  if (emailSent) {
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error: emailError } = await anon.auth.signInWithOtp({
      email: authEmail,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${SITE}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    })
    if (emailError) console.error('[Unified signup email error]', emailError)
  }

  return NextResponse.json({ sent: true, emailSent })
}
