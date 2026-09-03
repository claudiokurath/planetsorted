import type { Metadata } from 'next'
import Link from 'next/link'
import { checkAdminServerSession } from '@/lib/auth/requireAdmin'
import { getAggregatedMetrics } from '@/lib/analytics/events'
import { getAllFeatureFlags } from '@/lib/flags/featureFlags'
import { AdminDashboardClient } from '@/app/admin/AdminDashboardClient'

export const metadata: Metadata = {
  title: 'Operations & Analytics — PLANET SOR7ED',
  description: 'Internal platform telemetry, tool metrics, and feature flag management.',
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = 'force-dynamic'

interface AdminPageProps {
  searchParams: Promise<{ admin_key?: string }>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { admin_key } = await searchParams
  const { authorized } = await checkAdminServerSession(admin_key)

  if (!authorized) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md border border-white/10 p-8 bg-[#080808] shadow-2xl">
          <span className="sor7ed-pill mb-4">ACCESS RESTRICTED</span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-4 mb-2">
            PLANET <span className="text-[#F5C518]">SOR7ED</span>
          </h1>
          <p className="text-xs text-white/60 leading-relaxed mb-6 font-sans">
            You do not have administrative access to this section. Please sign in with an authorized account or provide a valid access key.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/auth"
              className="w-full py-2.5 px-4 bg-[#F5C518] hover:bg-[#F5C518]/90 text-black text-xs uppercase tracking-widest font-bold transition-all"
            >
              Sign In via Magic Link
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 px-4 border border-white/20 hover:border-white text-white/80 text-xs uppercase tracking-widest transition-all"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fetch initial telemetry and flags in parallel
  const [metrics, flags] = await Promise.all([
    getAggregatedMetrics(24),
    getAllFeatureFlags(),
  ])

  return (
    <AdminDashboardClient
      initialMetrics={metrics}
      initialFlags={flags}
    />
  )
}
