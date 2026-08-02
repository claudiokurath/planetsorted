import Image from 'next/image'
import { ContentCard } from '@/components/ContentCard'
import { createServerClient } from '@/lib/supabase/server'

const TOOLBOX_IMAGE = '/images/PLANS_AND_LISTS_--chaos_5_--ar_43_--sref_httpss.mj.runemid8j-_59e033a8-2449-4b8d-8e42-f14a59fbc67c_1.png'

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
        {/* Cinematic Hero Banner with Integrated Typography */}
        <div className="relative w-full overflow-hidden rounded-3xl border border-neutral-800/80 bg-neutral-950 shadow-2xl mb-12 min-h-[420px] sm:min-h-[560px] flex items-end">
          {/* Background Banner Image */}
          <Image
            src={TOOLBOX_IMAGE}
            alt="Toolbox Banner"
            fill
            priority
            unoptimized
            className="object-cover object-center opacity-75 sm:opacity-85 transition-transform duration-700 hover:scale-105"
          />
          {/* Sophisticated Gradient Overlay (smooth transition from dark left/bottom for legibility while revealing background art on right/top) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent sm:bg-gradient-to-r sm:from-black sm:via-black/70 sm:to-transparent" />

          {/* Integrated Title & Subtitle */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-0.5 w-10 rounded-full bg-[#C0392B]" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-300">
                PLANET SOR7ED LAB
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black uppercase text-white tracking-tight drop-shadow-md" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
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
