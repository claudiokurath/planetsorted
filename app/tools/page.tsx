import { ContentCard } from '@/components/ContentCard'
import { PRIORITY_TOOLS } from '@/lib/toolsData'

export default function ToolboxListingPage() {
  return (
    <div style={{ backgroundColor: '#FAF7F2' }} className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mx-auto h-1 w-16 rounded-full bg-[#C0392B] mb-4" />
          <h1 className="text-5xl font-black uppercase text-[#1A1A1A] sm:text-6xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Toolbox
          </h1>
          <p className="mt-4 text-xl text-[#555]">
            Practical interactive tools designed to deliver instant clarity, reduce executive load, and turn overwhelm into a next action.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
