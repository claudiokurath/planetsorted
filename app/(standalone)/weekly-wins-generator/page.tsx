import type { Metadata } from 'next'
import { WeeklyWinsApp } from '@/components/WeeklyWinsApp'

export const metadata: Metadata = {
  title: 'Weekly Wins Generator — PLANET SOR7ED',
  description:
    'Log your week, pick a tone, and generate a publish-ready summary of everything you actually did.',
  openGraph: {
    title: 'Weekly Wins Generator — PLANET SOR7ED',
    description:
      'Log your week, pick a tone, and generate a publish-ready summary of everything you actually did.',
    url: 'https://planetsorted.com/weekly-wins-generator',
    type: 'website',
    images: [{
      url: 'https://planetsorted.com/api/og?title=Weekly+Wins+Generator&description=Log+your+week.+Pick+a+tone.+Generate+a+publish-ready+summary.',
      width: 1200,
      height: 630,
      alt: 'Weekly Wins Generator — PLANET SOR7ED',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weekly Wins Generator — PLANET SOR7ED',
    description: 'Log your week, pick a tone, and generate a publish-ready summary of everything you actually did.',
    images: ['https://planetsorted.com/api/og?title=Weekly+Wins+Generator&description=Log+your+week.+Pick+a+tone.+Generate+a+publish-ready+summary.'],
  },
}

export default function WeeklyWinsGeneratorPage() {
  return <WeeklyWinsApp />
}
