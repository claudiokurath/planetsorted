import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { RichLinkRedirect } from './RichLinkRedirect'

// This page is the OG preview layer for every WhatsApp outbound message.
// WhatsApp's crawler hits this URL, reads the OG tags, and shows a rich preview card.
// Real users are then redirected to target_url via client-side JS.
// Do NOT use server-side redirect() here — that would send a 3xx before OG tags are served.

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServerClient()

  let title = 'Planet Sorted'
  let description = 'Practical protocols for neurodivergent minds.'
  let imageUrl: string | null = null

  // 1. Try fetching from rich_links
  const { data: richLink } = await supabase
    .from('rich_links')
    .select('title, description, image_url')
    .eq('slug', slug)
    .single()

  const linkRow = richLink as { title: string | null; description: string | null; image_url: string | null } | null

  if (linkRow) {
    title = linkRow.title ?? title
    description = linkRow.description ?? description
    imageUrl = linkRow.image_url
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
      imageUrl = protocolRow.cover_image
    }
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: title }]
        : [],
      url: `${site}/r/${slug}`,
      siteName: 'Planet Sorted',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function RichLinkPage({ params }: Props) {
  const { slug } = await params
  const supabase = createServerClient()

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
      const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
      targetUrl = `${site}/intelligence/${slug}`
    }
  }

  if (!targetUrl) {
    notFound()
  }

  return <RichLinkRedirect targetUrl={targetUrl} />
}
