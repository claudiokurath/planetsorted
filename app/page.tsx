import { publicPageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import { HomeGateway } from '@/components/HomeGateway'

export const metadata: Metadata = publicPageMetadata({
  "title": "Tools and guides for neurodivergent adults",
  "description": "Practical tools and plain-language guides for neurodivergent adults. Find support with overwhelm, decisions, money and everyday life admin.",
  "path": "/"
})

export default function HomePage() {
  return <HomeGateway />
}
