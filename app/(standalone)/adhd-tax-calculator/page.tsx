import { StandaloneAdhdTaxApp } from '@/components/StandaloneAdhdTaxApp'
import { getStandaloneMetadata } from '@/lib/standaloneMetadata'

export async function generateMetadata() {
  return getStandaloneMetadata(
    'adhd-tax-calculator',
    'ADHD Tax Calculator',
    'Calculate the hidden financial cost of ADHD habits and unmanaged overwhelm.'
  )
}

export default function StandaloneAdhdTaxCalculatorPage() {
  return <StandaloneAdhdTaxApp />
}
