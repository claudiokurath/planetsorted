import { getLiveContent } from '@/lib/notion/liveContent'
import { LiveContentRefresh } from '@/components/LiveContentRefresh'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import Link from 'next/link'
import { BrainTypeProfiler } from '@/components/BrainTypeProfiler'

const display = localFont({ src: './fonts/league-gothic.ttf', weight: '400', variable: '--font-brain-display', display: 'swap' })
const body = localFont({ src: [
  { path: './fonts/roboto-300.ttf', weight: '300' },
  { path: './fonts/roboto-400.ttf', weight: '400' },
  { path: './fonts/roboto-500.ttf', weight: '500' },
], variable: '--font-brain-body', display: 'swap' })

export const metadata: Metadata = {
  alternates: { canonical: '/brain-type' },
  title: 'How your brain runs — SOR7ED',
  description: 'A two-minute reflection: twelve questions about how you work, start and recover, then a profile and tools to try.',
}

export const dynamic = 'force-dynamic'

export default async function BrainTypePage() {
  const snapshot = await getLiveContent().catch(() => null)
  return (
    <div className={`${display.variable} ${body.variable}`}>
      <LiveContentRefresh />
      <BrainTypeProfiler publishedToolSlugs={snapshot?.tools ?? []} toolsAvailable={snapshot !== null} />
      <nav aria-label="Explore SOR7ED" className="mx-auto flex max-w-[840px] flex-wrap gap-4 px-6 pb-8 text-sm text-neutral-300 print:hidden">
        <Link href="/" className="inline-flex min-h-12 items-center underline hover:text-white">Back to home</Link>
        <Link href="/tools" className="inline-flex min-h-12 items-center underline hover:text-white">Explore Toolbox</Link>
      </nav>
    </div>
  )
}
