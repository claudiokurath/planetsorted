import Link from 'next/link'
import { GammaEmbed } from '@/components/GammaEmbed'
import { PageHeader } from '@/components/PageHeader'

export const revalidate = 60

export default function ToolboxListingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
        <PageHeader
          eyebrow="PLANET SOR7ED LAB"
          title="Toolbox"
          description="Practical interactive tools designed to deliver instant clarity and turn overwhelm into a next action."
        />

        <section className="mb-14" aria-label="The tools your brain actually needs">
          <GammaEmbed src="https://gamma.app/embed/d7h8pad1cxhj4z7" title="The tools your brain actually needs" />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm">
            <Link href="https://gamma.app/docs/THE-TOOLS-YOUR-BRAIN-ACTUALLY-NEEDS-d7h8pad1cxhj4z7" target="_blank" rel="noopener noreferrer" className="text-neutral-300 underline underline-offset-4">Open presentation in a new tab</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
