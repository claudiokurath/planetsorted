import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
const TOOL_SLUGS = ['adhd-tax-calculator', 'financial-autopilot', 'decision-paralysis-solver']

// System cards — checked first since these slugs will never collide with real content
const SYSTEM_SLUGS: Record<string, { target: string; title: string; desc: string; image: string }> = {
  start: {
    target: '/',
    title: 'Planet Sorted — Text a Word, Get a Protocol',
    desc: 'No app. No spam. Just what works.',
    image: `${SITE}/api/og?card=welcome`,
  },
  goodbye: {
    target: '/',
    title: "You're Paused",
    desc: 'Text START any time to come back.',
    image: `${SITE}/api/og?card=goodbye`,
  },
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  if (SYSTEM_SLUGS[slug]) {
    const sys = SYSTEM_SLUGS[slug]
    return {
      title: sys.title,
      description: sys.desc,
      openGraph: {
        title: sys.title,
        description: sys.desc,
        images: [{ url: sys.image, width: 1200, height: 630 }],
        url: `${SITE}/r/${slug}`,
      },
    }
  }

  if (TOOL_SLUGS.includes(slug)) {
    const title = `${slug.replace(/-/g, ' ')} — Sorted Lab`
    return { title, openGraph: { title, url: `${SITE}/r/${slug}` } }
  }

  const supabase = createServerClient()
  const { data } = await supabase.from('protocols').select('title, summary, cover_image').eq('slug', slug).single()

  if (data) {
    return {
      title: data.title,
      description: data.summary ?? undefined,
      openGraph: {
        title: data.title,
        description: data.summary ?? undefined,
        images: data.cover_image ? [{ url: data.cover_image, width: 1200, height: 630 }] : [],
        url: `${SITE}/r/${slug}`,
      },
    }
  }
  return { title: 'Planet Sorted' }
}

export default async function RichLinkRedirect({ params }: Props) {
  const { slug } = await params
  const supabase = createServerClient()

  let target = SITE // safe default — never dead-ends into a bare 404

  if (SYSTEM_SLUGS[slug]) {
    target = `${SITE}${SYSTEM_SLUGS[slug].target}`
  } else if (TOOL_SLUGS.includes(slug)) {
    target = `${SITE}/tools/${slug}`
  } else {
    const { data: article } = await supabase.from('protocols').select('slug').eq('slug', slug).single()
    if (article) {
      target = `${SITE}/intelligence/${slug}`
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
