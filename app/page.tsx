import type { Metadata } from 'next'
import Image from 'next/image'
import { ContentCard } from '@/components/ContentCard'
import { PageHeader } from '@/components/PageHeader'
import { createServerClient } from '@/lib/supabase/server'
import { CATEGORY_LIST } from '@/lib/categoryStyles'

const SITE = process.env.SITE_URL ?? 'https://www.sor7ed.com'
const OG_CARD = '/api/og?card=welcome'

const DESC =
  'SOR7ED is a practical support platform for ADHD, autistic, AuDHD, dyslexic, bipolar and other neurodivergent adults — honest editorial content paired with interactive tools that end in a real next step.'

export const metadata: Metadata = {
  title: 'PLANET SOR7ED — Tools built for brains that work differently',
  description: DESC,
  openGraph: {
    title: 'PLANET SOR7ED',
    description: DESC,
    images: [{ url: `${SITE}${OG_CARD}`, type: 'image/png', alt: 'PLANET SOR7ED' }],
    url: SITE,
    siteName: 'PLANET SOR7ED',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PLANET SOR7ED — Tools built for brains that work differently',
    description: DESC,
    images: [`${SITE}${OG_CARD}`],
  },
}

export const revalidate = 60

export default async function HomePage() {
  const supabase = createServerClient()

  // One query, then count in memory — seven buckets is not worth seven round trips.
  const { data: published } = await supabase
    .from('protocols')
    .select('category')
    .eq('status', 'Published')

  const counts = new Map<string, number>()
  for (const row of published ?? []) {
    const key = (row as { category: string | null }).category
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Entrance band. Never overlaid with text — the artwork carries the
          personality, the type below carries the message. */}
      <div
        className="relative w-full overflow-hidden border-b border-white/10"
        style={{ height: 'clamp(104px, 15vw, 152px)' }}
      >
        <Image
          src="/images/banners/main.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
        <PageHeader
          eyebrow="PLANET SOR7ED"
          title="Seven Pillars"
          description="Every part of neurodivergent adult life. Start where you actually are."
        />

        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_LIST.map((pillar, index) => {
            const count = counts.get(pillar.label) ?? 0
            return (
              <ContentCard
                key={pillar.slug}
                href={`/category/${pillar.slug}`}
                title={pillar.label}
                summary={pillar.tagline}
                category={pillar.label}
                meta={count > 0 ? `${count} ${count === 1 ? 'PROTOCOL' : 'PROTOCOLS'}` : undefined}
                index={index}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
