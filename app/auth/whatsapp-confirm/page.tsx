import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { verifyConnectToken } from '@/lib/crypto/tokens'
import { safeNext } from '@/lib/safeNext'
import { scheduleCrmSync } from '@/lib/notion/syncCrmAccount'
import { matchesPendingSignInToken } from '@/lib/whatsapp/signInLink'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export const metadata = { title: 'Verify WhatsApp — SOR7ED' }

export default async function WhatsAppConfirmPage({ searchParams }: Props) {
  const { token = '' } = await searchParams
  // The approved card's button predates the primary-domain switch. Finish on
  // planetsorted.com so the session belongs to the site the member is using.
  const site = process.env.SITE_URL ?? 'https://planetsorted.com'
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host')
  if (host && host.replace(/^www\./, '') !== new URL(site).host.replace(/^www\./, '')) {
    redirect(`${site}/auth/whatsapp-confirm?${new URLSearchParams({ token })}`)
  }
  const verified = verifyConnectToken(token)

  if (!verified.ok) {
    return <VerificationMessage title="Link expired." body="Return to sign in and send yourself a fresh WhatsApp link." href="/signup" label="Back to sign in" />
  }

  const admin = createServerClient()
  const { data: authResult } = await admin.auth.admin.getUserById(verified.userId)
  const authUser = authResult.user
  const phone = String(authUser?.app_metadata?.pending_whatsapp_number ?? '')
  const nextPath = safeNext(String(authUser?.app_metadata?.pending_signup_next ?? ''))

  if (!authUser || !/^\d{10,15}$/.test(phone) || !matchesPendingSignInToken(token, authUser.app_metadata?.pending_signin_token_digest)) {
    return <VerificationMessage title="Link expired." body="Return to sign in and send yourself a fresh WhatsApp link." href="/signup" label="Back to sign in" />
  }

  const { data: phoneOwner, error: phoneLookupError } = await admin
    .from('users')
    .select('user_id, whatsapp_opted_out')
    .eq('whatsapp_number', phone)
    .maybeSingle()

  if (phoneLookupError) {
    return <VerificationMessage title="Could not sign in." body="Please return to sign in and try again." href="/signup?mode=returning" label="Back to sign in" />
  }

  if (phoneOwner?.user_id && phoneOwner.user_id !== authUser.id) {
    return <VerificationMessage title="Already connected." body="That WhatsApp number belongs to another SOR7ED account." href="/signup" label="Try another account" />
  }

  const profileValues = {
    first_name: authUser.user_metadata?.first_name || '',
    email: authUser.email || '',
    whatsapp_number: phone,
    whatsapp_verified: true,
    whatsapp_opted_out: phoneOwner?.whatsapp_opted_out ?? false,
  }

  const { data: updated, error: profileError } = await admin
    .from('users')
    .update(profileValues)
    .eq('user_id', authUser.id)
    .select('user_id')

  if (profileError) {
    return <VerificationMessage title="Could not sign in." body="Please return to sign in and try again." href="/signup?mode=returning" label="Back to sign in" />
  }

  if (!updated?.length) {
    const { error: insertError } = await admin.from('users').insert({
      user_id: authUser.id,
      ...profileValues,
      weekly_opted_in: false,
    })
    if (insertError) {
      return <VerificationMessage title="Could not connect." body="Please return to sign in and try again." href="/signup" label="Back to sign in" />
    }
  }

  // An email-linked member is still signing in through WhatsApp. Never send
  // them to an email inbox where this flow has not sent a message.
  if (!authUser.email) {
    return <VerificationMessage title="Could not sign in." body="Please return to sign in and try again." href="/signup?mode=returning" label="Back to sign in" />
  }
  const { data: login, error: loginError } = await admin.auth.admin.generateLink({ type: 'magiclink', email: authUser.email })
  if (loginError || !login.properties?.hashed_token) {
    return <VerificationMessage title="Could not sign in." body="Please return to sign in and try again." href="/signup?mode=returning" label="Back to sign in" />
  }

  const { error: consumeError } = await admin.auth.admin.updateUserById(authUser.id, {
    app_metadata: {
      ...authUser.app_metadata,
      pending_whatsapp_number: null,
      pending_signup_next: null,
      pending_signin_token_digest: null,
    },
  })

  if (consumeError) {
    return <VerificationMessage title="Could not sign in." body="Please return to sign in and try again." href="/signup?mode=returning" label="Back to sign in" />
  }
  scheduleCrmSync(authUser.id)
  const params = new URLSearchParams({ token_hash: login.properties.hashed_token, type: 'magiclink', next: nextPath })
  redirect(`/auth/callback?${params}`)
}

function VerificationMessage({ title, body, href, label }: { title: string; body: string; href: string; label: string }) {
  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-black p-6 text-white">
      <div className="w-full max-w-lg rounded-none border border-white/10 bg-black p-8 sm:p-10">
        <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-[#FFBA2E]">SOR7ED verification</p>
        <h1 className="font-bebas mt-4 text-4xl uppercase leading-[1.15] sm:text-5xl">{title}</h1>
        <p className="mt-5 text-sm leading-6 text-neutral-400 sm:text-base">{body}</p>
        <Link href={href} className="mt-8 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[#FFBA2E] px-6 text-sm font-normal uppercase tracking-wider text-black">
          {label} →
        </Link>
      </div>
    </main>
  )
}
