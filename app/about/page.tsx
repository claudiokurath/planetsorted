import type { Metadata } from 'next'
import { AboutIntro } from '@/components/AboutIntro'

export const metadata: Metadata = {
  title: 'About — PLANET SOR7ED',
  description: 'Practical tools and plain-language guides for neurodivergent everyday life. Learn how SOR7ED works and explore seven areas of life.',
}

export default function AboutPage() {
  return <AboutIntro />
}
