import { getLiveContent } from '@/lib/notion/liveContent'
import { LiveContentRefresh } from '@/components/LiveContentRefresh'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContentCard } from '@/components/ContentCard'
import { createServerClient } from '@/lib/supabase/server'
import { CATEGORY_LIST, getCategoryBySlug } from '@/lib/categoryStyles'
import { publicPageMetadata } from '@/lib/seo'
import { cache } from 'react'

interface Props {
  params: Promise<{ slug: string }>
}

const loadCategory = cache(async (label: string) => {
  const snapshot = await getLiveContent()
  const { data, error } = await createServerClient().from('protocols')
    .select('slug, title, summary, cover_image, read_time, category, type')
    .eq('category', label).eq('status', 'Published').order('updated_at', { ascending: false })
  if (error) throw new Error('Published category content is unavailable')
  return {
    tools: (data ?? []).filter(item => item.type === 'Tool' && snapshot.tools.includes(item.slug)),
    articles: (data ?? []).filter(item => item.type === 'Article' && snapshot.articles.includes(item.slug)),
  }
})

export function generateStaticParams() {
  return CATEGORY_LIST.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) return {}

  const { tools, articles } = await loadCategory(category.label)
  return publicPageMetadata({
    title: `${category.label}: neurodivergent tools and guides`,
    description: `${category.tagline}. Practical ${category.label.toLowerCase()} tools and plain-language guides for neurodivergent adults from SOR7ED.`,
    path: `/category/${category.slug}`,
    noIndex: tools.length + articles.length === 0,
  })
}

export const dynamic = 'force-dynamic'

const SectionLabel = ({ children }: { children: string }) => (
  <h2 className="mb-6 font-bebas text-3xl uppercase leading-tight text-white">{children}</h2>
)

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const { tools, articles } = await loadCategory(category.label)

  return (
    <main className="sorted-category-page min-h-screen bg-black text-white">
      <LiveContentRefresh />
      {/* Pillar header */}
      <header className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 py-12 text-center sm:py-16">
        <span className="sor7ed-pill">Pillar</span>
        <h1 className="font-bebas text-4xl uppercase leading-[1.15] tracking-normal text-white sm:text-5xl lg:text-6xl">
          {category.label}
        </h1>
        {category.tagline ? (
          <p className="max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg">{category.tagline}</p>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500">
          <Link href="/tools" className="transition-colors hover:text-white">All tools</Link>
          <span className="text-neutral-700">·</span>
          <Link href="/intelligence" className="transition-colors hover:text-white">Guidebook</Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-24">
        {tools.length === 0 && articles.length === 0 ? (
          <p className="py-12 text-center text-neutral-500">Nothing published in {category.label} yet.</p>
        ) : (
          <div className="flex flex-col gap-10">
            {tools.length > 0 && (
              <section>
                <SectionLabel>Tools</SectionLabel>
                <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((tool) => (
                    <ContentCard
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      title={tool.title}
                      summary={tool.summary}
                      coverImage={tool.cover_image}
                      category={tool.category}

                    />
                  ))}
                </div>
              </section>
            )}

            {articles.length > 0 && (
              <section>
                <SectionLabel>Guidebook</SectionLabel>
                <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {articles.map((article) => (
                    <ContentCard
                      key={article.slug}
                      href={`/intelligence/${article.slug}`}
                      title={article.title}
                      summary={article.summary}
                      coverImage={article.cover_image}
                      category={article.category}

                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
