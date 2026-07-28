import type { Metadata } from 'next'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import { ContentCard } from '@/components/ContentCard'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

export const metadata: Metadata = {
  title: 'Guidebook — PLANET SOR7ED',
  description: 'Plain-English protocols that turn chaos into a next step.',
  openGraph: {
    title: 'Guidebook — PLANET SOR7ED',
    description: 'Plain-English protocols that turn chaos into a next step.',
    images: [
      {
        url: `${SITE}/images/banners/guidebook-banner.jpg`,
        type: 'image/jpeg',
        alt: 'PLANET SOR7ED Guidebook',
      },
    ],
    url: `${SITE}/intelligence`,
    siteName: 'PLANET SOR7ED',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guidebook — PLANET SOR7ED',
    description: 'Plain-English protocols that turn chaos into a next step.',
    images: [`${SITE}/images/banners/guidebook-banner.png`],
  },
}

export const revalidate = 60

export default async function GuidebookListingPage() {
  const supabase = createServerClient()

  const { data: articles } = await supabase
    .from('protocols')
    .select('slug, title, summary, cover_image, read_time, category')
    .eq('status', 'Published')
    .or('type.eq.Article,type.is.null')
    .order('updated_at', { ascending: false })

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 lg:px-8">
        {/* Cinematic Hero Banner with Integrated Typography */}
        <div className="relative w-full overflow-hidden rounded-3xl border border-neutral-800/80 bg-neutral-950 shadow-2xl mb-12 min-h-[280px] sm:min-h-[340px] flex items-end">
          {/* Background Banner Image */}
          <Image
            src="/images/banners/guidebook-banner.png"
            alt="Guidebook Banner"
            fill
            priority
            unoptimized
            className="object-cover object-center opacity-75 sm:opacity-85 transition-transform duration-700 hover:scale-105"
          />
          {/* Sophisticated Gradient Overlay (smooth transition from dark left/bottom for legibility while revealing background art on right/top) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent sm:bg-gradient-to-r sm:from-black sm:via-black/70 sm:to-transparent" />

          {/* Integrated Title & Subtitle */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-0.5 w-10 rounded-full bg-[#C0392B]" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-300">
                PLANET SOR7ED INTELLIGENCE
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black uppercase text-white tracking-tight drop-shadow-md" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Guidebook
            </h1>
            <p className="mt-3 text-base sm:text-lg text-neutral-200 font-normal leading-relaxed drop-shadow">
              Plain-English protocols that turn chaos into a next step.
            </p>
          </div>
        </div>

        {/* Guidebook Articles Grid */}
        {!articles || articles.length === 0 ? (
          <p className="text-center text-neutral-500 py-12">No protocols published yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {articles.map((article) => (
              <ContentCard
                key={article.slug}
                href={`/intelligence/${article.slug}`}
                title={article.title}
                summary={article.summary || ''}
                coverImage={article.cover_image}
                category={article.category}
                meta={article.read_time ? `${article.read_time} read` : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
