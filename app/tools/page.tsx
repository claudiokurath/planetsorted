import Image from 'next/image'
import { ContentCard } from '@/components/ContentCard'
import { PRIORITY_TOOLS } from '@/lib/toolsData'

export default function ToolboxListingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Banner Header */}
      <div className="relative w-full aspect-[21/9] max-h-72 overflow-hidden bg-neutral-900 border-b border-neutral-800">
        <Image
          src="/images/banners/toolbox-banner.png"
          alt="Toolbox Banner"
          fill
          priority
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto h-1 w-16 rounded-full bg-[#C0392B] mb-3" />
          <h1 className="text-5xl font-black uppercase text-white sm:text-6xl tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Toolbox
          </h1>
          <p className="mt-2 text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto">
            Practical interactive tools designed to deliver instant clarity and turn overwhelm into a next action.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
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
      </div>
    </div>
  )
}
