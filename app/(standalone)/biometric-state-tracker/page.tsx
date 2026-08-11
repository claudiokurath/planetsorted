import { BiometricStateApp } from '@/components/BiometricStateApp'
import { getStandaloneMetadata } from '@/lib/standaloneMetadata'

export async function generateMetadata() {
  return getStandaloneMetadata(
    'biometric-state-tracker',
    'Biometric State Tracker',
    'Daily biometric check-in. Personalised hydration target. Instant recommendations.'
  )
}

export default function BiometricStateTrackerPage() {
  return <BiometricStateApp />
}
