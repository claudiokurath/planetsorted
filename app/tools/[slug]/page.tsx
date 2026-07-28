import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ToolClient } from '@/components/ToolClient'
import { createServerClient } from '@/lib/supabase/server'
import type { Entitlement } from '@/lib/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServerClient()
  const { data: tool } = await supabase
    .from('protocols')
    .select('title, summary')
    .eq('slug', slug)
    .eq('type', 'Tool')
    .eq('status', 'Published')
    .single()

  if (!tool) return {}

  return {
    title: `${tool.title} — PLANET SOR7ED`,
    description: tool.summary || '',
  }
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params
  const supabase = createServerClient()
  
  const { data: tool } = await supabase
    .from('protocols')
    .select('*')
    .eq('slug', slug)
    .eq('type', 'Tool')
    .eq('status', 'Published')
    .single()

  if (!tool) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()

  let hasPaidPlan = false

  if (user) {
    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('status')
      .eq('user_id', user.id)
      .single()

    const row = entitlement as Entitlement | null
    hasPaidPlan = row?.status === 'active'
  }

  return <ToolClient slug={slug} hasPaidPlan={hasPaidPlan} toolData={tool} />
}
