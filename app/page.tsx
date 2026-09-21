import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { AboutIntro } from '@/components/AboutIntro'
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
    <div
      className="min-h-screen bg-black text-white"
      style={{ scrollSnapType: 'y proximity' }}
    >
      {/* Entrance band. Deliberately short and never overlaid with text — the
          artwork carries the personality, the type below carries the message. */}
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

      <AboutIntro />

      {/* Pillars. Same card treatment as the Guidebook — PageHeader and
          ContentCard already do this job on /intelligence, so this is
          composition rather than a second set of components. */}
      <section
        className="border-t border-white/10 bg-black"
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <PageHeader
            eyebrow="Content pillars"
            title="7 Pillars"
            description="Every part of ND adult life. Pick a pillar to see its tools and guidebook protocols."
          />

          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_LIST.map((pillar, index) => {
              const count = counts.get(pillar.label) ?? 0
              return (
                <ContentCard
                  key={pillar.slug}
                  href={`/category/${pillar.slug}`}
                  title={pillar.label}
                  summary={pillar.blurb}
                  category={pillar.label}
                  meta={count > 0 ? `${count} ${count === 1 ? 'PROTOCOL' : 'PROTOCOLS'}` : undefined}
                  index={index}
                />
              )
            })}
          </div>

          <div className="mt-16 flex flex-col items-center gap-3 border-t border-white/10 pt-8 text-center sm:mt-20">
            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Built by Claudio Kurath in London
            </p>
            <Link
              href="/tools"
              className="font-bebas text-lg uppercase tracking-normal text-[#F5C518] transition-opacity hover:opacity-80"
            >
              Start with a tool &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
