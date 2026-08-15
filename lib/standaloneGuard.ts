import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function verifyStandaloneAccess(
  slug: string,
  searchParams?: { access_token?: string } | Promise<{ access_token?: string }>
) {
  // Resolved search params if Promise
  const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams

  // The tool is only reachable via a WhatsApp rich link — being logged in
  // on the website is not a shortcut. That's the whole point: the explanation
  // page always sends people through the SOR7ED button to WhatsApp, never
  // straight into the app.
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(`sor7ed_access_${slug}`)?.value
  const queryToken = resolvedParams?.access_token

  if (cookieToken === 'granted' || queryToken === 'granted') {
    return true
  }

  redirect(`/tools/${slug}`)
}

