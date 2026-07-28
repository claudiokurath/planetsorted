import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ADHD Tax Calculator — Planet Sorted',
  description: 'A standalone app to estimate the hidden costs of ADHD-related money leaks.',
}

export default function StandaloneLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
