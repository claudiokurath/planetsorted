import Link from 'next/link'
import type { Metadata } from 'next'
import { ContentCard } from '@/components/ContentCard'
import { createServerClient } from '@/lib/supabase/server'
import type { Protocol } from '@/lib/types/database'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
const LOGO_IMAGE = '/images/sor7ed-logo.png'

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
      {/* Text-led Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-3xl border border-neutral-800/80 bg-gradient-to-br from-neutral-950 to-black shadow-2xl min-h-[360px] sm:min-h-[440px] flex items-end">
          <div className="relative z-10 max-w-4xl space-y-5 p-6 sm:p-12 lg:p-16">
            <div className="flex items-center gap-3">
              <span className="h-0.5 w-10 rounded-full bg-[#C0392B]" />
            </div>
            <h1 className="text-5xl sm:text-7xl font-black leading-[1.02] tracking-[-0.035em] text-white drop-shadow-lg">
              Templates,<br /><span style={{ color: '#C0392B' }}>not inspiration.</span>
            </h1>
            <p className="text-lg sm:text-2xl leading-relaxed text-neutral-200 font-normal drop-shadow max-w-2xl">
              Practical protocols and tools for neurodivergent adults. No app. No spam. Just what works.
            </p>
            <div id="about" className="max-w-3xl border-t border-neutral-800 pt-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C0392B]">
                About PLANET SOR7ED
              </p>
              <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-[-0.025em] text-white sm:text-3xl">
                Practical help for brains that already have enough going on.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-neutral-300 sm:text-lg">
                PLANET SOR7ED creates shame-free tools, templates and plain-English protocols for neurodivergent adults. No productivity theatre—just a clear answer and one manageable next step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Toolbox Section */}
      {tools.length > 0 && (
        <section className="border-y border-neutral-300 bg-[#f0e4cd] text-black">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="h-1 w-16 bg-[#C0392B] rounded-full mb-6" />
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.025em] text-black">
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
                  href={`/tools/${tool.slug}`}
                  title={tool.title}
                  summary={tool.summary || ''}
                  coverImage={tool.cover_image}
                  category={tool.category}
                  meta={tool.read_time}
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
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="h-1 w-16 bg-[#C0392B] rounded-full mb-6" />
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.025em] text-white">
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
