import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ContentHero } from '@/components/ContentHero'
import { Sor7edButton } from '@/components/buttons/Sor7edButton'
import { ArticleAudioControls } from '@/components/ArticleAudioControls'
import type { Protocol } from '@/lib/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

interface ArticleSection {
  heading?: string
  text: string
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

function parseArticleSections(rawText: string, title?: string): ArticleSection[] {
  if (!rawText) return []

  let s = rawText

  // Strip duplicate title prefix if present at start of body text
  if (title && s.toUpperCase().startsWith(title.toUpperCase())) {
    s = s.slice(title.length).trim()
  }

  // Insert explicit section separators before ALL-CAPS titles stuck to sentence endings
  s = s.replace(/([\.!\?])\s*([A-Z\s“”"'\:\-]{5,65})(?=\n|$)/g, '$1\n\n===HEADING===$2\n\n')
  s = s.replace(/([\.!\?])\s*([A-Z][A-Z\s“”"'\:\-]{5,65}\b)/g, '$1\n\n===HEADING===$2\n\n')

  const rawBlocks = s.split('\n')
  const sections: ArticleSection[] = []
  let currentHeading = ''
  let currentParagraphs: string[] = []

  for (let line of rawBlocks) {
    line = line.trim()
    if (!line) continue

    const markdownHeading = line.match(/^#{1,6}\s+(.+)$/)

    if (markdownHeading) {
      if (currentParagraphs.length > 0) {
        sections.push({ heading: currentHeading || undefined, text: currentParagraphs.join('\n\n') })
        currentParagraphs = []
      }
      currentHeading = markdownHeading[1].trim()
    } else if (line.startsWith('===HEADING===')) {
      if (currentParagraphs.length > 0) {
        sections.push({ heading: currentHeading || undefined, text: currentParagraphs.join('\n\n') })
        currentParagraphs = []
      }
      currentHeading = line.replace('===HEADING===', '').trim()
    } else if (line.length > 4 && line.length < 65 && line === line.toUpperCase() && !line.startsWith('---') && !line.includes('.')) {
      if (currentParagraphs.length > 0) {
        sections.push({ heading: currentHeading || undefined, text: currentParagraphs.join('\n\n') })
        currentParagraphs = []
      }
      currentHeading = line
    } else {
      currentParagraphs.push(line)
    }
  }

  if (currentParagraphs.length > 0) {
    sections.push({ heading: currentHeading || undefined, text: currentParagraphs.join('\n\n') })
  }

  return sections
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServerClient()
  const { data } = await supabase
    .from('protocols')
    .select('title, seo_title, meta_description, cover_image, slug')
    .eq('slug', slug)
    .eq('status', 'Published')
    .single()

  const row = data as Pick<Protocol, 'title' | 'seo_title' | 'meta_description' | 'cover_image' | 'slug'> | null
  if (!row) return {}

  const title = row.seo_title || row.title
  const description = row.meta_description || undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: row.cover_image 
        ? [{ url: `${SITE}/api/og?image=${encodeURIComponent(row.cover_image)}`, width: 1200, height: 630, type: 'image/png', alt: row.title }] 
        : [],
      url: `${SITE}/intelligence/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: row.cover_image ? [row.cover_image] : [],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const supabase = createServerClient()

  const { data: rawProtocol } = await supabase
    .from('protocols')
    .select('title, summary, category, cover_image, problem, read_time, excerpt, meta_description, audio_url, slug')
    .eq('slug', slug)
    .eq('status', 'Published')
    .single()

  const protocol = rawProtocol as Protocol | null
  if (!protocol) notFound()

  // Check subscription for Deep Dive gating
  const { data: { session } } = await supabase.auth.getSession()
  let isSubscriber = false
  if (session?.user?.id) {
    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('status')
      .eq('user_id', session.user.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle()
    isSubscriber = !!entitlement
  }

  const audioUrl = protocol.audio_url?.trim() || undefined
  const description = protocol.excerpt?.trim() || protocol.summary?.trim() || protocol.meta_description?.trim()
  // Parse Notion body text into structured section blocks
  const rawBodyText = protocol.problem || ''
  const sections = parseArticleSections(rawBodyText, protocol.title)

  return (
    <div className="min-h-screen bg-black text-white">
      <ContentHero
        title={protocol.title}
        description={description}
        category={protocol.category}
        meta={protocol.read_time}
        articleMode
      />

      {/* Main Reading Container */}
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Audio controls — TTS always available, Deep Dive gated to subscribers */}
        <ArticleAudioControls
          bodyText={rawBodyText}
          deepDiveUrl={audioUrl}
          isSubscriber={isSubscriber}
        />

        {/* Structured Article Sections with Bold Headings & Generous Spacing */}
        <div className="space-y-14">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-4">
              {sec.heading && (
                <h2
                  className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {sec.heading}
                </h2>
              )}
              <div className="text-base sm:text-lg text-neutral-300 leading-relaxed whitespace-pre-line space-y-5">
                {sec.text}
              </div>
            </div>
          ))}
        </div>

      </article>

      {/* End-of-article SOR7ED CTA */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="border-t border-neutral-800 pt-12 space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C0392B]">Protocol</p>
          <p className="text-xl font-black uppercase text-white sm:text-2xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Ready to use this? Tap the button and get your protocol now.
          </p>
          <Sor7edButton href="/tools" context="article" size="lg" />
        </div>
      </div>
    </div>
  )
}
