import type { Metadata } from 'next'
import { ContentCard } from '@/components/ContentCard'

export const metadata: Metadata = {
  title: 'Tools & Calculators — Planet Sorted',
  description: 'Interactive tools designed for neurodivergent adults.',
}

interface PriorityTool {
  slug: string
  title: string
  summary: string
  coverImage?: string
  meta: string
}

const PRIORITY_TOOLS: PriorityTool[] = [
  {
    slug: 'adhd-tax-calculator',
    title: 'ADHD Tax Calculator',
    summary: 'Calculate the hidden financial & executive function cost of forgotten subscriptions, late fees, and impulse buying — with a 3-step reclamation plan.',
    coverImage: '/images/tool-tax.jpg',
    meta: '3 min run',
  },
  {
    slug: 'financial-autopilot',
    title: 'Financial Autopilot',
    summary: 'Set up friction-free money systems so your bills, savings, and guilt-free spending run without executive function overhead.',
    coverImage: '/images/tool-autopilot.jpg',
    meta: '5 min setup',
  },
  {
    slug: 'decision-paralysis-solver',
    title: 'Decision Paralysis Solver',
    summary: 'Stuck overthinking options? Break through cognitive fatigue with binary elimination and forced prioritization.',
    coverImage: '/images/tool-clarity.jpg',
    meta: '2 min run',
  },
]

export default function ToolsListingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white sm:text-4xl tracking-tight">
          Tools & Calculators
        </h1>
        <p className="mt-2 text-sm text-gray-400 max-w-2xl leading-relaxed">
          Practical interactive tools designed to deliver instant clarity, reduce executive load, and turn overwhelm into a single next action.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRIORITY_TOOLS.map((tool) => (
          <ContentCard
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            title={tool.title}
            summary={tool.summary}
            coverImage={tool.coverImage}
            meta={tool.meta}
          />
        ))}
      </div>
    </div>
  )
}
