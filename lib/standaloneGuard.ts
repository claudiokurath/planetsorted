import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyStandaloneAccessToken } from '@/lib/crypto/tokens'

export async function verifyStandaloneAccess(
  slug: string,
  searchParams?: { access_token?: string } | Promise<{ access_token?: string }>
) {
  // Resolved search params if Promise
  const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams

  // Products remain link-only: the short-lived HMAC is minted when a member
  // requests delivery, rather than exposing a catalogue of unlocked tools.
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(`sor7ed_access_${slug}`)?.value
  const queryToken = resolvedParams?.access_token

  if (
    verifyStandaloneAccessToken(slug, cookieToken) ||
    verifyStandaloneAccessToken(slug, queryToken)
  ) {
    return true
  }

  redirect(`/tools/${slug}`)
}
