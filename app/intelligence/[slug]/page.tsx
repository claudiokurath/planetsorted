import { websiteSiteUrl } from '@/lib/siteUrl'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ProtocolDeck } from '@/components/ProtocolDeck'
import { NativePresentation, hasNativePresentation } from '@/components/NativePresentation'
import { PrintPageButton } from '@/components/PrintPageButton'
import { buildProtocolDeck } from '@/lib/protocolDeck'
import type { Protocol } from '@/lib/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

const SITE = websiteSiteUrl()

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
  const native = hasNativePresentation(slug, item.blog_gamma_url)

  const { data: relatedTools } = await supabase
    .from('protocols')
    .select('slug, title')
    .eq('category', item.category)
    .eq('type', 'Tool')
    .eq('status', 'Published')
    .order('updated_at', { ascending: false })
    .limit(1)

  const relatedTool = relatedTools?.[0] ?? null

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
      <main className="w-full">
        <div className="mx-auto max-w-6xl px-5 py-4 print:hidden"><PrintPageButton /></div>
        {native ? (
          <NativePresentation slug={slug} />
        ) : (
          <ProtocolDeck
            deck={deck!}
            bodyText={rawBodyText}
            isSubscriber
          />
        )}

        {relatedTool ? (
          <section className="mx-auto mt-8 max-w-6xl text-center">
            <Link
              href={`/tools/${relatedTool.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-black px-4 py-2 text-xs font-medium uppercase tracking-wider text-neutral-200 transition-colors hover:border-[#FFBA2E] hover:text-[#FFBA2E]"
            >
              Try the {item.category} tool: {relatedTool.title} →
            </Link>
          </section>
        ) : null}
      </main>
    </div>
  )
}
