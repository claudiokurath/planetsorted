import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

const TOOL_SLUGS: Record<string, { title: string; description: string; image: string }> = {
  'adhd-tax-calculator': {
    title: 'ADHD Tax Calculator — Sorted Lab',
    description: 'Calculate subscription leaks, late fees, and impulse buying overhead in 3 minutes.',
    image: `${SITE}/images/tool-tax.jpg`,
  },
  'financial-autopilot': {
    title: 'Financial Autopilot — Sorted Lab',
    description: 'Build a friction-free bill and savings automation system in 5 minutes.',
    image: `${SITE}/images/tool-autopilot.jpg`,
  },
  'decision-paralysis-solver': {
    title: 'Decision Paralysis Solver — Sorted Lab',
    description: 'Break through overthinking with forced binary elimination in 2 minutes.',
    image: `${SITE}/images/tool-clarity.jpg`,
  },
  'dopamine-menu-generator': {
    title: 'Dopamine Menu Generator — Sorted Lab',
    description: 'Build your personalised brain-reset menu: starters, mains, sides, and desserts.',
    image: `${SITE}/images/og-fallback.png`,
  },
  'task-triage': {
    title: 'Task Triage & Matrix — Sorted Lab',
    description: 'Convert a chaotic task dump into a single clear next-step priority.',
    image: `${SITE}/images/og-fallback.png`,
  },
  'rsd-response-scripts': {
    title: 'RSD Response Scripts — Sorted Lab',
    description: 'Instant boundary templates for rejection-sensitive situations.',
    image: `${SITE}/images/og-fallback.png`,
  },
  'sensory-audit': {
    title: 'Sensory Audit & Reset — Sorted Lab',
    description: 'Identify environmental noise, light, and sensory drains — then fix them.',
    image: `${SITE}/images/og-fallback.png`,
  },
  'burnout-assessment': {
    title: 'Burnout Assessment & Recovery — Sorted Lab',
    description: 'Evaluate your burnout stage and get non-shame restoration steps.',
    image: `${SITE}/images/og-fallback.png`,
  },
}

// System cards — checked first since these slugs will never collide with real content
const SYSTEM_SLUGS: Record<string, { target: string; title: string; desc: string; image: string }> = {
  start: {
    target: '/',
    title: 'Planet Sorted — Text a Word, Get a Protocol',
    desc: 'No app. No spam. Just what works.',
    image: `${SITE}/images/og-fallback.png`,
  },
  goodbye: {
    target: '/',
    title: "You're Paused",
    desc: 'Text START any time to come back.',
    image: `${SITE}/images/og-fallback.png`,
  },
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lowerSlug = slug.toLowerCase()

  let title = 'Planet Sorted'
  let description = 'No app. No spam. Just what works.'
  let imageUrl = `${SITE}/images/og-fallback.png`

  if (SYSTEM_SLUGS[lowerSlug]) {
    const sys = SYSTEM_SLUGS[lowerSlug]
    title = sys.title
    description = sys.desc
    imageUrl = sys.image
  } else if (TOOL_SLUGS[lowerSlug]) {
    const tool = TOOL_SLUGS[lowerSlug]
    title = tool.title
    description = tool.description
    imageUrl = tool.image
  } else {
    const supabase = createServerClient()

    // 1. Try rich_links table
    const { data: richLink } = await supabase
      .from('rich_links')
      .select('title, description, image_url')
      .eq('slug', slug)
      .single()

    if (richLink?.title || richLink?.image_url) {
      title = richLink.title ?? title
      description = richLink.description ?? description
      if (richLink.image_url) imageUrl = richLink.image_url
    } else {
      // 2. Try protocols table
      const { data: article } = await supabase
        .from('protocols')
        .select('title, summary, cover_image')
        .eq('slug', slug)
        .single()

      if (article) {
        title = article.title
        description = article.summary ?? description
        if (article.cover_image) imageUrl = article.cover_image
      }
    }
  }

  // Proxy ALL images (except already-proxied ones) through our OG endpoint 
  // so we can guarantee exact 1200x630 dimensions without stretching, and ensure they are <300KB
  const isInternalProxy = imageUrl.includes('/api/og')
  const ogImageUrl = isInternalProxy ? imageUrl : `${SITE}/api/og?image=${encodeURIComponent(imageUrl)}`

  const ogImage = { url: ogImageUrl, width: 1200, height: 630, type: 'image/jpeg', alt: title }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogImage],
      url: `${SITE}/r/${slug}`,
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

export default async function RichLinkRedirect({ params }: Props) {
  const { slug } = await params
  const lowerSlug = slug.toLowerCase()
  const supabase = createServerClient()

  let target = SITE // safe default — never dead-ends into a bare 404

  if (SYSTEM_SLUGS[lowerSlug]) {
    target = `${SITE}${SYSTEM_SLUGS[lowerSlug].target}`
  } else if (TOOL_SLUGS[lowerSlug]) {
    target = `${SITE}/tools/${lowerSlug}`
  } else {
    const { data: item } = await supabase.from('protocols').select('slug, type').eq('slug', slug).single()
    if (item) {
      target = item.type === 'Tool' ? `${SITE}/tools/${slug}` : `${SITE}/intelligence/${slug}`
    } else {
      const { data: richLink } = await supabase.from('rich_links').select('target_url').eq('slug', slug).single()
      if (richLink?.target_url) target = richLink.target_url
    }
  }

  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content={`0;url=${target}`} />
      </head>
      <body style={{ background: '#000', color: '#fff', fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
        Redirecting to Planet Sorted…
      </body>
    </html>
  )
}
