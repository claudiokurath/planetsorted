import type { Metadata } from 'next'
import { BiometricStateApp } from '@/components/BiometricStateApp'

export const metadata: Metadata = {
  title: 'Biometric State Tracker — PLANET SOR7ED',
  description:
    'Log your daily biometrics and get a personalised hydration target plus actionable recommendations, instantly.',
  openGraph: {
    title: 'Biometric State Tracker — PLANET SOR7ED',
    description: 'Daily biometric check-in. Personalised hydration target. Instant recommendations.',
    url: 'https://planetsorted.com/biometric-state-tracker',
    type: 'website',
    images: [{
      url: 'https://planetsorted.com/api/og?title=Biometric+State+Tracker&description=Daily+check-in.+Hydration+target.+Instant+recommendations.',
      width: 1200,
      height: 630,
      alt: 'Biometric State Tracker — PLANET SOR7ED',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Biometric State Tracker — PLANET SOR7ED',
    description: 'Daily biometric check-in. Personalised hydration target. Instant recommendations.',
    images: ['https://planetsorted.com/api/og?title=Biometric+State+Tracker&description=Daily+check-in.+Hydration+target.+Instant+recommendations.'],
  },
}

export default function BiometricStateTrackerPage() {
  return <BiometricStateApp />
}
