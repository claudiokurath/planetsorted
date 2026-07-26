import type { Metadata } from 'next'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import { ContentCard } from '@/components/ContentCard'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

export const metadata: Metadata = {
  title: 'Guidebook — Planet Sorted',
  description: 'Plain-English protocols that turn chaos into a next step.',
  openGraph: {
    title: 'Guidebook — Planet Sorted',
    description: 'Plain-English protocols that turn chaos into a next step.',
    images: [
      {
        url: `${SITE}/images/banners/guidebook-banner.png`,
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'Planet Sorted Guidebook',
      },
    ],
    url: `${SITE}/intelligence`,
    siteName: 'Planet Sorted',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guidebook — Planet Sorted',
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
    .order('updated_at', { ascending: false })

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 lg:px-8">
        {/* Full 16:9 Landscape Banner Image Aligned to Content Container */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-neutral-800 shadow-2xl mb-8">
          <Image
            src="/images/banners/guidebook-banner.png"
            alt="Guidebook Banner"
            fill
            priority
            unoptimized
            className="object-cover"
          />
        </div>

        {/* Header Title & Subtitle */}
        <div className="mb-10">
          <div className="h-1 w-16 rounded-full bg-[#C0392B] mb-3" />
          <h1 className="text-5xl sm:text-6xl font-black uppercase text-white tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Guidebook
          </h1>
          <p className="mt-2 text-lg sm:text-xl text-neutral-300 max-w-2xl">
            Plain-English protocols that turn chaos into a next step.
          </p>
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
