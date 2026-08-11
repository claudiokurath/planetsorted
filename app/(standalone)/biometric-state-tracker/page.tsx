import { BiometricStateApp } from '@/components/BiometricStateApp'
import { getStandaloneMetadata } from '@/lib/standaloneMetadata'
import { verifyStandaloneAccess } from '@/lib/standaloneGuard'

interface Props {
  searchParams?: Promise<{ access_token?: string }>
}

export async function generateMetadata() {
  return getStandaloneMetadata(
    'biometric-state-tracker',
    'Biometric State Tracker',
    'Daily biometric check-in. Personalised hydration target. Instant recommendations.'
  )
}

export default async function BiometricStateTrackerPage({ searchParams }: Props) {
  await verifyStandaloneAccess('biometric-state-tracker', searchParams)
  return <BiometricStateApp />
}
