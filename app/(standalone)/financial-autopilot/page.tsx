import { FinancialAutopilotApp } from '@/components/FinancialAutopilotApp'
import { getStandaloneMetadata } from '@/lib/standaloneMetadata'

export async function generateMetadata() {
  return getStandaloneMetadata(
    'financial-autopilot',
    'Financial Autopilot',
    'Automate your financial future with personalised strategies for savings, debt payoff, and retirement.'
  )
}

export default function FinancialAutopilotPage() {
  return <FinancialAutopilotApp />
}
