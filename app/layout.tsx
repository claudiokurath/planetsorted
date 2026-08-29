import type { Metadata } from 'next'
import { Jost, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SmartNav } from '@/components/SmartNav'
import { MobileNav } from '@/components/MobileNav'
import { SiteFooter } from '@/components/SiteFooter'

// Thin geometric (Futura family) — display + UI. See docs/planet-sorted-master.md
// "Visual Identity". The legacy --font-inter / --font-bebas CSS vars are aliased
// to Jost in globals.css so existing class/module references keep resolving.
const jost = Jost({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  variable: '--font-jost',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Planet Sorted',
  description: 'Practical protocols for neurodivergent minds.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planetsorted.com'),
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
    <html lang="en" className={`h-full antialiased ${jost.variable} ${jetBrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SmartNav />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <SiteFooter />
        <MobileNav />
      </body>
    </html>
  )
}
