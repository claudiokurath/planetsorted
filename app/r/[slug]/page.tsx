import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { RichLinkRedirect } from './RichLinkRedirect'

interface Props {
  params: Promise<{ slug: string }>
}

const SYSTEM_PAGES: Record<string, { title: string; description: string; targetUrl: string; image: string }> = {
  tools: {
    title: 'Sorted Lab — Interactive Tools',
    description: 'Practical interactive tools & calculators for neurodivergent adults.',
    targetUrl: 'https://planetsorted.com/tools',
    image: 'https://planetsorted.com/images/banners/toolbox banner.png',
  },
  help: {
    title: 'Planet Sorted — Toolbox & Guides',
    description: 'Text TAX, CLARITY, or BURNOUT to run interactive tools instantly.',
    targetUrl: 'https://planetsorted.com/tools',
    image: 'https://planetsorted.com/images/banners/toolbox banner.png',
  },
  login: {
    title: 'Sign In — Planet Sorted',
    description: 'Magic link sign in. No password needed.',
    targetUrl: 'https://planetsorted.com/signup',
    image: 'https://planetsorted.com/images/banners/dashboard banner.png',
  },
  library: {
    title: 'Your Saved Library — Planet Sorted',
    description: 'Access your saved protocols, tools, and history.',
    targetUrl: 'https://planetsorted.com/dashboard',
    image: 'https://planetsorted.com/images/banners/dashboard banner.png',
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServerClient()
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

  let title = 'Planet Sorted'
  let description = 'Practical protocols & tools for neurodivergent adults.'
  let imageUrl = `${site}/images/heroes/hero1.jpg`

  // Check system routes
  const systemPage = SYSTEM_PAGES[slug.toLowerCase()]
  if (systemPage) {
    title = systemPage.title
    description = systemPage.description
    imageUrl = systemPage.image
  } else {
    // 1. Try fetching from rich_links
    const { data: richLink } = await supabase
      .from('rich_links')
      .select('title, description, image_url')
      .eq('slug', slug)
      .single()

    const linkRow = richLink as { title: string | null; description: string | null; image_url: string | null } | null

    if (linkRow && (linkRow.title || linkRow.image_url)) {
      title = linkRow.title ?? title
      description = linkRow.description ?? description
      if (linkRow.image_url) imageUrl = linkRow.image_url
    } else {
      // 2. Fall back to fetching from protocols table
      const { data: protocol } = await supabase
        .from('protocols')
        .select('title, summary, cover_image')
        .eq('slug', slug)
        .single()

      const protocolRow = protocol as { title: string; summary: string; cover_image: string | null } | null
      if (protocolRow) {
        title = protocolRow.title
        description = protocolRow.summary || description
        if (protocolRow.cover_image) imageUrl = protocolRow.cover_image
      }
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      url: `${site}/r/${slug}`,
      siteName: 'Planet Sorted',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function RichLinkPage({ params }: Props) {
  const { slug } = await params
  const supabase = createServerClient()
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

  const systemPage = SYSTEM_PAGES[slug.toLowerCase()]
  if (systemPage) {
    return <RichLinkRedirect targetUrl={systemPage.targetUrl} />
  }

  // 1. Try to find target_url from rich_links
  const { data: richLink } = await supabase
    .from('rich_links')
    .select('target_url')
    .eq('slug', slug)
    .single()

  const linkRow = richLink as { target_url: string } | null
  let targetUrl = linkRow?.target_url

  if (!targetUrl) {
    // 2. Fall back to dynamic article route if it is a published protocol slug
    const { data: protocol } = await supabase
      .from('protocols')
      .select('slug')
      .eq('slug', slug)
      .eq('status', 'Published')
      .single()

    const protocolRow = protocol as { slug: string } | null
    if (protocolRow) {
      targetUrl = `${site}/intelligence/${slug}`
    }
  }

  if (!targetUrl) {
    notFound()
  }

  return <RichLinkRedirect targetUrl={targetUrl} />
}
