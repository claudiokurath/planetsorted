import { redirect } from 'next/navigation'
import { getStandaloneMetadata } from '@/lib/standaloneMetadata'

export async function generateMetadata() {
  return getStandaloneMetadata(
    'weekly-wins-generator',
    'Weekly Wins Generator',
    'Log your week, pick a tone, and generate a publish-ready summary of everything you actually did.'
  )
}

export default function WeeklyWinsGeneratorPage() {
  redirect('/embed/weekly-wins-generator')
}
