import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import { RotatingHero } from '@/components/RotatingHero'
import { ContentCard } from '@/components/ContentCard'
import { GetSortedButton } from '@/components/buttons/GetSortedButton'
import { PRIORITY_TOOLS } from '@/lib/toolsData'
import { createServerClient } from '@/lib/supabase/server'
import type { Protocol } from '@/lib/types/database'

function getHeroImages(): string[] {
  try {
    const dir = path.join(process.cwd(), 'public', 'images', 'heroes')
    if (!fs.existsSync(dir)) return []
    return fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort().map((f) => `/images/heroes/${f}`)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const heroImages = getHeroImages()
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
      <section className="bg-gradient-to-b from-[#141414] via-[#0A0A0A] to-black">
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <p className="mb-3 font-bold text-sm tracking-[0.25em] uppercase text-[#3498DB]">Planet Sorted</p>
              <h1 className="text-6xl font-black uppercase leading-none tracking-tight sm:text-7xl text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                Templates,<br /><span style={{ color: '#C0392B' }}>not inspiration.</span>
              </h1>
              <p className="max-w-md text-xl leading-relaxed text-neutral-300">
                Practical protocols and tools for neurodivergent adults. No app. No spam. Just what works.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <GetSortedButton slug="home" context="article" />
                <Link href="/intelligence" className="text-sm font-semibold uppercase tracking-widest underline underline-offset-4 text-[#C0392B] hover:text-white transition-colors">
                  Browse Guidebook →
                </Link>
              </div>
            </div>
            <RotatingHero images={heroImages} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="h-px w-full bg-neutral-800" /></div>

      {/* Guidebook Posts Section (4 small cards) */}
      {articles.length > 0 && (
        <>
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="h-1 w-16 rounded-full bg-[#C0392B] mb-4" />
                <p className="mb-1 font-bold text-sm tracking-[0.25em] uppercase text-[#3498DB]">Protocols &amp; Briefs</p>
                <h2 className="text-5xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  Guidebook
                </h2>
              </div>
              <Link href="/intelligence" className="text-sm font-bold uppercase tracking-wider text-[#C0392B] hover:text-white transition-colors underline underline-offset-4">
                View full Guidebook →
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="h-px w-full bg-neutral-800" /></div>
        </>
      )}

      {/* Toolbox Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="h-1 w-16 rounded-full bg-[#C0392B] mb-4" />
            <p className="mb-1 font-bold text-sm tracking-[0.25em] uppercase text-[#3498DB]">Sorted Lab</p>
            <h2 className="text-5xl font-black uppercase text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Toolbox
            </h2>
            <p className="mt-2 max-w-xl text-lg text-neutral-400">Text one word. Get your result. Come back any time.</p>
          </div>
          <Link href="/tools" className="text-sm font-bold uppercase tracking-wider text-[#C0392B] hover:text-white transition-colors underline underline-offset-4">
            View all tools →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRIORITY_TOOLS.map((tool) => (
            <ContentCard key={tool.slug} href={`/tools/${tool.slug}`} title={tool.title} summary={tool.summary} coverImage={tool.image} category={tool.category} />
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="h-px w-full bg-neutral-800" /></div>

      {/* WhatsApp Callout Footer */}
      <section className="py-20 text-center bg-[#090909]">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-5xl font-black uppercase text-white sm:text-6xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            One text. <span style={{ color: '#C0392B' }}>Sorted.</span>
          </h2>
          <p className="mt-6 text-xl text-neutral-400">
            Text <strong className="text-white">TAX</strong>, <strong className="text-white">CLARITY</strong>, or <strong className="text-white">BURNOUT</strong> to +44 7591 922247.
            No app. No login. Just your result — straight to WhatsApp.
          </p>
          <p className="mt-8 text-sm text-neutral-600">
            Planet Sorted provides educational tools and protocols. Not medical, clinical, legal, or financial advice.
            Not a crisis service. In immediate danger: call 999. To talk: text SHOUT to 85258.
          </p>
        </div>
      </section>
    </div>
  )
}
