import { publicPageMetadata, SEO_SITE, SEO_BRAND, SEO_DESCRIPTION, structuredDataJson } from '@/lib/seo'
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
  ...publicPageMetadata({ title: 'Tools and guides for neurodivergent adults', description: SEO_DESCRIPTION, path: '/' }),
  alternates: undefined,
  metadataBase: new URL(SEO_SITE),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${SEO_SITE}/#organization`, name: SEO_BRAND,
        legalName: 'SOR7ED LIMITED', alternateName: ['Planet Sorted', 'SOR7ED', 'Sorted'], url: SEO_SITE,
        logo: { '@type': 'ImageObject', url: `${SEO_SITE}/images/sor7ed-logo-white.png`, width: 1832, height: 430 } },
      { '@type': 'WebSite', '@id': `${SEO_SITE}/#website`, url: SEO_SITE, name: SEO_BRAND,
        alternateName: ['Planet Sorted', 'SOR7ED'], inLanguage: 'en-GB', publisher: { '@id': `${SEO_SITE}/#organization` } },
    ],
  }

  return (
    <html lang="en" className={`h-full antialiased ${anton.variable} ${jost.variable} ${jetBrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredDataJson(jsonLd) }}
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
