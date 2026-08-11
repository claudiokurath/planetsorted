import { DecisionParalysisApp } from '@/components/DecisionParalysisApp'
import { getStandaloneMetadata } from '@/lib/standaloneMetadata'
import { verifyStandaloneAccess } from '@/lib/standaloneGuard'

interface Props {
  searchParams?: Promise<{ access_token?: string }>
}

export async function generateMetadata() {
  return getStandaloneMetadata(
    'decision-paralysis-solver',
    'Decision Paralysis Solver',
    'Break free from decision paralysis with readiness checks, comparison matrix, quick decide tools, and decision journal.'
  )
}

export default async function DecisionParalysisPage({ searchParams }: Props) {
  await verifyStandaloneAccess('decision-paralysis-solver', searchParams)
  return <DecisionParalysisApp />
}
