import { ContentCard } from '@/components/ContentCard'
import { createServerClient } from '@/lib/supabase/server'

export const revalidate = 60

export default async function ToolboxListingPage() {
  const supabase = createServerClient()
  const { data: tools } = await supabase
    .from('protocols')
    .select('slug, title, summary, cover_image, read_time, category')
    .eq('type', 'Tool')
    .eq('status', 'Published')
    .order('updated_at', { ascending: false })

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-3xl border border-neutral-800/80 bg-gradient-to-br from-neutral-950 to-black shadow-2xl mb-12 min-h-[320px] sm:min-h-[380px] flex items-end">
          <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-0.5 w-10 rounded-full bg-[#C0392B]" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-300">
                PLANET SOR7ED LAB
              </span>
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black uppercase text-white tracking-tight drop-shadow-md leading-[0.95]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Toolbox
            </h1>
            <p className="mt-3 text-base sm:text-lg text-neutral-200 font-normal leading-relaxed drop-shadow">
              Practical interactive tools designed to deliver instant clarity and turn overwhelm into a next action.
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        {!tools || tools.length === 0 ? (
          <p className="text-center text-neutral-500 py-12">No tools published yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {tools.map((tool) => (
              <ContentCard
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                title={tool.title}
                summary={tool.summary || ''}
                coverImage={tool.cover_image}
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
