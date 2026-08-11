import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { ContentHero } from '@/components/ContentHero'
import { Sor7edButton } from '@/components/buttons/Sor7edButton'
import { ArticleAudioControls } from '@/components/ArticleAudioControls'
import type { Protocol } from '@/lib/types/database'

interface Props {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ access_token?: string }>
}

interface ArticleSection {
  heading?: string
  text: string
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

function parseArticleSections(rawText: string, title?: string): ArticleSection[] {
  if (!rawText) return []

  let s = rawText

  if (title && s.toUpperCase().startsWith(title.toUpperCase())) {
    s = s.slice(title.length).trim()
  }

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

export default async function ArticlePage({ params, searchParams }: Props) {
  const { slug } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const supabase = createServerClient()

  const { data: rawProtocol } = await supabase
    .from('protocols')
    .select('title, summary, category, cover_image, problem, read_time, excerpt, meta_description, audio_url, slug')
    .eq('slug', slug)
    .eq('status', 'Published')
    .single()

  const protocol = rawProtocol as Protocol | null
  if (!protocol) notFound()

  // Check user session & subscription
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

  // Check access token from WhatsApp link or cookie
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(`sor7ed_access_${slug}`)?.value
  const queryToken = resolvedSearchParams.access_token

  const isUnlocked = !!(session?.user || cookieToken === 'granted' || queryToken === 'granted')

  const audioUrl = protocol.audio_url?.trim() || undefined
  const description = protocol.excerpt?.trim() || protocol.summary?.trim() || protocol.meta_description?.trim()
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

      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {isUnlocked ? (
          <>
            {/* Audio controls — TTS always available, Deep Dive for subscribers or unlocked */}
            <ArticleAudioControls
              bodyText={rawBodyText}
              deepDiveUrl={audioUrl}
              isSubscriber={isSubscriber || isUnlocked}
            />

            {/* Full Article Content */}
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
          </>
        ) : (
          /* Public Preview state for unauthenticated direct visitors */
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/80 p-8 sm:p-12 space-y-8 text-center">
            <div className="space-y-3 max-w-xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C0392B]">
                Unlock Full Protocol &amp; Deep Dive
              </span>
              <h2
                className="text-3xl font-black uppercase text-white sm:text-4xl"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Get the complete guide sent to your WhatsApp
              </h2>
              <p className="text-base text-neutral-300 leading-relaxed">
                Tap the button below to share the link to your WhatsApp and unlock the full protocol, Deep Dive audio, and complete article experience.
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <Sor7edButton href={`/intelligence/${slug}`} slug={slug} context="article" size="lg" />
            </div>
          </div>
        )}
      </article>

      {/* End-of-article SOR7ED CTA */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="border-t border-neutral-800 pt-12 space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C0392B]">Protocol</p>
          <p className="text-xl font-black uppercase text-white sm:text-2xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Ready to use this? Tap the button and get your protocol now.
          </p>
          <Sor7edButton href={`/intelligence/${slug}`} slug={slug} context="article" size="lg" />
        </div>
      </div>
    </div>
  )
}
