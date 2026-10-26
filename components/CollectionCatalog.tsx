import { getLiveContent } from '@/lib/notion/liveContent'
import { LiveContentRefresh } from '@/components/LiveContentRefresh'
import 'server-only'
import { CatalogBrowser } from '@/components/CatalogBrowser'
import { createServerClient } from '@/lib/supabase/server'
import type { Protocol } from '@/lib/types/database'

export type CollectionType = 'Tool' | 'Article'
export type CatalogItem = Pick<Protocol, 'slug' | 'title' | 'summary' | 'excerpt' | 'cover_image' | 'category' | 'read_time' | 'type' | 'status'>
type CatalogResult = { status: 'ready'; items: CatalogItem[] } | { status: 'error' }

// Match the approved Toolbox presentation order. Content always comes from
// published Notion-synced rows; newly published tools follow these entries.
const TOOL_ORDER = [
  'biometric-state-tracker',
  'adhd-tax-calculator',
  'financial-autopilot',
  'decision-paralysis-solver',
  'task-breakdown-wizard',
  'brain-dump-sorter',
]
const TOOL_RANK = new Map(TOOL_ORDER.map((slug, index) => [slug, index]))

export async function loadCollectionCatalog(type: CollectionType): Promise<CatalogResult> {
  try {
    const snapshot = await getLiveContent()
    const published = type === 'Tool' ? snapshot.tools : snapshot.articles
    if (!published.length) return { status: 'ready', items: [] }
    const { data, error } = await createServerClient()
      .from('protocols')
      .select('slug, title, summary, excerpt, cover_image, category, read_time, type, status')
      .eq('status', 'Published')
      .eq('type', type)
      .in('slug', published)
      .order('title', { ascending: true })
      .abortSignal(AbortSignal.timeout(8000))

    if (error || !data) return { status: 'error' }

    const items = data.filter(item => item.status === 'Published' && item.type === type)
    if (type === 'Tool') {
      items.sort((a, b) => (TOOL_RANK.get(a.slug) ?? TOOL_ORDER.length) - (TOOL_RANK.get(b.slug) ?? TOOL_ORDER.length))
    }
    return { status: 'ready', items }
  } catch {
    // Network failures and unavailable configuration are distinct from a
    // successful query that genuinely contains no published items.
    return { status: 'error' }
  }
}

interface CollectionCatalogProps {
  type: CollectionType
  heading?: string
  description?: string
}

export async function CollectionCatalog({ type, heading, description }: CollectionCatalogProps) {
  const result = await loadCollectionCatalog(type)
  const route = type === 'Tool' ? '/tools' : '/intelligence'
  const label = type === 'Tool' ? 'tools' : 'guidebooks'

  return (
    <section id="collection-content" aria-labelledby="collection-heading" className="w-full scroll-mt-28">
      <LiveContentRefresh />
      <header className="mb-8">
        <h2 id="collection-heading" className="font-bebas text-4xl uppercase text-white sm:text-5xl">
          {heading ?? (type === 'Tool' ? 'The free tools' : 'Library of guidebooks')}
        </h2>
        {description ? <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-300 sm:text-lg">{description}</p> : null}
      </header>

      {result.status === 'error' ? (
        <div className="border border-white/15 p-6 sm:p-8">
          <p role="alert" className="text-base text-neutral-300">We couldn’t load the {label} right now. Please try again.</p>
          {/* A normal navigation reloads the server query rather than reusing
              an in-memory Next.js route result from the failed request. */}
          <a href={route} className="mt-5 inline-flex min-h-12 items-center justify-center bg-white px-6 text-base font-medium text-black hover:bg-[#FFD400] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFD400]">
            Try again →
          </a>
        </div>
      ) : result.items.length === 0 ? (
        <p className="border border-white/15 p-6 text-base text-neutral-300">No {label} have been published yet. Please check back soon.</p>
      ) : (
        <CatalogBrowser items={result.items} type={type} />
      )}
    </section>
  )
}
