import { publicPageMetadata, seoText, contentStructuredData, structuredDataJson } from '@/lib/seo'
import { isContentPublished } from '@/lib/notion/liveContent'
import { LiveContentRefresh } from '@/components/LiveContentRefresh'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ProtocolDeck } from '@/components/ProtocolDeck'
import { NativePresentation } from '@/components/NativePresentation'
import { getCurrentPresentation } from '@/lib/content/presentationCache'
import { GammaEmbed } from '@/components/GammaEmbed'
import { gammaEmbedUrl } from '@/lib/content/gammaEmbed'
import { ContentHero } from '@/components/ContentHero'
import { PrintPageButton } from '@/components/PrintPageButton'
import { buildProtocolDeck } from '@/lib/protocolDeck'
import type { Protocol } from '@/lib/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (!await isContentPublished(slug, 'Article')) notFound()
  const supabase = createServerClient()
  const { data } = await supabase
    .from('protocols')
    .select('title, seo_title, meta_description, excerpt, summary, cover_image, slug')
    .eq('slug', slug)
    .eq('status', 'Published')
    .single()

  const row = data as Pick<Protocol, 'title' | 'seo_title' | 'meta_description' | 'excerpt' | 'summary' | 'cover_image' | 'slug'> | null
  if (!row) return {}

  const { ogImageForContent } = await import('@/lib/og/imageUrl')
  const title = row.seo_title || row.title
  const description = seoText(row.meta_description || row.excerpt || row.summary) || `Read ${row.title.toLowerCase()} and explore practical support for neurodivergent adults.`
  const imageUrl = ogImageForContent(row.cover_image, row.title, description)
  return publicPageMetadata({ title, description, path: `/intelligence/${slug}`, image: imageUrl, type: 'article' })

}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  if (!await isContentPublished(slug, 'Article')) notFound()
  const supabase = createServerClient()

  const { data: rawProtocol } = await supabase
    .from('protocols')
    .select('title, summary, category, cover_image, problem, read_time, excerpt, meta_description, slug, blog_gamma_url')
    .eq('slug', slug)
    .eq('status', 'Published')
    .single()

  const item = rawProtocol as Protocol | null
  if (!item) notFound()

  const description = item.excerpt?.trim() || item.summary?.trim() || item.meta_description?.trim()
  const rawBodyText = item.problem || ''
  // Public article content only. Never query or serialize the private protocol.
  const publicSource = gammaEmbedUrl(item.blog_gamma_url)
  const current = await getCurrentPresentation(slug, item.blog_gamma_url)
  const native = Boolean(current)

  const hasPublicBody = Boolean(rawBodyText.trim())
  const deck = native || !hasPublicBody
    ? null
    : buildProtocolDeck({
        title: item.title,
        lede: description,
        category: item.category,
        readTime: item.read_time,
        coverImage: item.cover_image,
        body: rawBodyText,
        protocol: null,
      })

  return (
    <div className="min-h-screen bg-black text-white">
      <LiveContentRefresh />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataJson(contentStructuredData(item.title, description || '', `/intelligence/${slug}`, 'Article', item.cover_image)) }} />
      <main className="w-full">
        <div className="mx-auto max-w-6xl px-5 py-4 print:hidden"><PrintPageButton /></div>
        {native ? (
          <NativePresentation slug={slug} presentation={current!.presentation} sourceId={current!.sourceId} updatedAt={current!.updatedAt} />
        ) : hasPublicBody ? (
          <ProtocolDeck
            deck={deck!}
            bodyText={rawBodyText}
            isSubscriber
          />
        ) : <ContentHero title={item.title} description={description} category={item.category} articleMode />}
        {publicSource ? <div className="print:hidden"><GammaEmbed src={publicSource} title="Optional Gamma presentation" /></div> : null}

      </main>
    </div>
  )
}
