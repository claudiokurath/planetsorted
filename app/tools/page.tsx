import type { Metadata } from 'next'
import { GammaCollectionPage } from '@/components/GammaCollectionPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Toolbox — PLANET SOR7ED',
  description: 'The tools your brain actually needs. Explore free SOR7ED tools and get your chosen tool via WhatsApp.',
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'Toolbox — PLANET SOR7ED',
    description: 'Free, practical tools built for neurodivergent adults.',
    url: '/tools',
    images: [{ url: '/images/collections/toolbox-cover.png', width: 1344, height: 896, alt: 'SOR7ED Toolbox' }],
  },
}

export default function ToolboxPage() {
  return <GammaCollectionPage collection="toolbox" />
}
