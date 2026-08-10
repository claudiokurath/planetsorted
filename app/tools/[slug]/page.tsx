import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ToolClient } from '@/components/ToolClient'
import { createServerClient } from '@/lib/supabase/server'
import type { Protocol } from '@/lib/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServerClient()
  const { data: tool } = await supabase
    .from('protocols')
    .select('title, summary, cover_image')
    .eq('slug', slug)
    .eq('type', 'Tool')
    .eq('status', 'Published')
    .single()

  if (!tool) return {}

  return {
    title: `${tool.title} — PLANET SOR7ED`,
    description: tool.summary || '',
    openGraph: {
      title: `${tool.title} — PLANET SOR7ED`,
      description: tool.summary || '',
      url: `${SITE}/tools/${slug}`,
      type: 'website',
      images: tool.cover_image
        ? [{ url: tool.cover_image, width: 1200, height: 630, alt: tool.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.title} — PLANET SOR7ED`,
      description: tool.summary || '',
      images: tool.cover_image ? [tool.cover_image] : [],
    },
  }
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params
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

  return (
    <ToolClient
      toolData={tool as Protocol}
    />
  )
}
