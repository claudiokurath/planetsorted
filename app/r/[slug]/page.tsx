import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { STANDALONE_ROUTES } from '@/lib/standaloneRoutes'
import {
  buildStandaloneAccessToken,
  buildArticleAccessToken,
  STANDALONE_ACCESS_TTL_SECONDS,
  ARTICLE_ACCESS_TTL_SECONDS,
} from '@/lib/crypto/tokens'
import { isOgCrawler } from '@/lib/og/crawlers'
import { ogImageForContent, proxiedCoverImage } from '@/lib/og/imageUrl'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
const LOGO_IMAGE = `${SITE}/images/sor7ed-logo-white.png`

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

/**
 * Humans: 307 to the real tool/article.
 * OG crawlers (WhatsApp, Facebook, Slack…): stay on this page so they scrape
 * our sharp 1200×630 image-proxy tags. Following the redirect was the blur
 * bug — destination pages used tiny source covers /api/og?image= stretch.
 */
export default async function RichLinkRedirect({ params }: Props) {
  const { slug } = await params
  const lowerSlug = slug.toLowerCase()
  const hdrs = await headers()
  const ua = hdrs.get('user-agent')
  const crawler = isOgCrawler(ua)

  const systemItem = SYSTEM_SLUGS[lowerSlug]
  if (systemItem) {
    if (crawler) {
      return (
        <CrawlerShell
          title={systemItem.title}
          description={systemItem.description}
        />
      )
    }
    redirect(`${SITE}${systemItem.target}`)
  }

  const standalonePath = STANDALONE_ROUTES[lowerSlug]
  if (standalonePath) {
    if (crawler) {
      // Metadata already set in generateMetadata; render a tiny body for the bot.
      return <CrawlerShell title={lowerSlug} description="" />
    }
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
    .select('slug, type, title, summary, meta_description')
    .eq('slug', lowerSlug)
    .eq('status', 'Published')
    .single()

  if (!content) notFound()

  if (crawler) {
    return (
      <CrawlerShell
        title={content.title}
        description={content.meta_description || content.summary || ''}
      />
    )
  }

  // Humans from the WhatsApp rich link get a short-lived HMAC so the
  // destination can unlock full body + protocol. Public pages stay teaser-only.
  if (content.type === 'Tool') {
    redirect(`${SITE}/tools/${content.slug}`)
  }

  const { token } = buildArticleAccessToken(content.slug, ARTICLE_ACCESS_TTL_SECONDS)
  redirect(
    `${SITE}/intelligence/${content.slug}?access_token=${encodeURIComponent(token)}`
  )
}

function CrawlerShell({ title, description }: { title: string; description: string }) {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, margin: '0 0 12px' }}>{title}</h1>
      {description ? (
        <p style={{ color: '#444', lineHeight: 1.5, margin: 0 }}>{description}</p>
      ) : null}
      <p style={{ color: '#888', fontSize: 13, marginTop: 24 }}>PLANET SOR7ED</p>
    </main>
  )
}

function buildMetadata(
  title: string,
  description: string,
  slug: string,
  imageUrl?: string | null
): Metadata {
  // Prefer sharp image-proxy JPEG; fall back to branded OG card.
  const ogImage =
    proxiedCoverImage(imageUrl) ?? ogImageForContent(null, title, description)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      url: `${SITE}/r/${slug}`,
      siteName: 'PLANET SOR7ED',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}
