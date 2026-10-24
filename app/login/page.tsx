import { redirect } from 'next/navigation'
import { safeNext } from '@/lib/safeNext'

/** Returning-member alias, preserving only a safe same-site destination. */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next)
  redirect(`/signup?mode=returning&next=${encodeURIComponent(next)}`)
}
