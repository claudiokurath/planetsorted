import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ContentCard } from '@/components/ContentCard'
import { PageHeader } from '@/components/PageHeader'
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
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export const revalidate = 60

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const supabase = createServerClient()
  const { data: items } = await supabase
    .from('protocols')
    .select('slug, title, cover_image, read_time, category, type')
    .eq('category', category.label)
    .eq('status', 'Published')
    .order('updated_at', { ascending: false })

  const tools = (items ?? []).filter((item) => item.type === 'Tool')
  const articles = (items ?? []).filter((item) => item.type !== 'Tool')

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
        <PageHeader
          eyebrow="PLANET SOR7ED CATEGORY"
          title={category.label}
          description={category.tagline}
        />

        {tools.length === 0 && articles.length === 0 ? (
          <p className="py-12 text-center text-neutral-500">Nothing published in {category.label} yet.</p>
        ) : (
          <>
            {tools.length > 0 && (
              <section className="mb-12">
                <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">
                  Tools
                </h2>
                <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((tool) => (
                    <ContentCard
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      title={tool.title}
                      coverImage={tool.cover_image}
                      category={tool.category}
                      meta={tool.read_time || undefined}
                    />
                  ))}
                </div>
              </section>
            )}

            {articles.length > 0 && (
              <section>
                <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">
                  Intelligence
                </h2>
                <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {articles.map((article) => (
                    <ContentCard
                      key={article.slug}
                      href={`/intelligence/${article.slug}`}
                      title={article.title}
                      coverImage={article.cover_image}
                      category={article.category}
                      meta={article.read_time || undefined}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
