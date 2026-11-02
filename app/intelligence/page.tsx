import { publicPageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import { GammaCollectionPage } from '@/components/GammaCollectionPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = publicPageMetadata({
  "title": "ADHD and neurodivergent life guides",
  "description": "Read free guides about financial avoidance, life admin, decision fatigue and neurodivergent relationships. Get practical protocols through WhatsApp.",
  "path": "/intelligence",
  "image": "/images/collections/guidebook-cover.png",
  "imageWidth": 1344,
  "imageHeight": 896
})

export default function GuidebookPage() {
  return <GammaCollectionPage collection="guidebook" />
}
