import Image from 'next/image'
import { ContentCard } from '@/components/ContentCard'
import { PRIORITY_TOOLS } from '@/lib/toolsData'

export default function ToolboxListingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 lg:px-8">
        {/* Full 16:9 Landscape Banner Image Aligned to Content Container */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-neutral-800 shadow-2xl mb-8">
          <Image
            src="/images/banners/toolbox-banner.png"
            alt="Toolbox Banner"
            fill
            priority
            unoptimized
            className="object-cover"
          />
        </div>

        {/* Header Title & Subtitle */}
        <div className="mb-10">
          <div className="h-1 w-16 rounded-full bg-[#C0392B] mb-3" />
          <h1 className="text-5xl sm:text-6xl font-black uppercase text-white tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Toolbox
          </h1>
          <p className="mt-2 text-lg sm:text-xl text-neutral-300 max-w-2xl">
            Practical interactive tools designed to deliver instant clarity and turn overwhelm into a next action.
          </p>
        </div>

        {/* Tools Grid */}
        {!PRIORITY_TOOLS || PRIORITY_TOOLS.length === 0 ? (
          <p className="text-center text-neutral-500 py-12">No tools published yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {PRIORITY_TOOLS.map((tool) => (
              <ContentCard
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                title={tool.title}
                summary={tool.summary}
                coverImage={tool.image}
                category={tool.category}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
