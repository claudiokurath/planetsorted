import type { Metadata } from 'next'
import { DashboardClient } from '@/components/DashboardClient'

export const metadata: Metadata = {
  title: 'Account — Planet Sorted',
  description: 'Your saved items, history, and account settings.',
  robots: { index: false, follow: false },
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 flex items-start justify-center px-4 pt-10 pb-20">
        <div className="w-full max-w-6xl">
          <DashboardClient />
        </div>
      </div>
    </main>
  )
}
