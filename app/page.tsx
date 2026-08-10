import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ContentCard } from '@/components/ContentCard'
import { createServerClient } from '@/lib/supabase/server'
import { getToolRoute } from '@/lib/standaloneRoutes'
import type { Protocol } from '@/lib/types/database'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
const LOGO_IMAGE = '/images/sor7ed-logo.png'
const SECTION_HEADING_CLASS = 'text-6xl font-black uppercase leading-none tracking-[-0.025em] sm:text-7xl'
const SECTION_HEADING_STYLE = { fontFamily: "'Bebas Neue', sans-serif" }
const HOW_IT_WORKS = [
  {
    number: '01',
    title: 'Choose',
    description: 'Pick a tool or open a Guidebook post that matches what you need.',
  },
  {
    number: '02',
    title: 'Open',
    description: 'Tap the SOR7ED button to open the tool instantly — no app, no sign-up required.',
  },
  {
    number: '03',
    title: 'Use',
    description: 'Work through the tool and get your result, your plan, or your next step.',
  },
] as const

export const metadata: Metadata = {
  title: 'PLANET SOR7ED — Templates, Not Inspiration',
  description: 'Practical protocols, tools, and templates for neurodivergent adults. No app. No spam. Just what works.',
  openGraph: {
    title: 'PLANET SOR7ED',
    description: 'Templates, not inspiration. Practical protocols and tools for neurodivergent adults.',
    images: [
      {
        url: `${SITE}${LOGO_IMAGE}`,
        type: 'image/png',
        alt: 'PLANET SOR7ED — Templates, not inspiration.',
      },
    ],
    url: SITE,
    siteName: 'PLANET SOR7ED',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PLANET SOR7ED — Templates, Not Inspiration',
    description: 'Practical protocols, tools, and templates for neurodivergent adults. No app. No spam. Just what works.',
    images: [`${SITE}${LOGO_IMAGE}`],
  },
}

export const revalidate = 60

export default async function HomePage() {
  const supabase = createServerClient()

  const [{ data: rawProtocols }, { data: rawTools }] = await Promise.all([
    supabase
      .from('protocols')
      .select('slug, title, summary, cover_image, category, read_time')
      .or('type.eq.Article,type.is.null')
      .eq('status', 'Published')
      .order('updated_at', { ascending: false })
      .limit(6),
    supabase
      .from('protocols')
      .select('slug, title, summary, cover_image, category, read_time')
      .eq('type', 'Tool')
      .eq('status', 'Published')
      .order('updated_at', { ascending: false })
      .limit(6),
  ])

  const articles = (rawProtocols as Protocol[]) || []
  const tools = (rawTools as Protocol[]) || []

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Image-led Hero Section */}
      <section id="about" className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
        <div className="relative flex min-h-[520px] w-full items-end overflow-hidden rounded-3xl border border-neutral-800/80 bg-black shadow-2xl sm:min-h-[600px] lg:min-h-[640px]">
          <Image
            src="/images/planet-sor7ed-hero-whatsapp.png"
            alt=""
            fill
            preload
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-[52%_center] sm:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

          <div className="relative z-10 max-w-3xl space-y-6 p-6 sm:p-12 lg:p-16">
            <div className="h-1 w-16 rounded-full bg-[#C0392B]" />
            <h1 className="text-5xl font-black uppercase leading-[0.95] tracking-[-0.035em] text-white drop-shadow-lg sm:text-7xl lg:text-8xl">
              Practical tools for neurodivergent life admin.
            </h1>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-neutral-100 drop-shadow sm:text-xl lg:text-2xl">
              PLANET SOR7ED helps you turn overwhelm into one clear, manageable next step — with templates, protocols, and plain-English tools built for brains that already have enough going on.
            </p>
            <p className="text-base font-bold text-white drop-shadow sm:text-lg">
              No app. No spam. Just what works.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-5 h-1 w-16 rounded-full bg-[#C0392B]" />
          <h2 className={`${SECTION_HEADING_CLASS} text-white`} style={SECTION_HEADING_STYLE}>
            How it works
          </h2>
        </div>

        <ol className="grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS.map((step) => (
            <li key={step.number} className="mx-auto flex aspect-square w-full max-w-[280px] flex-col items-center justify-center rounded-full border border-[#C0392B]/70 bg-[#141414] p-8 text-center shadow-xl">
              <span className="text-sm font-bold tracking-[0.2em] text-[#C0392B]">{step.number}</span>
              <h3
                className="mt-3 text-4xl font-black uppercase leading-none text-white"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {step.title}
              </h3>
              <p className="mt-3 max-w-[200px] text-sm leading-relaxed text-neutral-300">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Toolbox Section */}
      {tools.length > 0 && (
        <section className="border-y border-neutral-300 bg-[#f0e4cd] text-black">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="h-1 w-16 bg-[#C0392B] rounded-full mb-5" />
                <h2 className={`${SECTION_HEADING_CLASS} text-black`} style={SECTION_HEADING_STYLE}>
                  Toolbox
                </h2>
              </div>
              <Link href="/tools" className="text-sm font-bold uppercase tracking-wider text-[#9f2f27] hover:text-black transition-colors underline underline-offset-4">
                View all tools →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {tools.map((tool) => (
                <ContentCard
                  key={tool.slug}
                  href={getToolRoute(tool.slug)}
                  title={tool.title}
                  summary={tool.summary || ''}
                  coverImage={tool.cover_image}
                  category={tool.category}
                  meta={tool.read_time}
                  compact
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Guidebook Section */}
      {articles.length > 0 && (
        <>
          <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="h-1 w-16 bg-[#C0392B] rounded-full mb-5" />
                <h2 className={`${SECTION_HEADING_CLASS} text-white`} style={SECTION_HEADING_STYLE}>
                  Guidebook
                </h2>
              </div>
              <Link href="/intelligence" className="text-sm font-bold uppercase tracking-wider text-[#C0392B] hover:text-white transition-colors underline underline-offset-4">
                View full Guidebook →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {articles.map((article) => (
                <ContentCard
                  key={article.slug}
                  href={`/intelligence/${article.slug}`}
                  title={article.title}
                  summary={article.summary || ''}
                  coverImage={article.cover_image}
                  category={article.category}
                  meta={article.read_time || undefined}
                  compact
                />
              ))}
            </div>
          </section>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="h-px bg-[#262626] my-8" />
          </div>
        </>
      )}

    </div>
  )
}
