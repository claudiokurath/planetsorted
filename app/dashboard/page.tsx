import type { Metadata } from 'next'
import { DashboardClient } from '@/components/DashboardClient'

export const metadata: Metadata = {
  title: 'Dashboard — Planet Sorted',
  description: 'Your saved items, history, and account settings.',
  robots: { index: false, follow: false },
}

export default function DashboardPage() {
  return <DashboardClient />
}
