import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { STANDALONE_ROUTES } from '@/lib/standaloneRoutes'
import {
  buildStandaloneAccessToken,
  STANDALONE_ACCESS_TTL_SECONDS,
} from '@/lib/crypto/tokens'
import { isOgCrawler } from '@/lib/og/crawlers'
import { whatsappPreviewMetadata } from '@/lib/og/whatsappPreview'
import { PRIVATE_PDF_SLUG } from '@/lib/content/privateProtocol'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE = process.env.SITE_URL ?? 'https://planetsorted.com'
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
    return whatsappPreviewMetadata(systemItem.title, slug, LOGO_IMAGE)
  }

  const supabase = createServerClient()
  const { data: content } = await supabase
    .from('protocols')
    .select('title, cover_image')
    .eq('slug', lowerSlug)
    .eq('status', 'Published')
    .single()

  if (!content) {
    return {
      title: 'Content unavailable — PLANET SOR7ED',
      robots: { index: false, follow: false },
    }
  }

  return whatsappPreviewMetadata(content.title, lowerSlug, content.cover_image)
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
        />
      )
    }
    redirect(`${SITE}${systemItem.target}`)
  }

  const supabase = createServerClient()
  const { data: content } = await supabase
    .from('protocols')
    .select('slug, type, title')
    .eq('slug', lowerSlug)
    .eq('status', 'Published')
    .single()

  if (!content) {
    const standalonePath = STANDALONE_ROUTES[lowerSlug]
    if (standalonePath) {
      if (crawler) return <CrawlerShell title={lowerSlug} />
      const { token } = buildStandaloneAccessToken(lowerSlug, STANDALONE_ACCESS_TTL_SECONDS)
      redirect(`${SITE}${standalonePath}?access_token=${encodeURIComponent(token)}`)
    }
    notFound()
  }

  if (crawler) {
    return (
      <CrawlerShell
        title={content.title}
      />
    )
  }

  // WhatsApp cards open the member protocol; public articles remain readable
  // at /intelligence/{slug}. A public short link does not grant private access.
  if (content.type === 'Tool') {
    redirect(`${SITE}/tools/${content.slug}`)
  }

  // Unlike the public article, this attachment requires a real member session.
  // An access_token minted by this public short link cannot unlock the PDF.
  if (content.slug === PRIVATE_PDF_SLUG) redirect(`/api/protocols/${content.slug}`)

  redirect(`/protocols/${content.slug}`)
}

function CrawlerShell({ title }: { title: string }) {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, margin: 0 }}>{title}</h1>
    </main>
  )
}
