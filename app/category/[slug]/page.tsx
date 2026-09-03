import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContentCard } from '@/components/ContentCard'
import { createServerClient } from '@/lib/supabase/server'
import { CATEGORY_LIST, getCategoryBySlug } from '@/lib/categoryStyles'
import { brandedOgImage } from '@/lib/og/imageUrl'

interface Props {
  params: Promise<{ slug: string }>
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'

export function generateStaticParams() {
  return CATEGORY_LIST.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) return {}

  const title = `${category.label} — PLANET SOR7ED`
  const description = category.tagline
  const imageUrl = brandedOgImage(title, description)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE}/category/${category.slug}`,
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: category.label }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
  }
}

export const revalidate = 60

const SectionLabel = ({ children }: { children: string }) => (
  <h2 className="mb-6 text-xs font-medium uppercase tracking-[0.24em] text-neutral-500">{children}</h2>
)

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const supabase = createServerClient()
  const { data: items } = await supabase
    .from('protocols')
    .select('slug, title, read_time, category, type')
    .eq('category', category.label)
    .eq('status', 'Published')
    .order('updated_at', { ascending: false })

  const tools = (items ?? []).filter((item) => item.type === 'Tool')
  const articles = (items ?? []).filter((item) => item.type !== 'Tool')

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Pillar header */}
      <header className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-5 py-24 text-center sm:py-28">
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
          <Link href="/intelligence" className="transition-colors hover:text-white">All guidebook</Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-24">
        {tools.length === 0 && articles.length === 0 ? (
          <p className="py-12 text-center text-neutral-500">Nothing published in {category.label} yet.</p>
        ) : (
          <div className="flex flex-col gap-16">
            {tools.length > 0 && (
              <section>
                <SectionLabel>Tools</SectionLabel>
                <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((tool, index) => (
                    <ContentCard
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      title={tool.title}
                      category={tool.category}
                      meta={tool.read_time || undefined}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            )}

            {articles.length > 0 && (
              <section>
                <SectionLabel>Guidebook</SectionLabel>
                <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {articles.map((article, index) => (
                    <ContentCard
                      key={article.slug}
                      href={`/intelligence/${article.slug}`}
                      title={article.title}
                      category={article.category}
                      meta={article.read_time || undefined}
                      index={index}
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
