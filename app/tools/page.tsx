import type { Metadata } from 'next'
import { CollectionIntroduction, CollectionEnding } from '@/components/CollectionIntroduction'
import { ContentCard } from '@/components/ContentCard'
import { createServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Toolbox — PLANET SOR7ED',
  description: 'Free, practical tools built for neurodivergent brains.',
}
export const revalidate = 60

export default async function ToolboxListingPage() {
  const supabase = createServerClient()
  const { data: tools } = await supabase
    .from('protocols')
    .select('slug, title, summary, cover_image, read_time, category')
    .eq('status', 'Published')
    .eq('type', 'Tool')
    .order('updated_at', { ascending: false })

  return (
    <div className="sorted-about-page">
      <CollectionIntroduction collection="toolbox" />
      <section id="collection-content" className="sorted-about-block sorted-collection-content" aria-labelledby="tools-heading">
        <h2 id="tools-heading">The free tools at SOR7ED</h2>
        <p className="sorted-collection-description">Every tool is free, practical and shame-free — built for ND brains. Choose one to open it.</p>
        {!tools || tools.length === 0 ? <p>No tools published yet.</p> : (
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map(tool => <ContentCard key={tool.slug} href={`/tools/${tool.slug}`} title={tool.title} summary={tool.summary} coverImage={tool.cover_image} category={tool.category} meta={tool.read_time || undefined} />)}
          </div>
        )}
      </section>
      <CollectionEnding collection="toolbox" />
    </div>
  )
}
