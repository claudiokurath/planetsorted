import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { verifyConnectToken } from '@/lib/crypto/tokens'
import { safeNext } from '@/lib/safeNext'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export const metadata = { title: 'Verify WhatsApp — SOR7ED' }

export default async function WhatsAppConfirmPage({ searchParams }: Props) {
  const { token = '' } = await searchParams
  const verified = verifyConnectToken(token)

  if (!verified.ok) {
    return <VerificationMessage title="Link expired." body="Return to sign in and send yourself a fresh WhatsApp link." href="/signup" label="Back to sign in" />
  }

  const admin = createServerClient()
  const { data: authResult } = await admin.auth.admin.getUserById(verified.userId)
  const authUser = authResult.user
  const phone = String(authUser?.app_metadata?.pending_whatsapp_number ?? '')
  const nextPath = safeNext(String(authUser?.app_metadata?.pending_signup_next ?? ''))

  if (!authUser || !/^\d{10,15}$/.test(phone)) {
    return <VerificationMessage title="Link expired." body="Return to sign in and send yourself a fresh WhatsApp link." href="/signup" label="Back to sign in" />
  }

  const { data: phoneOwner } = await admin
    .from('users')
    .select('user_id')
    .eq('whatsapp_number', phone)
    .maybeSingle()

  if (phoneOwner?.user_id && phoneOwner.user_id !== authUser.id) {
    return <VerificationMessage title="Already connected." body="That WhatsApp number belongs to another SOR7ED account." href="/signup" label="Try another account" />
  }

  const profileValues = {
    first_name: authUser.user_metadata?.first_name || '',
    email: authUser.email || '',
    whatsapp_number: phone,
    whatsapp_verified: true,
    whatsapp_opted_out: false,
  }

  const { data: updated } = await admin
    .from('users')
    .update(profileValues)
    .eq('user_id', authUser.id)
    .select('user_id')

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

  await admin.auth.admin.updateUserById(authUser.id, {
    app_metadata: {
      ...authUser.app_metadata,
      pending_whatsapp_number: null,
      pending_signup_next: null,
    },
  })

  if (authUser.email?.endsWith('@users.planetsorted.com')) {
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
    const { data: login } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: authUser.email,
      options: { redirectTo: `${site}/auth/callback?next=${encodeURIComponent(nextPath)}` },
    })
    if (login.properties?.action_link) redirect(login.properties.action_link)
  }

  return (
    <VerificationMessage
      title="WhatsApp verified."
      body="Now tap the email link we sent to finish signing in. You only do this once."
      href={nextPath}
      label="Return to SOR7ED"
    />
  )
}

function VerificationMessage({ title, body, href, label }: { title: string; body: string; href: string; label: string }) {
  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-black p-6 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-black p-8 sm:p-10">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#1FD7CF]">SOR7ED verification</p>
        <h1 className="font-bebas mt-4 text-7xl font-black uppercase leading-[0.84] sm:text-8xl">{title}</h1>
        <p className="mt-5 text-sm leading-6 text-neutral-400 sm:text-base">{body}</p>
        <Link href={href} className="mt-8 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#1FD7CF] via-[#5095FF] to-[#856CFF] px-6 text-sm font-black uppercase tracking-wider text-black">
          {label} →
        </Link>
      </div>
    </main>
  )
}
