import type { Metadata } from 'next'
import { DashboardClient } from '@/components/DashboardClient'
import { createServerClient } from '@/lib/supabase/server'

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
    <main className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 flex items-start justify-center px-4 pt-10 pb-20">
        <div className="w-full max-w-7xl">
          <DashboardClient tools={tools} />
        </div>
      </div>
    </main>
  )
}
