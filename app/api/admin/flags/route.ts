import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { getAllFeatureFlags, updateFeatureFlag } from '@/lib/flags/featureFlags'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.authorized) {
    return auth.error || NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const flags = await getAllFeatureFlags(true)
    return NextResponse.json({ flags })
  } catch (err) {
    console.error('[Admin API flags GET] Error:', err)
    return NextResponse.json({ error: 'Failed to retrieve flags.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.authorized) {
    return auth.error || NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object' || !body.flagKey) {
      return NextResponse.json({ error: 'flagKey is required.' }, { status: 400 })
    }

    const { flagKey, enabled, rolloutPercentage, description, allowedUserIds } = body

    const updates: Record<string, unknown> = {}
    if (typeof enabled === 'boolean') updates.enabled = enabled
    if (typeof rolloutPercentage === 'number') {
      updates.rollout_percentage = Math.max(0, Math.min(100, rolloutPercentage))
    }
    if (typeof description === 'string') updates.description = description
    if (Array.isArray(allowedUserIds)) updates.allowed_user_ids = allowedUserIds

    const result = await updateFeatureFlag(flagKey, updates)

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to update feature flag.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, flag: result.flag })
  } catch (err) {
    console.error('[Admin API flags POST] Error:', err)
    return NextResponse.json({ error: 'Failed to update flag.' }, { status: 500 })
  }
}
