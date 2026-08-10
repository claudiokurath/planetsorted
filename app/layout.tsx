import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { SmartNav } from '@/components/SmartNav'
import { SiteFooter } from '@/components/SiteFooter'
import { MobileNav } from '@/components/MobileNav'

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
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col pb-16 sm:pb-0">
        <SmartNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <MobileNav />
        <Script
          src="http://localhost:3000/widget.js"
          data-api-key="409be6e33c5703fb013ae504aac137fe71c2f78af5772ad2"
          data-label="Save to WhatsApp"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
