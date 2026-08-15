import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { STANDALONE_ROUTES } from '@/lib/standaloneRoutes'
import {
  buildStandaloneAccessToken,
  STANDALONE_ACCESS_TTL_SECONDS,
} from '@/lib/crypto/tokens'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
const LOGO_IMAGE = `${SITE}/images/sor7ed-logo.png`

const SYSTEM_SLUGS: Record<string, { target: string; title: string; description: string }> = {
  start: {
    target: '/',
    title: 'PLANET SOR7ED — Practical protocols that work',
    description: 'Clear tools and protocols for neurodivergent adults.',
  },
  goodbye: {
    target: '/',
    title: 'Your SOR7ED messages are paused',
    description: 'You can reconnect with PLANET SOR7ED whenever you are ready.',
  },
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lowerSlug = slug.toLowerCase()
  const systemItem = SYSTEM_SLUGS[lowerSlug]

  if (systemItem) {
    return buildMetadata(systemItem.title, systemItem.description, slug, LOGO_IMAGE)
  }

  const supabase = createServerClient()
  const { data: content } = await supabase
    .from('protocols')
    .select('title, summary, meta_description, cover_image')
    .eq('slug', lowerSlug)
    .eq('status', 'Published')
    .single()

  if (!content) {
    return {
      title: 'Content unavailable — PLANET SOR7ED',
      robots: { index: false, follow: false },
    }
  }

  return buildMetadata(
    content.title,
    content.meta_description || content.summary || '',
    lowerSlug,
    content.cover_image
  )
}

export default async function RichLinkRedirect({ params }: Props) {
  const { slug } = await params
  const lowerSlug = slug.toLowerCase()
  const systemItem = SYSTEM_SLUGS[lowerSlug]

  if (systemItem) {
    redirect(`${SITE}${systemItem.target}`)
  }

  const standalonePath = STANDALONE_ROUTES[lowerSlug]
  if (standalonePath) {
    // Can't set cookies here — this is a Server Component render (a plain
    // GET), and Next.js only allows cookies().set() inside a Server Action
    // or Route Handler; doing it here 500s on every request. The query-param
    // token is sufficient on its own — the destination page's guard checks
    // it directly (see lib/standaloneGuard.ts).
    const { token } = buildStandaloneAccessToken(lowerSlug, STANDALONE_ACCESS_TTL_SECONDS)
    redirect(`${SITE}${standalonePath}?access_token=${encodeURIComponent(token)}`)
  }

  const supabase = createServerClient()
  const { data: content } = await supabase
    .from('protocols')
    .select('slug, type')
    .eq('slug', lowerSlug)
    .eq('status', 'Published')
    .single()

  if (!content) notFound()

  redirect(
    content.type === 'Tool'
      ? `${SITE}/tools/${content.slug}`
      : `${SITE}/intelligence/${content.slug}`
  )
}

function buildMetadata(title: string, description: string, slug: string, imageUrl?: string | null): Metadata {
  const proxiedImage = imageUrl
    ? `${SITE}/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
    : null

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: proxiedImage
        ? [{ url: proxiedImage, width: 1200, height: 630, alt: title }]
        : [],
      url: `${SITE}/r/${slug}`,
      siteName: 'PLANET SOR7ED',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: proxiedImage ? [proxiedImage] : [],
    },
  }
}
