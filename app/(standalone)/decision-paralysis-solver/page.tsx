import { DecisionParalysisApp } from '@/components/DecisionParalysisApp'
import { getStandaloneMetadata } from '@/lib/standaloneMetadata'

export async function generateMetadata() {
  return getStandaloneMetadata(
    'decision-paralysis-solver',
    'Decision Paralysis Solver',
    'Break free from decision paralysis with readiness checks, comparison matrix, quick decide tools, and decision journal.'
  )
}

export default function DecisionParalysisPage() {
  return <DecisionParalysisApp />
}
