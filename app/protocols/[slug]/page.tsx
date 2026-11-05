import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createSessionClient, createServiceClient } from '@/lib/supabase/server'
import { PRIVATE_PDF_SLUG, canDownloadProtocol } from '@/lib/content/privateProtocol'
import { getLiveContent } from '@/lib/notion/liveContent'
import { ProtocolDeck } from '@/components/ProtocolDeck'
import { buildProtocolDeck } from '@/lib/protocolDeck'
import { PrintPageButton } from '@/components/PrintPageButton'

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
  const { data: item } = await db.from('protocols').select('title, slug, protocol, category')
    .eq('slug', slug).eq('status', 'Published').eq('type', 'Article').single()
  if (!item?.protocol?.trim()) notFound()
  // The live Notion Protocol field is authoritative. Never substitute an old
  // encrypted presentation, a public article or a fixed PDF for this content.
  return <div className="bg-black px-4 py-6 text-white sm:px-6" data-protocol-source="notion-protocol">
    <div className="mx-auto mb-5 flex max-w-6xl flex-wrap items-center gap-4 print:hidden">
      <PrintPageButton />
      {slug === PRIVATE_PDF_SLUG ? <Link href={`/api/protocols/${slug}`} className="text-sm text-neutral-400 underline underline-offset-4">Original private PDF</Link> : null}
    </div>
    <ProtocolDeck
      deck={buildProtocolDeck({ title: item.title, category: item.category, body: item.protocol, protocol: null, coverImage: null })}
      bodyText={item.protocol} isSubscriber
    />
  </div>
}
