import { ContentCard } from '@/components/ContentCard'
import { PageHeader } from '@/components/PageHeader'
import { createServerClient } from '@/lib/supabase/server'

export const revalidate = 60

export default async function ToolboxListingPage() {
  const supabase = createServerClient()
  const { data: tools } = await supabase
    .from('protocols')
    .select('slug, title, summary, read_time, category')
    .eq('type', 'Tool')
    .eq('status', 'Published')
    .order('updated_at', { ascending: false })

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
        <PageHeader
          eyebrow="PLANET SOR7ED LAB"
          title="Toolbox"
          description="Practical interactive tools designed to deliver instant clarity and turn overwhelm into a next action."
        />

        {!tools || tools.length === 0 ? (
          <p className="py-12 text-center text-neutral-500">No tools published yet.</p>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ContentCard
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                title={tool.title}
                category={tool.category}
                meta={tool.read_time}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
