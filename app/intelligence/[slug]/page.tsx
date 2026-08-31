import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient, createSessionClient } from '@/lib/supabase/server'
import { ProtocolDeck } from '@/components/ProtocolDeck'
import { Sor7edButton } from '@/components/buttons/Sor7edButton'
import { buildProtocolDeck } from '@/lib/protocolDeck'
import { verifyArticleAccessToken } from '@/lib/crypto/tokens'
import { extractArticlePreview } from '@/lib/content/articlePreview'
import type { Protocol } from '@/lib/types/database'

interface Props {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ access_token?: string }>
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

function ArticlePreview({
  title,
  slug,
  category,
  coverImage,
  preview,
  isLoggedIn,
  whatsappVerified,
  isSaved,
}: {
  title: string
  slug: string
  category: string
  coverImage: string | null
  preview: string
  isLoggedIn: boolean
  whatsappVerified: boolean
  isSaved: boolean
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        <article className="relative mx-auto max-w-5xl overflow-hidden rounded-none border border-white/[0.12] bg-black">
          {coverImage ? (
            <div className="relative aspect-[16/6] w-full overflow-hidden sm:aspect-[16/7]">
              <Image
                src={coverImage}
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </div>
          ) : null}

          <div className="px-6 pb-10 pt-8 sm:px-10 sm:pb-14 lg:px-14">
            <div className="relative h-8 w-36">
              <Image
                src="/images/sor7ed-logo-white.png"
                alt="SOR7ED"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="mt-8 text-xs font-medium uppercase tracking-[0.14em] text-[#F5C518]">
              {category}
            </p>
            <h1 className="font-bebas mt-4 max-w-4xl text-7xl uppercase leading-[0.84] tracking-tight text-white sm:text-8xl lg:text-9xl">
              {title}
            </h1>
            <div className="mt-8 max-w-3xl whitespace-pre-line text-base leading-8 text-neutral-300 sm:text-lg">
              {preview}
            </div>

            <div className="mt-10 border-t border-white/10 pt-8">
              <Sor7edButton
                slug={slug}
                context="article"
                isLoggedIn={isLoggedIn}
                whatsappVerified={whatsappVerified}
                initiallySaved={isSaved}
                size="lg"
              />
            </div>
          </div>
        </article>
      </main>
    </div>
  )
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

  // The public page is a short preview. The rich link delivered through the
  // Sorted flow mints the HMAC that unlocks the full article and protocol.
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
  const preview = extractArticlePreview(rawBodyText, description)

  // Public visitors only see the clean TLDR text. Once signed in, the Sorted
  // action appears; the presentation deck and audio only arrive through the
  // verified link delivered by that action.
  if (!isUnlocked) {
    return (
      <ArticlePreview
        title={item.title}
        slug={item.slug}
        category={item.category}
        coverImage={item.cover_image}
        preview={preview}
        isLoggedIn={isLoggedIn}
        whatsappVerified={whatsappVerified}
        isSaved={isSaved}
      />
    )
  }

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
  // SOR7ED PDF system) — body slides are always built; the protocol slide
  // is only included once unlocked, so its text never even reaches the
  // client bundle for locked visitors.
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
          audioUrl={audioUrl}
          isSubscriber={isSubscriber || isUnlocked}
        />

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
