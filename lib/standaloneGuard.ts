import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export async function verifyStandaloneAccess(
  slug: string,
  searchParams?: { access_token?: string } | Promise<{ access_token?: string }>
) {
  // Resolved search params if Promise
  const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams

  // 1. Check logged-in user session
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    return true
  }

  // 2. Check access token cookie granted by WhatsApp /r/[slug] link
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(`sor7ed_access_${slug}`)?.value
  const queryToken = resolvedParams?.access_token

  if (cookieToken === 'granted' || queryToken === 'granted') {
    return true
  }

  // 3. Unauthenticated direct visitor without WhatsApp token -> redirect to /tools/[slug]
  redirect(`/tools/${slug}`)
}
