import type { Metadata } from 'next'
import { WeeklyWinsApp } from '@/components/WeeklyWinsApp'

export const metadata: Metadata = {
  title: 'Weekly Wins Generator — PLANET SOR7ED',
  description:
    'Log your week, pick a tone, and generate a publish-ready summary of everything you actually did. Win score calculated from tasks, body-doubling, and tool uses.',
  openGraph: {
    title: 'Weekly Wins Generator — PLANET SOR7ED',
    description:
      'Log your week, pick a tone, and generate a publish-ready summary of everything you actually did.',
    url: 'https://planetsorted.com/weekly-wins-generator',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weekly Wins Generator — PLANET SOR7ED',
    description: 'Log your week, pick a tone, and generate a publish-ready summary of everything you actually did.',
  },
}

export default function WeeklyWinsGeneratorPage() {
  return <WeeklyWinsApp />
}
