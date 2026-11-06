import { publicPageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import { GammaCollectionPage } from '@/components/GammaCollectionPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = publicPageMetadata({
  "title": "Free tools for neurodivergent adults",
  "description": "Explore practical tools for brain dumps, decision paralysis and the ADHD tax. Try a tool and keep supported resources through WhatsApp.",
  "path": "/tools",
  "image": "/images/collections/toolbox-cover.png",
  "imageWidth": 1344,
  "imageHeight": 896
})

export default function ToolboxPage() {
  return <GammaCollectionPage collection="toolbox" />
}
