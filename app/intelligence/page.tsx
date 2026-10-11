import type { Metadata } from 'next'
import { GammaCollectionPage } from '@/components/GammaCollectionPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Guidebook — PLANET SOR7ED',
  description: 'Your intelligence was never the problem. Explore SOR7ED guides and get practical protocols via WhatsApp.',
  alternates: { canonical: '/intelligence' },
  openGraph: {
    title: 'Guidebook — PLANET SOR7ED',
    description: 'Your intelligence was never the problem. Practical guides for neurodivergent adults.',
    url: '/intelligence',
    images: [{ url: '/images/collections/guidebook-cover.png', width: 1344, height: 896, alt: 'SOR7ED Guidebook' }],
  },
}

export default function GuidebookPage() {
  return <GammaCollectionPage collection="guidebook" />
}
