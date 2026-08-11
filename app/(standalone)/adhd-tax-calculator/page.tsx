import type { Metadata } from 'next'
import { StandaloneAdhdTaxApp } from '@/components/StandaloneAdhdTaxApp'

export const metadata: Metadata = {
  title: 'ADHD Tax Calculator — PLANET SOR7ED',
  description: 'Calculate the hidden financial cost of ADHD habits and unmanaged overwhelm.',
  openGraph: {
    title: 'ADHD Tax Calculator — PLANET SOR7ED',
    description: 'Calculate the hidden financial cost of ADHD habits and unmanaged overwhelm.',
    url: 'https://planetsorted.com/adhd-tax-calculator',
    type: 'website',
    images: [{
      url: 'https://planetsorted.com/api/og?title=ADHD+Tax+Calculator&description=Calculate+the+hidden+financial+cost+of+ADHD+habits.',
      width: 1200,
      height: 630,
      alt: 'ADHD Tax Calculator — PLANET SOR7ED',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADHD Tax Calculator — PLANET SOR7ED',
    description: 'Calculate the hidden financial cost of ADHD habits and unmanaged overwhelm.',
    images: ['https://planetsorted.com/api/og?title=ADHD+Tax+Calculator&description=Calculate+the+hidden+financial+cost+of+ADHD+habits.'],
  },
}

export default function StandaloneAdhdTaxCalculatorPage() {
  return <StandaloneAdhdTaxApp />
}
