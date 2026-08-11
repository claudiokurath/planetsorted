import { FinancialAutopilotApp } from '@/components/FinancialAutopilotApp'
import { getStandaloneMetadata } from '@/lib/standaloneMetadata'
import { verifyStandaloneAccess } from '@/lib/standaloneGuard'

interface Props {
  searchParams?: Promise<{ access_token?: string }>
}

export async function generateMetadata() {
  return getStandaloneMetadata(
    'financial-autopilot',
    'Financial Autopilot',
    'Automate your financial future with personalised strategies for savings, debt payoff, and retirement.'
  )
}

export default async function FinancialAutopilotPage({ searchParams }: Props) {
  await verifyStandaloneAccess('financial-autopilot', searchParams)
  return <FinancialAutopilotApp />
}
