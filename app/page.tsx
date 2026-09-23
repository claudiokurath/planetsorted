import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { AboutIntro } from '@/components/AboutIntro'
import { ContentCard } from '@/components/ContentCard'
import { PageHeader } from '@/components/PageHeader'
import { createServerClient } from '@/lib/supabase/server'

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

  // Same shape and filters as /intelligence and /tools, capped at three so the
  // landing page stays a preview rather than a second listing page.
  const COLUMNS = 'slug, title, summary, cover_image, read_time, category'

  const [{ data: guidebook }, { data: toolbox }] = await Promise.all([
    supabase
      .from('protocols')
      .select(COLUMNS)
      .eq('status', 'Published')
      .or('type.eq.Article,type.is.null')
      .order('updated_at', { ascending: false })
      .limit(3),
    supabase
      .from('protocols')
      .select(COLUMNS)
      .eq('status', 'Published')
      .eq('type', 'Tool')
      .order('updated_at', { ascending: false })
      .limit(3),
  ])

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

      <PreviewRow
        eyebrow="PLANET SOR7ED INTELLIGENCE"
        title="Guidebook"
        description="Plain-English protocols that turn chaos into a next step."
        hrefBase="/intelligence"
        viewAllLabel="All protocols"
        items={guidebook ?? []}
      />

      <PreviewRow
        eyebrow="PLANET SOR7ED LAB"
        title="Toolbox"
        description="Interactive tools that turn overwhelm into a next action."
        hrefBase="/tools"
        viewAllLabel="All tools"
        items={toolbox ?? []}
      />

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 border-t border-white/10 px-4 py-12 text-center sm:px-6 lg:px-8">
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
  )
}

interface PreviewItem {
  slug: string
  title: string
  summary: string | null
  cover_image: string | null
  read_time: string | null
  category: string | null
}

function PreviewRow({
  eyebrow,
  title,
  description,
  hrefBase,
  viewAllLabel,
  items,
}: {
  eyebrow: string
  title: string
  description: string
  hrefBase: string
  viewAllLabel: string
  items: PreviewItem[]
}) {
  // Nothing published yet is a real state on this site — say nothing rather
  // than leaving an empty heading stranded on the page.
  if (items.length === 0) return null

  return (
    <section
      className="border-t border-white/10 bg-black"
      style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <PageHeader eyebrow={eyebrow} title={title} description={description} />

        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <ContentCard
              key={item.slug}
              href={`${hrefBase}/${item.slug}`}
              title={item.title}
              summary={item.summary ?? undefined}
              coverImage={item.cover_image}
              category={item.category}
              meta={item.read_time ?? undefined}
              showCover
            />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href={hrefBase}
            className="rounded-none border border-[#F5C518] px-7 py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-[#F5C518] transition-colors hover:bg-[#F5C518]/10"
          >
            {viewAllLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
