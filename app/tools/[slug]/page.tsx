import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ToolClient } from '@/components/ToolClient'
import { createServerClient, createSessionClient } from '@/lib/supabase/server'
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

  const { ogImageForContent } = await import('@/lib/og/imageUrl')
  const title = `${tool.title} — PLANET SOR7ED`
  const description = tool.summary || ''
  const imageUrl = ogImageForContent(tool.cover_image, tool.title, description)

  return {
    title,
    description,
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

  const { data: relatedArticles } = await supabase
    .from('protocols')
    .select('slug, title, cover_image, read_time, category')
    .eq('category', tool.category)
    .eq('status', 'Published')
    .or('type.eq.Article,type.is.null')
    .order('updated_at', { ascending: false })
    .limit(3)

  const sessionSupabase = await createSessionClient()
  const { data: { session } } = await sessionSupabase.auth.getSession()
  const isLoggedIn = !!session?.user
  let whatsappVerified = false

  if (session?.user?.id) {
    const { data: profile } = await supabase
      .from('users')
      .select('whatsapp_verified')
      .eq('user_id', session.user.id)
      .single()
    whatsappVerified = !!profile?.whatsapp_verified
  }

  return (
    <ToolClient
      toolData={tool as Protocol}
      isLoggedIn={isLoggedIn}
      whatsappVerified={whatsappVerified}
      relatedArticles={relatedArticles ?? []}
    />
  )
}
