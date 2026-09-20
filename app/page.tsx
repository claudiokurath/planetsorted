import type { Metadata } from 'next'
import Image from 'next/image'
import { AboutIntro } from '@/components/AboutIntro'

const SITE = process.env.SITE_URL ?? 'https://www.sor7ed.com'
const OG_CARD = '/api/og?card=welcome'

const DESC =
  'SOR7ED is a practical support platform for ADHD, autistic, AuDHD, dyslexic, bipolar and other neurodivergent adults — honest editorial content paired with interactive tools that end in a real next step.'

export const metadata: Metadata = {
  title: 'PLANET SOR7ED — Tools built for brains that work differently',
  description: DESC,
  openGraph: {
    title: 'PLANET SOR7ED',
    description: DESC,
    images: [{ url: `${SITE}${OG_CARD}`, type: 'image/png', alt: 'PLANET SOR7ED' }],
    url: SITE,
    siteName: 'PLANET SOR7ED',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PLANET SOR7ED — Tools built for brains that work differently',
    description: DESC,
    images: [`${SITE}${OG_CARD}`],
  },
}

export default function HomePage() {
  return (
    <div
      className="min-h-screen bg-black text-white"
      style={{ scrollSnapType: 'y proximity' }}
    >
      {/* Entrance band. Deliberately short and never overlaid with text — the
          artwork carries the personality, the type below carries the message. */}
      <div
        className="relative w-full overflow-hidden border-b border-white/10"
        style={{ height: 'clamp(104px, 15vw, 152px)' }}
      >
        <Image
          src="/images/banners/main.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <AboutIntro />
    </div>
  )
}
