import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import { buildConnectToken, CONNECT_TOKEN_TTL_SECONDS } from '@/lib/crypto/tokens'
import { sendWhatsAppSignInLink, signInTokenDigest } from '@/lib/whatsapp/signInLink'
import { safeNext } from '@/lib/safeNext'
import { scheduleCrmSync } from '@/lib/notion/syncCrmAccount'
import { createPendingSignup, matchesPendingSignupSecret, parsePendingSignupCookie, pendingSignupForPhone, PENDING_SIGNUP_COOKIE } from '@/lib/auth/pendingSignup'
import { websiteSiteUrl } from '@/lib/siteUrl'

const SITE = websiteSiteUrl()
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

  const existingOnly = data.existingOnly === true

  if (!phone) return NextResponse.json({ error: 'Please enter a valid WhatsApp number.' }, { status: 400 })
  if (data.email && !submittedEmail) return NextResponse.json({ error: 'Please check the email address.' }, { status: 400 })

  const admin = createServerClient()
  const { data: phoneOwner, error: phoneLookupError } = await admin
    .from('users')
    .select('user_id, email')
    .eq('whatsapp_number', phone)
    .maybeSingle()

  if (phoneLookupError) {
    return NextResponse.json({ error: 'We could not check your account. Please try again.' }, { status: 502 })
  }

  let userId = phoneOwner?.user_id
  let authEmail = phoneOwner?.email || submittedEmail || `${phone}@users.planetsorted.com`
  let pendingCookie: { value: string; expiresAt: number } | null = null
  function respond(payload: object, status = 200) {
    const response = NextResponse.json(payload, { status })
    if (pendingCookie) response.cookies.set(PENDING_SIGNUP_COOKIE, pendingCookie.value, {
      httpOnly: true,
      secure: req.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.max(0, Math.floor((pendingCookie.expiresAt - Date.now()) / 1000)),
    })
    return response
  }

  if (!userId) {
    if (existingOnly) {
      return NextResponse.json(
        { error: 'No account is linked to that number yet. Try your email, or create your account first.' },
        { status: 404 }
      )
    }
    if (!firstName) return NextResponse.json({ error: 'Please enter your first name.' }, { status: 400 })
    const retry = parsePendingSignupCookie(req.cookies.get(PENDING_SIGNUP_COOKIE)?.value)
    if (retry) {
      const { data: retried, error: retryError } = await admin.auth.admin.getUserById(retry.userId)
      const retryUser = retried.user
      const marker = pendingSignupForPhone(retryUser?.app_metadata?.pending_signup_identity, phone)
      if (!retryError && retryUser?.email === authEmail && !retryUser.email_confirmed_at &&
          !retryUser.confirmed_at && !retryUser.last_sign_in_at && marker && matchesPendingSignupSecret(marker, retry.secret)) {
        const { data: linkedProfile, error: profileError } = await admin.from('users')
          .select('user_id').eq('user_id', retryUser.id).maybeSingle()
        if (profileError) return respond({ error: 'We could not check your account. Please try again.' }, 502)
        if (!linkedProfile) userId = retryUser.id
      }
    }
    if (!userId) {
      const { marker, secret } = createPendingSignup(phone)
      // generateLink also returns existing email identities. Creating explicitly
      // prevents an unproven email from authorizing a new WhatsApp login method.
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: authEmail,
        email_confirm: false,
        user_metadata: { first_name: firstName },
        app_metadata: { pending_signup_identity: marker },
      })
      if (createError || !created.user?.id) {
        const alreadyRegistered = createError?.code === 'email_exists' ||
          /already.*(?:exist|registered)|(?:email|user).*already/i.test(createError?.message ?? '')
        return respond({ error: alreadyRegistered
          ? 'That email is already linked to an account. Choose Returning member, then Email to sign in before connecting another number.'
          : 'We could not start sign-up just now. Please try again in a moment.' }, alreadyRegistered ? 409 : 502)
      }
      userId = created.user.id
      authEmail = created.user.email || authEmail
      pendingCookie = { value: `${userId}.${secret}`, expiresAt: marker.expires_at }
    }
  }

  const { data: authUserResult, error: lookupError } = await admin.auth.admin.getUserById(userId)
  if (lookupError || !authUserResult.user) {
    return respond({ error: 'We could not start sign-up. Please try again.' }, 500)
  }

  const authUser = authUserResult.user
  const lastSentAt = Number(authUser.app_metadata?.signup_links_sent_at ?? 0)
  if (lastSentAt && Date.now() - lastSentAt < RESEND_WINDOW_MS) {
    return respond({ error: 'Your links were just sent. Please wait a minute before trying again.' }, 429)
  }

  const { token } = buildConnectToken(userId, CONNECT_TOKEN_TTL_SECONDS)
  const { error: metadataError } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...authUser.app_metadata,
      pending_whatsapp_number: phone,
      pending_signup_next: nextPath,
      pending_signin_token_digest: signInTokenDigest(token),
      signup_links_sent_at: Date.now(),
    },
  })
  if (metadataError) {
    return respond({ error: 'We could not prepare your verification links.' }, 500)
  }

  scheduleCrmSync(userId)

  let whatsappSent = false
  try {
    await sendWhatsAppSignInLink(phone, token, SITE)
    whatsappSent = true
  } catch {
    // A broken WhatsApp provider must not suppress an independently requested
    // email backup. Keep the phone unverified until its own proof completes.
  }

  let emailSent = false
  if (submittedEmail && !authEmail.endsWith('@users.planetsorted.com')) {
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    try {
      const { error: emailError } = await anon.auth.signInWithOtp({
        email: authEmail,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${SITE}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      })
      if (emailError) console.error('[Unified signup email] Provider rejected the sign-in request')
      else emailSent = true
    } catch {
      console.error('[Unified signup email] Provider could not be reached')
    }
  }
  if (!whatsappSent && !emailSent) {
    return respond({ error: 'WhatsApp sign-in is temporarily unavailable. If you added an email backup, try Returning member → Email. Otherwise please try again later.' }, 502)
  }

  return respond({ sent: true, emailSent, whatsappSent })
}
