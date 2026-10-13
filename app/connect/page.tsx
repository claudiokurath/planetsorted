import { redirect } from 'next/navigation'
import { ConnectWhatsAppForm } from './ConnectWhatsAppForm'
import { createServerClient, createSessionClient } from '@/lib/supabase/server'
import { safeNext } from '@/lib/safeNext'
import { isDeliveryActionId } from '@/lib/whatsapp/deliveryClient'

interface Props {
  searchParams: Promise<{ next?: string; slug?: string; context?: string; actionId?: string }>
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
  const actionId = isDeliveryActionId(params.actionId) ? params.actionId : undefined

  const sessionSupabase = await createSessionClient()
  const { data: { user } } = await sessionSupabase.auth.getUser()

  if (!user) {
    const connectPath = `/connect?next=${encodeURIComponent(nextPath)}${slug ? `&slug=${encodeURIComponent(slug)}` : ''}${context ? `&context=${context}` : ''}${actionId ? `&actionId=${encodeURIComponent(actionId)}` : ''}`
    redirect(`/signup?next=${encodeURIComponent(connectPath)}`)
  }

  const supabase = createServerClient()
  const { data: profile } = await supabase
    .from('users')
    .select('whatsapp_verified, whatsapp_opted_out')
    .eq('user_id', user.id)
    .maybeSingle()

  // STOP remains an explicit preference. Connecting again must not bypass it.
  if (profile?.whatsapp_opted_out) redirect('/dashboard?tab=settings')

  // A returning member still needs to deliberately request the item. Sending
  // on GET would also send when a browser prefetches this connection URL.
  const alreadyConnected = Boolean(profile?.whatsapp_verified)
  if (alreadyConnected && !(slug && context)) redirect(nextPath)

  return (
    <section aria-labelledby="connect-title" className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-black p-4 sm:p-6">
      <ConnectWhatsAppForm nextPath={nextPath} slug={slug} context={context} alreadyConnected={alreadyConnected} actionId={actionId} userId={user.id} />
    </section>
  )
}
