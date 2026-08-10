import type { Metadata } from 'next'
import { BiometricStateApp } from '@/components/BiometricStateApp'

export const metadata: Metadata = {
  title: 'Biometric State Tracker — PLANET SOR7ED',
  description:
    'Log your daily biometrics and get a personalized hydration target plus AI-style recommendations, instantly. Track your cognitive and physical performance over time.',
  openGraph: {
    title: 'Biometric State Tracker — PLANET SOR7ED',
    description:
      'Personalized hydration target, biometric state score, and AI-style recommendations — based on your weight, activity, sleep, stress, and more.',
    url: 'https://planetsorted.com/biometric-state-tracker',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Biometric State Tracker — PLANET SOR7ED',
    description: 'Personalized hydration target, biometric state score, and AI-style recommendations — instantly.',
  },
}

export default function BiometricStateTrackerPage() {
  return <BiometricStateApp />
}
