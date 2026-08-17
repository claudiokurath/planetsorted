import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient, createSessionClient } from '@/lib/supabase/server'
import { ContentHero } from '@/components/ContentHero'
import { Sor7edButton } from '@/components/buttons/Sor7edButton'
import { ArticleAudioControls } from '@/components/ArticleAudioControls'
import { verifyArticleAccessToken } from '@/lib/crypto/tokens'
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

  const { ogImageForContent } = await import('@/lib/og/imageUrl')
  const title = row.seo_title || row.title
  const description = row.meta_description || undefined
  const imageUrl = ogImageForContent(row.cover_image, row.title, description)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: row.title }],
      url: `${SITE}/intelligence/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function ArticlePage({ params, searchParams }: Props) {
  const { slug } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const supabase = createServerClient()

  const { data: rawProtocol } = await supabase
    .from('protocols')
    .select('title, summary, category, cover_image, problem, read_time, excerpt, meta_description, audio_url, protocol, slug')
    .eq('slug', slug)
    .eq('status', 'Published')
    .single()

  const item = rawProtocol as Protocol | null
  if (!item) notFound()

  // Check user session & subscription
  const sessionSupabase = await createSessionClient()
  const { data: { session } } = await sessionSupabase.auth.getSession()
  const isLoggedIn = !!session?.user
  let isSubscriber = false
  let whatsappVerified = false

  if (session?.user?.id) {
    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('status')
      .eq('user_id', session.user.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle()
    isSubscriber = !!entitlement

    const { data: profile } = await supabase
      .from('users')
      .select('whatsapp_verified')
      .eq('user_id', session.user.id)
      .single()
    whatsappVerified = !!profile?.whatsapp_verified
  }

  // Full body + protocol unlock ONLY via WhatsApp rich-link HMAC
  // (/r/[slug] mints access_token). Being signed-in is not a shortcut —
  // the product promise is: teaser on the web, full piece after SOR7ED → WA.
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(`sor7ed_access_${slug}`)?.value
  const queryToken = resolvedSearchParams.access_token
  const isUnlocked =
    verifyArticleAccessToken(slug, queryToken) ||
    verifyArticleAccessToken(slug, cookieToken)

  const audioUrl = item.audio_url?.trim() || undefined
  const description = item.excerpt?.trim() || item.summary?.trim() || item.meta_description?.trim()
  const rawBodyText = item.problem || ''
  const sections = parseArticleSections(rawBodyText, item.title)
  const actionProtocolText = item.protocol?.trim() || ''
  // Locked visitors only see a short teaser — never the full problem body or protocol.
  const teaserText =
    item.excerpt?.trim() ||
    item.summary?.trim() ||
    item.meta_description?.trim() ||
    (rawBodyText ? rawBodyText.slice(0, 280).trim() + (rawBodyText.length > 280 ? '…' : '') : '')

  return (
    <div className="min-h-screen bg-black text-white">
      <ContentHero
        title={item.title}
        description={description}
        coverImage={item.cover_image}
        category={item.category}
        meta={item.read_time}
      />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {isUnlocked ? (
          <>
            {/* Full article — only after WhatsApp rich-link unlock */}
            <ArticleAudioControls
              bodyText={rawBodyText}
              deepDiveUrl={audioUrl}
              isSubscriber={isSubscriber || isUnlocked}
            />

            <article className="space-y-14">
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
            </article>

            {actionProtocolText && (
              <section className="rounded-3xl border border-[#C0392B]/40 bg-[#C0392B]/5 p-8 sm:p-10 space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#C0392B]">
                    Protocol &amp; Actionable Solution
                  </p>
                  <h2
                    className="text-3xl sm:text-4xl font-black uppercase text-white"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    The Step-by-Step Protocol
                  </h2>
                </div>
                <div className="text-base sm:text-lg text-neutral-200 leading-relaxed whitespace-pre-line space-y-4 border-t border-neutral-800 pt-6">
                  {actionProtocolText}
                </div>
              </section>
            )}
          </>
        ) : (
          /* Teaser only — full piece is behind the WhatsApp rich link */
          <>
            {teaserText && (
              <article className="space-y-4">
                <p className="text-base sm:text-lg text-neutral-300 leading-relaxed whitespace-pre-line">
                  {teaserText}
                </p>
              </article>
            )}

            <section className="border-t border-neutral-800 pt-12 pb-12 space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-[#C0392B]">
                  Full protocol
                </p>
                <h2
                  className="text-3xl sm:text-4xl font-black uppercase text-white"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  Get the complete piece on WhatsApp
                </h2>
                <p className="text-base text-neutral-300 leading-relaxed max-w-2xl">
                  The full guide and step-by-step protocol are not on this page.
                  Tap below and we&apos;ll send a rich link to your WhatsApp —
                  open it there to unlock everything.
                </p>
              </div>
              <Sor7edButton
                slug={slug}
                context="article"
                isLoggedIn={isLoggedIn}
                whatsappVerified={whatsappVerified}
                size="lg"
              />
            </section>
          </>
        )}
      </main>
    </div>
  )
}
