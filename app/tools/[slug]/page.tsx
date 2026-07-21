import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { ToolClient } from '@/components/ToolClient'
import { createServerClient } from '@/lib/supabase/server'
import type { Entitlement } from '@/lib/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

const VALID_SLUGS = ['adhd-tax-calculator', 'financial-autopilot', 'decision-paralysis-solver']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (!VALID_SLUGS.includes(slug)) return {}

  const titles: Record<string, string> = {
    'adhd-tax-calculator': 'ADHD Tax Calculator — Sorted Lab',
    'financial-autopilot': 'Financial Autopilot — Sorted Lab',
    'decision-paralysis-solver': 'Decision Paralysis Solver — Sorted Lab',
  }

  const descriptions: Record<string, string> = {
    'adhd-tax-calculator': 'Calculate your estimated ADHD tax leak and get a plan to stop it.',
    'financial-autopilot': 'Map out your banking and transfers to run on autopilot.',
    'decision-paralysis-solver': 'Get unstuck on a heavy decision in under 5 minutes.',
  }

  return {
    title: titles[slug],
    description: descriptions[slug],
  }
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params
  if (!VALID_SLUGS.includes(slug)) {
    notFound()
  }

  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const sbCookie = allCookies.find(c => c.name.includes('auth-token') || c.name.includes('access_token'))
  
  let token: string | undefined
  if (sbCookie) {
    try {
      const parsed = JSON.parse(sbCookie.value)
      token = parsed.access_token || parsed[0]
    } catch {
      token = sbCookie.value
    }
  }

  let hasPaidPlan = false

  if (token) {
    const supabase = createServerClient()
    const { data: userData } = await supabase.auth.getUser(token)
    if (userData?.user) {
      const { data: entitlement } = await supabase
        .from('entitlements')
        .select('status')
        .eq('user_id', userData.user.id)
        .single()

      const row = entitlement as Entitlement | null
      hasPaidPlan = row?.status === 'active'
    }
  }

  return <ToolClient slug={slug} hasPaidPlan={hasPaidPlan} />
}
