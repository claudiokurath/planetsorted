import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient, createSessionClient } from '@/lib/supabase/server'
import { ProtocolDeck } from '@/components/ProtocolDeck'
import { Sor7edButton } from '@/components/buttons/Sor7edButton'
import { buildProtocolDeck } from '@/lib/protocolDeck'
import { verifyArticleAccessToken } from '@/lib/crypto/tokens'
import { gammaEmbedUrl } from '@/lib/content/gammaEmbed'
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
    .select('title, summary, category, cover_image, problem, read_time, excerpt, meta_description, audio_url, protocol, slug, blog_gamma_url')
    .eq('slug', slug)
    .eq('status', 'Published')
    .single()

  const item = rawProtocol as Protocol | null
  if (!item) notFound()

  // Check user session & subscription
  const sessionSupabase = await createSessionClient()
  const { data: { user } } = await sessionSupabase.auth.getUser()
  const isLoggedIn = !!user
  let isSubscriber = false
  let whatsappVerified = false
  let isSaved = false

  if (user?.id) {
    const [entitlementResult, profileResult, savedItemResult] = await Promise.all([
      supabase
        .from('entitlements')
        .select('status')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .maybeSingle(),
      supabase
        .from('users')
        .select('whatsapp_verified')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('saved_items')
        .select('id')
        .eq('user_id', user.id)
        .like('url', `%/r/${slug}`)
        .limit(1)
        .maybeSingle(),
    ])

    const entitlement = entitlementResult.data
    isSubscriber = !!entitlement
    whatsappVerified = !!profileResult.data?.whatsapp_verified
    isSaved = !!savedItemResult.data
  }

  // The full blog post is public. The rich link delivered through the Sorted
  // flow mints the HMAC that additionally unlocks the step-by-step protocol
  // and the audio deep dive — those stay behind the button.
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
  const gammaEmbed = gammaEmbedUrl(item.blog_gamma_url ?? null)

  const { data: relatedTools } = await supabase
    .from('protocols')
    .select('slug, title')
    .eq('category', item.category)
    .eq('type', 'Tool')
    .eq('status', 'Published')
    .order('updated_at', { ascending: false })
    .limit(1)

  const relatedTool = relatedTools?.[0] ?? null

  // Kit-style presentation deck (black + red info sheets, matching the
  // SOR7ED PDF system). The full body is public; the protocol slide is only
  // included once unlocked, so its text never even reaches the client bundle
  // for signed-out visitors.
  const deck = buildProtocolDeck({
    title: item.title,
    lede: description,
    category: item.category,
    readTime: item.read_time,
    coverImage: item.cover_image,
    body: rawBodyText,
    protocol: isUnlocked ? actionProtocolText || null : null,
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        <ProtocolDeck
          deck={deck}
          bodyText={[rawBodyText, isUnlocked ? actionProtocolText : ''].filter(Boolean).join('\n\n')}
          audioUrl={isUnlocked ? audioUrl : undefined}
          isSubscriber={isSubscriber || isUnlocked}
        />

        {gammaEmbed ? (
          <section className="mx-auto mt-6 max-w-6xl sm:mt-8">
            <div className="overflow-hidden border border-white/[0.12] bg-black">
              <iframe
                src={gammaEmbed}
                title={`${item.title} — presentation`}
                loading="lazy"
                allow="fullscreen"
                className="block h-[70vh] max-h-[720px] w-full"
              />
            </div>
          </section>
        ) : null}

        <section className="mx-auto mt-6 max-w-6xl border-t border-neutral-900 pt-8 sm:mt-8">
          <Sor7edButton
            slug={item.slug}
            context="article"
            isLoggedIn={isLoggedIn}
            whatsappVerified={whatsappVerified}
            initiallySaved={isSaved}
            size="lg"
          />
        </section>

        {relatedTool ? (
          <section className="mx-auto mt-6 max-w-6xl sm:mt-8">
            <Link
              href={`/tools/${relatedTool.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-black px-4 py-2 text-xs font-medium uppercase tracking-wider text-neutral-200 transition-colors hover:border-[#F5C518] hover:text-[#F5C518]"
            >
              Try the {item.category} tool: {relatedTool.title} →
            </Link>
          </section>
        ) : null}
      </main>
    </div>
  )
}
