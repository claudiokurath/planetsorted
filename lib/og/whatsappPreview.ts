import type { Metadata } from 'next'
import { proxiedCoverImage } from './imageUrl'

const SITE = process.env.SITE_URL ?? 'https://planetsorted.com'

/** Dedicated WhatsApp rich links: artwork followed by the title, no summary. */
export function whatsappPreviewMetadata(
  title: string,
  slug: string,
  coverImage?: string | null
): Metadata {
  const image = proxiedCoverImage(coverImage) ?? `${SITE}/images/sor7ed-logo-white.png`
  return {
    title,
    // Clear inherited descriptions too; omitting this field would keep the
    // root layout's marketing copy in the WhatsApp preview.
    description: null,
    openGraph: {
      title,
      description: undefined,
      images: [{ url: image, alt: title }],
      url: `${SITE}/r/${slug}`,
      siteName: 'PLANET SOR7ED',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: undefined,
      images: [image],
    },
  }
}
