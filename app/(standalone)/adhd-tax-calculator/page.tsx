import { StandaloneAdhdTaxApp } from '@/components/StandaloneAdhdTaxApp'
import { getStandaloneMetadata } from '@/lib/standaloneMetadata'
import { verifyStandaloneAccess } from '@/lib/standaloneGuard'

interface Props {
  searchParams?: Promise<{ access_token?: string }>
}

export async function generateMetadata() {
  return getStandaloneMetadata(
    'adhd-tax-calculator',
    'ADHD Tax Calculator',
    'Calculate the hidden financial cost of ADHD habits and unmanaged overwhelm.'
  )
}

export default async function StandaloneAdhdTaxCalculatorPage({ searchParams }: Props) {
  await verifyStandaloneAccess('adhd-tax-calculator', searchParams)
  return <StandaloneAdhdTaxApp />
}
