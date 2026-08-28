import { redirect } from 'next/navigation'
import { ConnectWhatsAppForm } from './ConnectWhatsAppForm'
import { createServerClient, createSessionClient } from '@/lib/supabase/server'
import { safeNext } from '@/lib/safeNext'

interface Props {
  searchParams: Promise<{ next?: string; slug?: string; context?: string }>
}

export const metadata = {
  title: 'Connect WhatsApp — SOR7ED',
  description: 'Connect once to receive private SOR7ED product links.',
}

export default async function ConnectPage({ searchParams }: Props) {
  const params = await searchParams
  const nextPath = safeNext(params.next)
  const slug = params.slug && /^[a-z0-9-]+$/.test(params.slug) ? params.slug : undefined
  const context = params.context === 'article' || params.context === 'tool'
    ? params.context
    : undefined

  const sessionSupabase = await createSessionClient()
  const { data: { user } } = await sessionSupabase.auth.getUser()

  if (!user) {
    const connectPath = `/connect?next=${encodeURIComponent(nextPath)}${slug ? `&slug=${encodeURIComponent(slug)}` : ''}${context ? `&context=${context}` : ''}`
    redirect(`/signup?next=${encodeURIComponent(connectPath)}`)
  }

  const supabase = createServerClient()
  const { data: profile } = await supabase
    .from('users')
    .select('whatsapp_verified')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profile?.whatsapp_verified) redirect(nextPath)

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-black p-4 sm:p-6">
      <ConnectWhatsAppForm nextPath={nextPath} slug={slug} context={context} />
    </main>
  )
}
