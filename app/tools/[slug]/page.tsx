import { isContentPublished } from '@/lib/notion/liveContent'
import { LiveContentRefresh } from '@/components/LiveContentRefresh'
import { websiteSiteUrl } from '@/lib/siteUrl'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ToolClient } from '@/components/ToolClient'
import { createServerClient } from '@/lib/supabase/server'
import type { Protocol } from '@/lib/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

const SITE = websiteSiteUrl()

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (!await isContentPublished(slug, 'Tool')) notFound()
  const supabase = createServerClient()
  const { data: tool } = await supabase
    .from('protocols')
    .select('title, summary, cover_image')
    .eq('slug', slug)
    .eq('type', 'Tool')
    .eq('status', 'Published')
    .single()

  if (!tool) return {}

  const { ogImageForContent } = await import('@/lib/og/imageUrl')
  const title = `${tool.title} — PLANET SOR7ED`
  const description = tool.summary || ''
  const imageUrl = ogImageForContent(tool.cover_image, tool.title, description)

  return {
    title,
    description,
    alternates: { canonical: `${SITE}/tools/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE}/tools/${slug}`,
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: tool.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
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

  return <><LiveContentRefresh /><ToolClient toolData={tool as Protocol} /></>
}
