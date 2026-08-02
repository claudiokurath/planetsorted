import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ContentCard } from '@/components/ContentCard'
import { createServerClient } from '@/lib/supabase/server'
import type { Protocol } from '@/lib/types/database'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

export const metadata: Metadata = {
  title: 'PLANET SOR7ED — Templates, Not Inspiration',
  description: 'Practical protocols, tools, and templates for neurodivergent adults. No app. No spam. Just what works.',
  openGraph: {
    title: 'PLANET SOR7ED',
    description: 'Templates, not inspiration. Practical protocols and tools for neurodivergent adults.',
    images: [
      {
        url: `${SITE}/images/banners/hero-banner.jpg`,
        type: 'image/jpeg',
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
    images: [`${SITE}/images/banners/hero-banner.jpg`],
  },
}

export const revalidate = 60

export default async function HomePage() {
  const supabase = createServerClient()

  const { data: rawProtocols } = await supabase
    .from('protocols')
    .select('slug, title, summary, cover_image, category, read_time')
    .or('type.eq.Article,type.is.null')
    .eq('status', 'Published')
    .order('updated_at', { ascending: false })
    .limit(4)

  const articles = (rawProtocols as Protocol[]) || []

  const { data: rawTools } = await supabase
    .from('protocols')
    .select('slug, title, summary, cover_image, category, read_time')
    .eq('type', 'Tool')
    .eq('status', 'Published')
    .order('updated_at', { ascending: false })
    .limit(3)

  const tools = (rawTools as Protocol[]) || []

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Cinematic Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-3xl border border-neutral-800/80 bg-neutral-950 shadow-2xl min-h-[420px] sm:min-h-[560px] flex items-end">
          {/* Background Banner Image */}
          <Image
            src="/images/banners/hero-banner.png"
            alt="PLANET SOR7ED Hero Banner"
            fill
            priority
            unoptimized
            className="object-cover object-center opacity-75 sm:opacity-85 transition-transform duration-700 hover:scale-105"
          />
          {/* Sophisticated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent sm:bg-gradient-to-r sm:from-black sm:via-black/75 sm:to-transparent" />

          {/* Integrated Typography */}
          <div className="relative z-10 p-6 sm:p-12 lg:p-16 max-w-3xl space-y-5">
            <div className="flex items-center gap-3">
              <span className="h-0.5 w-10 rounded-full bg-[#C0392B]" />
            </div>
            <h1 className="text-6xl sm:text-8xl font-black uppercase leading-none tracking-tight text-white drop-shadow-lg" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Templates,<br /><span style={{ color: '#C0392B' }}>not inspiration.</span>
            </h1>
            <p className="text-lg sm:text-2xl leading-relaxed text-neutral-200 font-normal drop-shadow max-w-2xl">
              Practical protocols and tools for neurodivergent adults. No app. No spam. Just what works.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-[#262626] my-6" />
      </div>

      {/* Guidebook Section */}
      {articles.length > 0 && (
        <>
          <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="h-1 w-16 bg-[#C0392B] rounded-full mb-6" />
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

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="h-px bg-[#262626] my-8" />
          </div>
        </>
      )}

      {/* Toolbox Section */}
      {tools.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 pb-24 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="h-1 w-16 bg-[#C0392B] rounded-full mb-6" />
              <h2 className="text-5xl sm:text-6xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                Toolbox
              </h2>
            </div>
            <Link href="/tools" className="text-sm font-bold uppercase tracking-wider text-[#C0392B] hover:text-white transition-colors underline underline-offset-4">
              View all tools →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {tools.map((tool) => (
              <ContentCard
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                title={tool.title}
                summary={tool.summary || ''}
                coverImage={tool.cover_image}
                category={tool.category}
                meta={tool.read_time}
              />
            ))}
          </div>
        </section>
      )}

      {/* About Us Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 pb-24 sm:px-6 lg:px-8">
        <div className="h-px bg-[#262626] mb-12" />
        <div className="max-w-2xl">
          <div className="h-1 w-16 bg-[#C0392B] rounded-full mb-6" />
          <h2 className="text-5xl sm:text-6xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            About Sor7ed
          </h2>
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-neutral-300">
            PLANET SOR7ED is templates, not inspiration — practical tools and protocols for neurodivergent adults.
            No app. No spam. Just what works.
          </p>
          <Link href="/about" className="mt-6 inline-block text-sm font-bold uppercase tracking-wider text-[#C0392B] hover:text-white transition-colors underline underline-offset-4">
            More about us →
          </Link>
        </div>
      </section>
    </div>
  )
}
