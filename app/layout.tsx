import { websiteSiteUrl } from '@/lib/siteUrl'
import type { Metadata } from 'next'
import { Anton, Jost, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SmartNav } from '@/components/SmartNav'
import { MobileNav } from '@/components/MobileNav'
import { SitewideSortedButton } from '@/components/SitewideSortedButton'
import { SiteFooter } from '@/components/SiteFooter'

// Display face — heavy condensed grotesque, matches the customer-facing
// protocol deck. See docs/planet-sorted-master.md "Visual Identity".
// The legacy --font-bebas CSS var is aliased to Anton in globals.css so
// every existing `font-bebas` heading picks it up.
const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap',
})

// Body + UI text.
const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PLANET SOR7ED',
  description: 'Practical protocols for neurodivergent minds.',
  metadataBase: new URL(websiteSiteUrl()),
  openGraph: { siteName: 'PLANET SOR7ED', type: 'website', images: [{ url: '/api/og?card=welcome', width: 1200, height: 630, alt: 'PLANET SOR7ED' }] },
  twitter: { card: 'summary_large_image', images: ['/api/og?card=welcome'] },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://planetsorted.com/#organization',
        'name': 'Planet Sorted',
        'alternateName': ['sorted', 'Sorted', 'planet sorted'],
        'url': 'https://planetsorted.com',
        'foundingDate': '2025',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'London',
          'addressCountry': 'UK',
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://planetsorted.com/#website',
        'url': 'https://planetsorted.com',
        'name': 'Planet Sorted',
        'publisher': {
          '@id': 'https://planetsorted.com/#organization',
        },
      },
    ],
  }

  return (
    <html lang="en" className={`h-full antialiased ${anton.variable} ${jost.variable} ${jetBrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <a href="#main-content" className="sorted-skip-link">Skip to content</a>
        <SmartNav />
        <main id="main-content" tabIndex={-1} className="flex-1 pb-20 md:pb-0">{children}</main>
        <SitewideSortedButton />
        <SiteFooter />
        <MobileNav />
      </body>
    </html>
  )
}
