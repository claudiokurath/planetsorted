import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { getAggregatedMetrics } from '@/lib/analytics/events'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.authorized) {
    return auth.error || NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const hoursParam = url.searchParams.get('hours')
  const hours = hoursParam ? parseInt(hoursParam, 10) || 24 : 24

  try {
    const metrics = await getAggregatedMetrics(hours)
    return NextResponse.json(metrics)
  } catch (err) {
    console.error('[Admin API metrics] Error:', err)
    return NextResponse.json({ error: 'Failed to retrieve metrics.' }, { status: 500 })
  }
}
