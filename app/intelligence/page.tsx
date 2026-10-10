import { CollectionIntroduction, CollectionEnding } from '@/components/CollectionIntroduction'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { ContentCard } from '@/components/ContentCard'

const SITE = process.env.SITE_URL ?? 'https://planetsorted.com'
const OG_CARD = '/api/og?card=welcome'

export const metadata: Metadata = {
  title: 'Guidebook — PLANET SOR7ED',
  description: 'Plain-English protocols that turn chaos into a next step.',
  openGraph: {
    title: 'Guidebook — PLANET SOR7ED',
    description: 'Plain-English protocols that turn chaos into a next step.',
    images: [
      {
        url: `${SITE}${OG_CARD}`,
        type: 'image/png',
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
    images: [`${SITE}${OG_CARD}`],
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
    <div className="sorted-about-page">
      <CollectionIntroduction collection="guidebook" />
      <section id="collection-content" className="sorted-about-block sorted-collection-content" aria-labelledby="published-guides">
        <h2 id="published-guides">From the intelligence domain</h2>
        <p className="sorted-collection-description">Explore the full collection of shame-free, practical guides.</p>

        {!articles || articles.length === 0 ? (
          <p className="py-12 text-center text-neutral-500">No protocols published yet.</p>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <ContentCard
                key={article.slug}
                href={`/intelligence/${article.slug}`}
                title={article.title}
                summary={article.summary}
                coverImage={article.cover_image}
                category={article.category}
                meta={article.read_time || undefined}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
      <CollectionEnding collection="guidebook" />
    </div>
  )
}
