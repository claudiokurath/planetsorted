import { getLiveContent } from '@/lib/notion/liveContent'
import { LiveContentRefresh } from '@/components/LiveContentRefresh'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContentCard } from '@/components/ContentCard'
import { createServiceClient } from '@/lib/supabase/server'
import type { CSSProperties } from 'react'
import './section.css'
import { CATEGORY_LIST, getCategoryBySlug } from '@/lib/categoryStyles'
import { publicPageMetadata } from '@/lib/seo'
import { cache } from 'react'

interface Props {
  params: Promise<{ slug: string }>
}

const loadCategory = cache(async (label: string) => {
  const snapshot = await getLiveContent()
  const { data, error } = await createServiceClient().from('protocols')
    .select('slug, title, summary, category, type')
    .eq('category', label).eq('status', 'Published').order('title', { ascending: true }).abortSignal(AbortSignal.timeout(8000))
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
    description: `${category.tagline}. Practical ${category.label.toLowerCase()} tools and plain-language guides for neurodivergent adults from Sorted.`,
    path: `/category/${category.slug}`,
    noIndex: tools.length + articles.length === 0,
  })
}

export const dynamic = 'force-dynamic'

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) notFound()
  const { tools, articles } = await loadCategory(category.label)
  const currentIndex = CATEGORY_LIST.findIndex(c => c.slug === category.slug)
  const nextCategory = CATEGORY_LIST[(currentIndex + 1) % CATEGORY_LIST.length]
  const groups = [
    { id: 'section-tools', label: 'Tools', intro: 'A practical place to begin.', items: tools, route: 'tools' },
    { id: 'section-guidebooks', label: 'Guidebooks', intro: 'Understand what is going on. Find a next step.', items: articles, route: 'guidebooks' },
  ]

  return (
    <div className="sorted-continent" style={{ '--section-accent': category.accent } as CSSProperties}>
      <LiveContentRefresh />
      <header className="sorted-continent__hero">
        <Link href="/#sections" className="sorted-continent__back">← Back to Sorted</Link>
        <p className="sorted-continent__eyebrow">Sorted · Area 0{currentIndex + 1} of 07</p>
        <h1>{category.label}</h1>
        <p className="sorted-continent__tagline">{category.tagline}</p>
        <p className="sorted-continent__scope">{category.blurb}</p>
        <div className="sorted-continent__actions">
          <a href="#section-tools">Explore tools <span aria-hidden="true">↓</span></a>
          <a href="#section-guidebooks">Read guidebooks <span aria-hidden="true">↓</span></a>
        </div>
      </header>
      <nav className="sorted-continent__areas" aria-label="Sorted areas">
        {CATEGORY_LIST.map(area => (
          <Link key={area.slug} href={`/category/${area.slug}`} aria-current={area.slug === slug ? 'page' : undefined}>
            <span aria-hidden="true" style={{ backgroundColor: area.accent }} />{area.label}
          </Link>
        ))}
      </nav>
      {groups.map((group, index) => (
        <section key={group.id} id={group.id} className={`sorted-continent__panel${index === 1 ? ' sorted-continent__panel--colour' : ''}`} aria-labelledby={`${group.id}-heading`}>
          <div className="sorted-continent__panel-inner">
            <p className="sorted-continent__eyebrow">{category.label} · {group.label}</p>
            <h2 id={`${group.id}-heading`}>{group.intro}</h2>
            {group.items.length ? (
              <div className="sorted-continent__cards">
                {group.items.slice(0, 2).map(item => <ContentCard key={item.slug} href={`/${group.route}/${item.slug}`} title={item.title} summary={item.summary} category={category.label} />)}
              </div>
            ) : (
              <div className="sorted-continent__empty"><p>No {group.label.toLowerCase()} published in {category.label} yet.</p><Link href="/#sections">Explore another area →</Link></div>
            )}
            {group.items.length > 2 ? <details className="sorted-continent__more"><summary>More {category.label} {group.label.toLowerCase()}</summary><div className="sorted-continent__cards">{group.items.slice(2).map(item => <ContentCard key={item.slug} href={`/${group.route}/${item.slug}`} title={item.title} summary={item.summary} category={category.label} />)}</div></details> : null}
          </div>
        </section>
      ))}
      <footer className="sorted-continent__next">
        <p className="sorted-continent__eyebrow">Explore the next area</p>
        <Link href={`/category/${nextCategory.slug}`} style={{ color: nextCategory.accent }}>{nextCategory.label} <span aria-hidden="true">↗</span></Link>
        <Link href="/#sections" className="sorted-continent__all">All seven areas</Link>
      </footer>
    </div>
  )
}
