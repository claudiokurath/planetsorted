import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { ContentCard } from '@/components/ContentCard'

export const metadata: Metadata = {
  title: 'Protocols & Articles — Planet Sorted',
  description: 'Practical, shame-free protocols and guides for neurodivergent adults.',
}

export const revalidate = 60 // Revalidate every 60 seconds

export default async function IntelligenceListingPage() {
  const supabase = createServerClient()
  
  const { data: protocols } = await supabase
    .from('protocols')
    .select('slug, title, summary, cover_image, read_time, status, updated_at')
    .eq('status', 'Published')
    .order('updated_at', { ascending: false })

  const items = protocols ?? []

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white sm:text-4xl tracking-tight">
          Protocols & Articles
        </h1>
        <p className="mt-2 text-sm text-gray-400 max-w-2xl leading-relaxed">
          Step-by-step guides designed for executive function relief. Practical, plain-English solutions with zero fluff.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-gray-400">
          <p className="text-base font-semibold text-gray-300">No published protocols found</p>
          <p className="text-xs text-gray-500 mt-1">Check back soon for fresh content from Notion.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ContentCard
              key={item.slug}
              href={`/intelligence/${item.slug}`}
              title={item.title || 'Untitled Protocol'}
              summary={item.summary || ''}
              coverImage={item.cover_image}
              meta={item.read_time ? `${item.read_time} read` : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
