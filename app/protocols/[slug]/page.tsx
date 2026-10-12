import type { Metadata } from 'next'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { notFound, redirect } from 'next/navigation'
import { createSessionClient, createServiceClient } from '@/lib/supabase/server'
import { PRIVATE_PDF_SLUG, canDownloadProtocol, decryptPrivateAsset } from '@/lib/content/privateProtocol'
import { NativePresentation, type Presentation } from '@/components/NativePresentation'
import { ProtocolDeck } from '@/components/ProtocolDeck'
import { buildProtocolDeck } from '@/lib/protocolDeck'
import { PrintPageButton } from '@/components/PrintPageButton'
import sources from '@/lib/content/privatePresentationSources.json'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Your protocol — SOR7ED', robots: { index: false, follow: false } }

export default async function PrivateProtocolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (slug === PRIVATE_PDF_SLUG) redirect(`/api/protocols/${slug}`)
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) notFound()
  const next = `/protocols/${slug}`
  const session = await createSessionClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) redirect(`/signup?next=${encodeURIComponent(next)}`)
  const db = createServiceClient()
  const { data: profile } = await db.from('users').select('whatsapp_verified, whatsapp_number').eq('user_id', user.id).single()
  if (!canDownloadProtocol(user.id, profile)) redirect(`/connect?next=${encodeURIComponent(next)}`)
  const { data: item } = await db.from('protocols').select('title, slug, protocol, category, cover_image, gamma_url')
    .eq('slug', slug).eq('status', 'Published').eq('type', 'Article').single()
  if (!item) notFound()
  let presentation: Presentation | undefined
  const expectedSource = sources[slug as keyof typeof sources]
  if (expectedSource && item.gamma_url?.trim() === expectedSource) {
    try {
      const key = process.env.PRIVATE_PROTOCOL_KEY
      if (key) {
        const payload = await readFile(path.join(process.cwd(), `private/protocols/${slug}.json.enc`))
        presentation = JSON.parse(decryptPrivateAsset(payload, key).toString('utf8')) as Presentation
      }
    } catch { console.error('[private protocol] Presentation unavailable') }
  }
  if (!presentation && !item.protocol) notFound()
  return <div className="bg-black px-4 py-6 text-white sm:px-6">
    <div className="mx-auto mb-5 max-w-6xl print:hidden"><PrintPageButton /></div>
    {presentation ? <NativePresentation slug={slug} presentation={presentation} /> : <ProtocolDeck
      deck={buildProtocolDeck({ title: item.title, category: item.category, body: item.protocol, protocol: null, coverImage: item.cover_image })}
      bodyText={item.protocol} isSubscriber
    />}
  </div>
}
