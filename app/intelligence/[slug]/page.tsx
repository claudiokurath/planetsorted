import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient, createSessionClient } from '@/lib/supabase/server'
import { ContentHero } from '@/components/ContentHero'
import { ProtocolDeck } from '@/components/ProtocolDeck'
import { Sor7edButton } from '@/components/buttons/Sor7edButton'
import { buildProtocolDeck } from '@/lib/protocolDeck'
import { verifyArticleAccessToken } from '@/lib/crypto/tokens'
import type { Protocol } from '@/lib/types/database'

interface Props {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ access_token?: string }>
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

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
  const actionProtocolText = item.protocol?.trim() || ''

  // Locked visitors only see a short teaser — never the full problem body or protocol.
  const teaserText =
    item.excerpt?.trim() ||
    item.summary?.trim() ||
    item.meta_description?.trim() ||
    (rawBodyText ? rawBodyText.slice(0, 280).trim() + (rawBodyText.length > 280 ? '…' : '') : '')

  // Unlocked: kit-style presentation deck (black + yellow info sheets)
  if (isUnlocked) {
    const deck = buildProtocolDeck({
      title: item.title,
      lede: description,
      category: item.category,
      readTime: item.read_time,
      coverImage: item.cover_image,
      body: rawBodyText,
      protocol: actionProtocolText || null,
    })

    return (
      <div className="min-h-screen bg-black text-white">
        <main className="px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
          <ProtocolDeck
            deck={deck}
            bodyText={[rawBodyText, actionProtocolText].filter(Boolean).join('\n\n')}
            audioUrl={audioUrl}
            isSubscriber={isSubscriber || isUnlocked}
          />
        </main>
      </div>
    )
  }

  // Locked: compact hero + teaser + WhatsApp unlock CTA
  return (
    <div className="min-h-screen bg-black text-white">
      <ContentHero
        title={item.title}
        description={description}
        coverImage={item.cover_image}
        category={item.category}
        meta={item.read_time}
      />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {teaserText ? (
          <article className="rounded-3xl border border-neutral-800 bg-neutral-950/60 px-6 py-8 sm:px-8 sm:py-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500 mb-4">
              Preview
            </p>
            <p className="text-base sm:text-lg text-neutral-200 leading-relaxed whitespace-pre-line">
              {teaserText}
            </p>
          </article>
        ) : null}

        <section className="rounded-3xl border border-[#C0392B]/40 bg-[#C0392B]/5 p-8 sm:p-10 space-y-6">
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
              open it there to unlock everything as a visual kit.
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
      </main>
    </div>
  )
}
