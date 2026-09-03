import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { getToolConfig, TOOL_SLUGS } from '@/lib/toolsRegistry'
import { ToolConfigClient } from '@/components/toolEngine/ToolConfigClient'
import { ogImageForContent } from '@/lib/og/imageUrl'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

interface ConfigToolPageProps {
  params: Promise<{ slug: string }>
}

/**
 * Generate static params for config-driven tools
 * Next.js will pre-render routes for all registered tool slugs
 */
export async function generateStaticParams() {
  return TOOL_SLUGS.map((slug) => ({
    slug,
  }))
}

/**
 * Generate metadata for config-driven tool
 */
export async function generateMetadata({ params }: ConfigToolPageProps): Promise<Metadata> {
  const { slug } = await params
  const config = getToolConfig(slug)

  if (!config) {
    return {
      title: 'Tool not found',
    }
  }

  const { metadata } = config
  const title = metadata.seo_title || metadata.title
  const description = metadata.meta_description || metadata.fallback_description
  const imageUrl = ogImageForContent(metadata.cover_image, title, description)

  return {
    title: `${title} — PLANET SOR7ED`,
    description,
    openGraph: {
      title: `${title} — PLANET SOR7ED`,
      description,
      url: `${SITE}/${slug}`,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${title} — PLANET SOR7ED`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — PLANET SOR7ED`,
      description,
      images: [imageUrl],
    },
  }
}

/**
 * Render config-driven tool page
 */
export default async function ConfigToolPage({ params }: ConfigToolPageProps) {
  const { slug } = await params
  const config = getToolConfig(slug)

  if (!config) {
    notFound()
  }

  // Check authentication
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isLoggedIn = !!session
  const user = session?.user

  // Check WhatsApp verification (if available in session or user metadata)
  const whatsappVerified = user?.user_metadata?.whatsapp_verified ?? false

  // Handle save if user is logged in
  const handleSave = isLoggedIn
    ? async (result: any) => {
        // TODO: Implement save logic if tool supports it
        // Could save to:
        // - tool_runs table (if config.historySaved === true)
        // - user_tools table (if config.saveable === true)
      }
    : undefined

  return (
    <ToolConfigClient
      config={config}
      isLoggedIn={isLoggedIn}
      whatsappVerified={whatsappVerified}
      onSave={handleSave}
    />
  )
}
