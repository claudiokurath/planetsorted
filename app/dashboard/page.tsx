import { Suspense } from 'react'
import type { Metadata } from 'next'
import { DashboardClient } from '@/components/DashboardClient'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Account — PLANET SOR7ED',
  description: 'Your saved items, history, and account settings.',
  robots: { index: false, follow: false },
}

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: rawTools } = await supabase
    .from('protocols')
    .select('slug, title, summary, read_time')
    .eq('type', 'Tool')
    .eq('status', 'Published')
    .order('title')

  const tools = rawTools || []

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen items-start justify-center px-4 pt-10 pb-20">
        <div className="w-full max-w-7xl">
          <Suspense
            fallback={
              <p className="text-center text-neutral-500 py-20">Loading your account…</p>
            }
          >
            <DashboardClient tools={tools} />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
