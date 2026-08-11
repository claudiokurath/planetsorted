import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

export async function getStandaloneMetadata(
  slug: string,
  fallbackTitle: string,
  fallbackDesc: string
): Promise<Metadata> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('protocols')
    .select('title, seo_title, meta_description, cover_image, summary, excerpt')
    .eq('slug', slug)
    .maybeSingle()

  const title = data?.seo_title || data?.title || fallbackTitle
  const description = data?.meta_description || data?.excerpt || data?.summary || fallbackDesc
  const rawCover = data?.cover_image?.trim()

  let imageUrl: string
  if (rawCover && rawCover.startsWith('http')) {
    imageUrl = `${SITE}/api/og?image=${encodeURIComponent(rawCover)}`
  } else {
    imageUrl = `${SITE}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`
  }

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
