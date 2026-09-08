import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ProtocolDeck } from '@/components/ProtocolDeck'
import { GammaEmbed } from '@/components/GammaEmbed'
import { buildProtocolDeck } from '@/lib/protocolDeck'
import { gammaEmbedUrl } from '@/lib/content/gammaEmbed'
import type { Protocol } from '@/lib/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

const SITE = process.env.SITE_URL ?? 'https://www.sor7ed.com'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
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
  const supabase = createServerClient()

  const { data: rawProtocol } = await supabase
    .from('protocols')
    .select('title, summary, category, cover_image, problem, read_time, excerpt, meta_description, protocol, slug, blog_gamma_url')
    .eq('slug', slug)
    .eq('status', 'Published')
    .single()

  const item = rawProtocol as Protocol | null
  if (!item) notFound()

  const description = item.excerpt?.trim() || item.summary?.trim() || item.meta_description?.trim()
  const rawBodyText = item.problem || ''
  const actionProtocolText = item.protocol?.trim() || ''

  // The "Blog post Gamma" is the deck. When it's set it *is* the content;
  // otherwise fall back to the parsed ProtocolDeck built from the markdown.
  const gammaEmbed = gammaEmbedUrl(item.blog_gamma_url ?? null)

  const { data: relatedTools } = await supabase
    .from('protocols')
    .select('slug, title')
    .eq('category', item.category)
    .eq('type', 'Tool')
    .eq('status', 'Published')
    .order('updated_at', { ascending: false })
    .limit(1)

  const relatedTool = relatedTools?.[0] ?? null

  const deck = gammaEmbed
    ? null
    : buildProtocolDeck({
        title: item.title,
        lede: description,
        category: item.category,
        readTime: item.read_time,
        coverImage: item.cover_image,
        body: rawBodyText,
        protocol: actionProtocolText || null,
      })

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        {gammaEmbed ? (
          <GammaEmbed src={gammaEmbed} title={`${item.title} — presentation`} />
        ) : (
          <ProtocolDeck
            deck={deck!}
            bodyText={[rawBodyText, actionProtocolText].filter(Boolean).join('\n\n')}
            isSubscriber
          />
        )}

        {relatedTool ? (
          <section className="mx-auto mt-8 max-w-6xl text-center">
            <Link
              href={`/tools/${relatedTool.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-black px-4 py-2 text-xs font-medium uppercase tracking-wider text-neutral-200 transition-colors hover:border-[#F5C518] hover:text-[#F5C518]"
            >
              Try the {item.category} tool: {relatedTool.title} →
            </Link>
          </section>
        ) : null}
      </main>
    </div>
  )
}
