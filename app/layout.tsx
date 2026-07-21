import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SmartNav } from '@/components/SmartNav'
import { SiteFooter } from '@/components/SiteFooter'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SmartNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
