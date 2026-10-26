import { isContentPublished } from '@/lib/notion/liveContent'
import { LiveContentRefresh } from '@/components/LiveContentRefresh'
import { websiteSiteUrl } from '@/lib/siteUrl'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ProtocolDeck } from '@/components/ProtocolDeck'
import { NativePresentation } from '@/components/NativePresentation'
import { getLiveGammaPresentation } from '@/lib/content/liveGamma'
import { gammaEmbedUrl } from '@/lib/content/gammaEmbed'
import { GammaEmbed } from '@/components/GammaEmbed'
import { ContentHero } from '@/components/ContentHero'
import { PrintPageButton } from '@/components/PrintPageButton'
import { buildProtocolDeck } from '@/lib/protocolDeck'
import type { Protocol } from '@/lib/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

const SITE = websiteSiteUrl()

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (!await isContentPublished(slug, 'Article')) notFound()
  const supabase = createServerClient()
  const { data } = await supabase
    .from('protocols')
    .select('title, seo_title, meta_description, cover_image, slug')
    .eq('slug', slug)
    .eq('status', 'Published')
    .single()

  const row = data as Pick<Protocol, 'title' | 'seo_title' | 'meta_description' | 'cover_image' | 'slug'> | null
  if (!row) return {}

  const { ogImageForContent } = await import('@/lib/og/imageUrl')
  const title = row.seo_title || row.title
  const description = row.meta_description || undefined
  const imageUrl = ogImageForContent(row.cover_image, row.title, description)

  return {
    title,
    description,
    alternates: { canonical: `${SITE}/intelligence/${slug}` },
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: row.title }],
      url: `${SITE}/intelligence/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
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
  const gamma = await getLiveGammaPresentation(item.blog_gamma_url)
  const native = Boolean(gamma)
  const currentSource = gammaEmbedUrl(item.blog_gamma_url)

  const deck = native
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
      <main className="w-full">
        <div className="mx-auto max-w-6xl px-5 py-4 print:hidden"><PrintPageButton /></div>
        {native ? (
          <NativePresentation slug={slug} presentation={gamma!.presentation} sourceId={gamma!.sourceId} updatedAt={gamma!.updatedAt} />
        ) : currentSource ? (
          <><ContentHero title={item.title} description={description} category={item.category} articleMode /><GammaEmbed src={currentSource} title={item.title} /></>
        ) : (
          <ProtocolDeck
            deck={deck!}
            bodyText={rawBodyText}
            isSubscriber
          />
        )}

      </main>
    </div>
  )
}
