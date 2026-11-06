import { publicPageMetadata, seoText, contentStructuredData, structuredDataJson } from '@/lib/seo'
import { isContentPublished } from '@/lib/notion/liveContent'
import { LiveContentRefresh } from '@/components/LiveContentRefresh'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ToolClient } from '@/components/ToolClient'
import { createServerClient } from '@/lib/supabase/server'
import type { Protocol } from '@/lib/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (!await isContentPublished(slug, 'Tool')) notFound()
  const supabase = createServerClient()
  const { data: tool } = await supabase
    .from('protocols')
    .select('title, seo_title, meta_description, excerpt, summary, cover_image')
    .eq('slug', slug)
    .eq('type', 'Tool')
    .eq('status', 'Published')
    .single()

  if (!tool) return {}

  const { ogImageForContent } = await import('@/lib/og/imageUrl')
  const title = tool.seo_title || tool.title
  const description = seoText(tool.meta_description || tool.excerpt || tool.summary) || `Explore ${tool.title.toLowerCase()} and find a practical next step with SOR7ED.`
  const imageUrl = ogImageForContent(tool.cover_image, tool.title, description)
  return publicPageMetadata({ title, description, path: `/tools/${slug}`, image: imageUrl })

}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params
  if (!await isContentPublished(slug, 'Tool')) notFound()
  const supabase = createServerClient()
  
  const { data: tool } = await supabase
    .from('protocols')
    .select('*')
    .eq('slug', slug)
    .eq('type', 'Tool')
    .eq('status', 'Published')
    .single()

  if (!tool) {
    notFound()
  }

  return <><LiveContentRefresh /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataJson(contentStructuredData(tool.title, tool.meta_description || tool.excerpt || tool.summary, `/tools/${slug}`, 'Tool', tool.cover_image)) }} /><ToolClient toolData={tool as Protocol} /></>
}
