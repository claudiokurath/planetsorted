import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient, createSessionClient } from '@/lib/supabase/server'
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

  const { data: relatedTools } = await supabase
    .from('protocols')
    .select('slug, title')
    .eq('category', item.category)
    .eq('type', 'Tool')
    .eq('status', 'Published')
    .order('updated_at', { ascending: false })
    .limit(1)

  const relatedTool = relatedTools?.[0] ?? null

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

  // Do not paywall the basic answer: the problem/body is always free to read.
  // Only the step-by-step protocol requires a WhatsApp rich-link HMAC
  // (/r/[slug] mints access_token) to unlock — never a sign-in shortcut.
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

        {!isUnlocked ? (
          <section className="mx-auto mt-6 max-w-6xl space-y-6 rounded-3xl border border-[#E53935]/35 bg-[#E53935]/10 p-8 sm:mt-8 sm:p-10">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[#E53935]">
                Full protocol
              </p>
              <h2
                className="font-bebas text-3xl sm:text-4xl font-black uppercase text-white"
              >
                Get the step-by-step protocol on WhatsApp
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-neutral-300">
                You just read the full piece — free, no strings attached. The
                step-by-step protocol that turns it into action is
                WhatsApp-only. Tap below and we&apos;ll send a rich link to
                open it there.
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
        ) : null}

        {relatedTool ? (
          <section className="mx-auto mt-6 max-w-6xl sm:mt-8">
            <Link
              href={`/tools/${relatedTool.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/60 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-200 transition-colors hover:border-[#E53935] hover:text-[#E53935]"
            >
              Try the {item.category} tool: {relatedTool.title} →
            </Link>
          </section>
        ) : null}
      </main>
    </div>
  )
}
