import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createSessionClient, createServiceClient } from '@/lib/supabase/server'
import { canDownloadProtocol } from '@/lib/content/privateProtocol'
import { getLiveContent } from '@/lib/notion/liveContent'
import { protocolGammaUrl } from '@/lib/content/protocolGamma'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Your protocol — SOR7ED', robots: { index: false, follow: false } }

export default async function PrivateProtocolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) notFound()
  const next = `/protocols/${slug}`
  const session = await createSessionClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) redirect(`/signup?next=${encodeURIComponent(next)}`)
  const db = createServiceClient()
  const { data: profile } = await db.from('users').select('whatsapp_verified, whatsapp_number').eq('user_id', user.id).single()
  if (!canDownloadProtocol(user.id, profile)) redirect(`/connect?next=${encodeURIComponent(next)}`)
  const published = await getLiveContent()
  if (!published.articles.includes(slug)) notFound()
  const { data: item } = await db.from('protocols').select('gamma_url')
    .eq('slug', slug).eq('status', 'Published').eq('type', 'Article').single()
  const destination = protocolGammaUrl(item?.gamma_url)
  if (!destination) notFound()
  // Compatibility for previously sent cards. Open the live Notion Gamma slides;
  // never replace the customer's designed protocol with a generated website deck.
  redirect(destination)
}
