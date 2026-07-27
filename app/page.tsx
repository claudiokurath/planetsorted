import Link from 'next/link'
import type { Metadata } from 'next'
import { ContentCard } from '@/components/ContentCard'
import { PRIORITY_TOOLS } from '@/lib/toolsData'
import { createServerClient } from '@/lib/supabase/server'
import type { Protocol } from '@/lib/types/database'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

export const metadata: Metadata = {
  title: 'Planet Sorted — Templates, Not Inspiration',
  description: 'Practical protocols, tools, and templates for neurodivergent adults. No app. No spam. Just what works.',
  openGraph: {
    title: 'Planet Sorted — Templates, Not Inspiration',
    description: 'Practical protocols, tools, and templates for neurodivergent adults. No app. No spam. Just what works.',
    images: [
      {
        url: `${SITE}/images/banners/guidebook-banner.png`,
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'Planet Sorted',
      },
    ],
    url: SITE,
    siteName: 'Planet Sorted',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planet Sorted — Templates, Not Inspiration',
    description: 'Practical protocols, tools, and templates for neurodivergent adults. No app. No spam. Just what works.',
    images: [`${SITE}/images/banners/guidebook-banner.png`],
  },
}

export default async function HomePage() {
  const supabase = createServerClient()

  const { data: rawProtocols } = await supabase
    .from('protocols')
    .select('slug, title, summary, cover_image, category, read_time')
    .eq('status', 'Published')
    .order('updated_at', { ascending: false })
    .limit(4)

  const articles = (rawProtocols as Protocol[]) || []

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 lg:px-8">
        <div className="space-y-6 max-w-3xl">
          <div className="h-1 w-16 bg-[#C0392B] rounded-full mb-6" />
          <p className="mb-3 font-bold text-sm tracking-[0.25em] uppercase text-[#3498DB]">Planet Sorted</p>
          <h1 className="text-6xl sm:text-8xl font-black uppercase leading-none tracking-tight text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Templates,<br /><span style={{ color: '#C0392B' }}>not inspiration.</span>
          </h1>
          <p className="text-xl sm:text-2xl leading-relaxed text-neutral-300">
            Practical protocols and tools for neurodivergent adults. No app. No spam. Just what works.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-[#262626] my-6" />
      </div>

      {/* Guidebook Section */}
      {articles.length > 0 && (
        <>
          <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="h-1 w-16 bg-[#C0392B] rounded-full mb-6" />
                <p className="mb-1 font-bold text-sm tracking-[0.25em] uppercase text-[#3498DB]">Protocols &amp; Briefs</p>
                <h2 className="text-5xl sm:text-6xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  Guidebook
                </h2>
              </div>
              <Link href="/intelligence" className="text-sm font-bold uppercase tracking-wider text-[#C0392B] hover:text-white transition-colors underline underline-offset-4">
                View full Guidebook →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
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
          </section>

          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="h-px bg-[#262626] my-8" />
          </div>
        </>
      )}

      {/* Toolbox Section */}
      <section className="mx-auto max-w-6xl px-4 py-12 pb-24 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="h-1 w-16 bg-[#C0392B] rounded-full mb-6" />
            <p className="mb-1 font-bold text-sm tracking-[0.25em] uppercase text-[#3498DB]">Interactive Web Apps</p>
            <h2 className="text-5xl sm:text-6xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Toolbox
            </h2>
          </div>
          <Link href="/tools" className="text-sm font-bold uppercase tracking-wider text-[#C0392B] hover:text-white transition-colors underline underline-offset-4">
            View all tools →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {PRIORITY_TOOLS.map((tool) => (
            <ContentCard
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              title={tool.title}
              summary={tool.summary}
              coverImage={tool.image}
              category={tool.category}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
