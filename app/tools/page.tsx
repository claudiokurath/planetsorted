import { ContentCard } from '@/components/ContentCard'
import { PRIORITY_TOOLS } from '@/lib/toolsData'

export default function ToolsListingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-white">Tools &amp; Calculators</h1>
        <p className="mt-4 text-xl text-gray-400">
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
  )
}
