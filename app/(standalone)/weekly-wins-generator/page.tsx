import { WeeklyWinsApp } from '@/components/WeeklyWinsApp'
import { getStandaloneMetadata } from '@/lib/standaloneMetadata'
import { verifyStandaloneAccess } from '@/lib/standaloneGuard'

interface Props {
  searchParams?: Promise<{ access_token?: string }>
}

export async function generateMetadata() {
  return getStandaloneMetadata(
    'weekly-wins-generator',
    'Weekly Wins Generator',
    'Log your week, pick a tone, and generate a publish-ready summary of everything you actually did.'
  )
}

export default async function WeeklyWinsGeneratorPage({ searchParams }: Props) {
  await verifyStandaloneAccess('weekly-wins-generator', searchParams)
  return <WeeklyWinsApp />
}
