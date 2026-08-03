import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ContentCard } from '@/components/ContentCard'
import { createServerClient } from '@/lib/supabase/server'
import type { Protocol } from '@/lib/types/database'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'
const HERO_IMAGE = '/images/PLANET_SOR7ED_--chaos_5_--ar_43_--sref_httpss.mj.runemid8j-Qb_c1abf34d-6ca5-4774-8461-1602b00bcce2_2.png'

export const metadata: Metadata = {
  title: 'PLANET SOR7ED — Templates, Not Inspiration',
  description: 'Practical protocols, tools, and templates for neurodivergent adults. No app. No spam. Just what works.',
  openGraph: {
    title: 'PLANET SOR7ED',
    description: 'Templates, not inspiration. Practical protocols and tools for neurodivergent adults.',
    images: [
      {
        url: `${SITE}${HERO_IMAGE}`,
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
    images: [`${SITE}${HERO_IMAGE}`],
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
    <div className="min-h-screen overflow-hidden bg-[#090909] text-white">
      <section className="mx-auto max-w-[1500px] px-4 pt-5 sm:px-6 lg:px-8">
        <div className="sor7ed-hero-grid relative grid min-h-[640px] overflow-hidden border border-white/15 bg-[#111] lg:grid-cols-[1.08fr_.92fr]">
          <div className="relative z-10 flex flex-col justify-between p-7 sm:p-12 lg:p-16">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[.24em] text-white/55">
              <span>Planet SOR7ED / Sorted Lab</span>
              <span>Est. 2025</span>
            </div>
            <div className="max-w-4xl py-16 lg:py-8">
              <p className="mb-6 text-sm font-bold uppercase tracking-[.28em] text-[#ef4035]">One clear next step</p>
              <h1 className="text-[clamp(5rem,10vw,10rem)] font-black uppercase leading-[.72] tracking-[-.045em] text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                Templates,<br /><span className="text-[#ef4035]">not noise.</span>
              </h1>
              <p className="mt-9 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
                Practical protocols and tools for neurodivergent adults. Built to turn a loud problem into one doable move.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/tools" className="bg-[#ef4035] px-6 py-3 text-sm font-black uppercase tracking-[.14em] text-black transition hover:bg-white">Use a tool ↗</Link>
              <Link href="/intelligence" className="border border-white/35 px-6 py-3 text-sm font-black uppercase tracking-[.14em] transition hover:border-white hover:bg-white hover:text-black">Read the guidebook</Link>
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden border-t border-white/15 lg:min-h-full lg:border-l lg:border-t-0">
          <Image
            src={HERO_IMAGE}
            alt="Abstract PLANET SOR7ED artwork"
            fill
            priority
            unoptimized
            className="object-cover object-center saturate-[1.12] transition-transform duration-1000 hover:scale-[1.03]"
          />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <div className="absolute bottom-6 right-6 border border-white/40 bg-black/75 px-4 py-3 text-xs font-bold uppercase tracking-[.2em] backdrop-blur">
              Worry less / live more
            </div>
          </div>
        </div>
      </section>

      <div className="sor7ed-marquee mt-5 border-y border-white/15 bg-[#ef4035] py-3 text-black" aria-hidden="true">
        <div className="sor7ed-marquee-track flex w-max gap-10 text-sm font-black uppercase tracking-[.2em]">
          {[0, 1].map((group) => (
            <span key={group} className="flex gap-10">
              <span>Templates, not inspiration</span><span>◆</span><span>No app. No spam.</span><span>◆</span><span>Built for ADHD brains</span><span>◆</span><span>One clear next step</span><span>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* Guidebook Section */}
      {articles.length > 0 && (
        <>
          <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-[1fr_1fr] md:items-end">
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[.28em] text-[#ef4035]">01 / Protocols</p>
                <h2 className="text-7xl font-black uppercase leading-[.8] text-white sm:text-8xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  The<br />Guidebook
                </h2>
              </div>
              <div className="md:justify-self-end md:text-right">
                <p className="mb-5 max-w-md text-lg text-white/55">Plain-English protocols for the moments when your brain has too many tabs open.</p>
                <Link href="/intelligence" className="text-sm font-black uppercase tracking-[.16em] text-[#ef4035] hover:text-white">View every protocol →</Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12">
              {articles.map((article, index) => (
                <div key={article.slug} className={index === 0 ? 'lg:col-span-6' : 'lg:col-span-2'}>
                  <ContentCard href={`/intelligence/${article.slug}`} title={article.title} summary={article.summary || ''} coverImage={article.cover_image} category={article.category} meta={article.read_time ? `${article.read_time} read` : undefined} index={index + 1} featured={index === 0} />
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Toolbox Section */}
      {tools.length > 0 && (
        <section className="border-y border-white/15 bg-[#f0e4cd] text-black">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[.28em] text-[#b52e27]">02 / Interactive</p>
              <h2 className="text-7xl font-black uppercase leading-[.8] sm:text-8xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                Toolbox
              </h2>
            </div>
            <Link href="/tools" className="text-sm font-black uppercase tracking-[.16em] text-[#b52e27] hover:text-black">
              View all tools →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, index) => (
              <ContentCard key={tool.slug} href={`/tools/${tool.slug}`} title={tool.title} summary={tool.summary || ''} coverImage={tool.cover_image} category={tool.category} meta={tool.read_time} index={index + 1} light />
            ))}
          </div>
          </div>
        </section>
      )}

      {/* About Us Section */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-24 sm:px-6 md:grid-cols-[.8fr_1.2fr] md:items-end lg:px-8">
        <div className="text-sm font-bold uppercase tracking-[.24em] text-white/40">03 / Why SOR7ED exists</div>
        <div>
          <h2 className="text-7xl font-black uppercase leading-[.82] text-white sm:text-9xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Life is loud.<br /><span className="text-[#ef4035]">We make it legible.</span>
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/60">
            PLANET SOR7ED builds practical tools and protocols for neurodivergent adults—clear enough to use on a low-energy day, useful enough to come back to.
          </p>
          <Link href="/about" className="mt-8 inline-block border-b border-[#ef4035] pb-2 text-sm font-black uppercase tracking-[.16em] text-[#ef4035] hover:text-white">
            More about us →
          </Link>
        </div>
      </section>
    </div>
  )
}
