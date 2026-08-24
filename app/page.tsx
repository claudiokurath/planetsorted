import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ContentCard } from '@/components/ContentCard'
import { PageHeader } from '@/components/PageHeader'
import { createServerClient } from '@/lib/supabase/server'
import { getToolRoute } from '@/lib/standaloneRoutes'
import type { Protocol } from '@/lib/types/database'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
const LOGO_IMAGE = '/images/sor7ed-logo.png'
const SECTION_HEADING_CLASS = 'text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl lg:text-6xl'
const SECTION_HEADING_STYLE = { fontFamily: "'Bebas Neue', sans-serif" }
const HOW_IT_WORKS = [
  {
    number: '01',
    title: 'Choose',
    description: 'Pick a tool or open a Guidebook post that matches what you need.',
  },
  {
    number: '02',
    title: 'Tap',
    description: 'Tap the SOR7ED button — it goes straight to your WhatsApp. Sign in once, then every tap after that is instant.',
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
      {/* Slim hero — same compact language as every other page header */}
      <section id="about" className="border-b border-neutral-900">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:py-14">
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <span className="h-0.5 w-8 rounded-full bg-[#C0392B]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                PLANET SOR7ED
              </span>
            </div>
            <h1
              className={`${SECTION_HEADING_CLASS} text-white`}
              style={SECTION_HEADING_STYLE}
            >
              Practical tools for neurodivergent life admin.
            </h1>
            <p className="max-w-xl text-sm font-medium leading-relaxed text-neutral-300 sm:text-base">
              Turn overwhelm into one clear next step — templates, protocols, and plain-English tools built for brains that already have enough going on.
            </p>
            <p className="text-sm font-bold text-white sm:text-base">
              No app. No spam. Just what works.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/tools"
                className="inline-flex items-center rounded-full bg-[#C0392B] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#A93226]"
              >
                Open Toolbox
              </Link>
              <Link
                href="/intelligence"
                className="inline-flex items-center rounded-full border border-neutral-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-200 transition-colors hover:border-neutral-500 hover:text-white"
              >
                Browse Guidebook
              </Link>
            </div>
          </div>

          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-neutral-800 bg-black shadow-xl sm:aspect-[16/9]">
            <Image
              src="/images/planet-sor7ed-hero-whatsapp-16x9.png"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="mb-8">
            <div className="h-1 w-12 rounded-full bg-[#C0392B] mb-4" />
            <h2 className={`${SECTION_HEADING_CLASS} text-white`} style={SECTION_HEADING_STYLE}>
              How it works
            </h2>
          </div>

          <ol className="grid gap-4 sm:grid-cols-3 sm:gap-6">
            {HOW_IT_WORKS.map((step) => (
              <li
                key={step.number}
                className="flex flex-col rounded-2xl bg-[#0f0f0f] p-6 text-left shadow-lg"
              >
                <span className="text-xs font-bold tracking-[0.2em] text-[#C0392B]">{step.number}</span>
                <h3
                  className="mt-2 text-3xl font-black uppercase leading-none text-white"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-300">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Toolbox Section */}
      {tools.length > 0 && (
        <section className="border-b border-neutral-800 bg-black text-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="h-1 w-12 rounded-full bg-[#C0392B] mb-4" />
                <h2 className={`${SECTION_HEADING_CLASS} text-white`} style={SECTION_HEADING_STYLE}>
                  Toolbox
                </h2>
              </div>
              <Link
                href="/tools"
                className="text-sm font-bold uppercase tracking-wider text-[#C0392B] underline underline-offset-4 transition-colors hover:text-white"
              >
                View all tools →
              </Link>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <ContentCard
                  key={tool.slug}
                  href={getToolRoute(tool.slug)}
                  title={tool.title}
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
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <PageHeader
            title="Guidebook"
            description="Plain-English protocols that turn chaos into a next step."
            action={
              <Link
                href="/intelligence"
                className="text-sm font-bold uppercase tracking-wider text-[#C0392B] underline underline-offset-4 transition-colors hover:text-white"
              >
                View all guidebooks →
              </Link>
            }
          />

          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ContentCard
                key={article.slug}
                href={`/intelligence/${article.slug}`}
                title={article.title}
                coverImage={article.cover_image}
                category={article.category}
                meta={article.read_time || undefined}
                compact
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
