import type { Metadata } from 'next'
import { Inter, Bebas_Neue, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SmartNav } from '@/components/SmartNav'
import { MobileNav } from '@/components/MobileNav'
import { SiteFooter } from '@/components/SiteFooter'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
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
    <html lang="en" className={`h-full antialiased ${inter.variable} ${bebasNeue.variable} ${jetBrainsMono.variable}`}>
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
