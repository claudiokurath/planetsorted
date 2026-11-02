import { publicPageMetadata, seoText, contentStructuredData, structuredDataJson } from '@/lib/seo'
import { isContentPublished } from '@/lib/notion/liveContent'
import { LiveContentRefresh } from '@/components/LiveContentRefresh'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { GammaReader } from '@/components/GammaReader'
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
    .eq('type', 'Article')
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
    .select('title, summary, category, cover_image, excerpt, meta_description, slug, blog_gamma_url')
    .eq('slug', slug)
    .eq('type', 'Article')
    .eq('status', 'Published')
    .single()

  const item = rawProtocol as Protocol | null
  if (!item) notFound()

  const description = item.excerpt?.trim() || item.summary?.trim() || item.meta_description?.trim()
  // Blog Post Gamma is the public guidebook. Never substitute Blog Post text,
  // a bundled deck, or the private Protocol Gamma field.
  return <>
    <LiveContentRefresh />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataJson(contentStructuredData(item.title, description || '', `/intelligence/${slug}`, 'Article', item.cover_image)) }} />
    <GammaReader title={item.title} source={item.blog_gamma_url} collection="article" />
  </>
}
