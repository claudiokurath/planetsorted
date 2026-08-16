import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import {
  ensureSignupCredits,
  getCreditBalance,
  hasActiveEntitlement,
  SIGNUP_CREDITS,
} from '@/lib/billing/credits'

/**
 * GET /api/billing/status
 * Returns { plan, unlimited, balance, signupCredits } for the signed-in member.
 */
export async function GET(req: NextRequest) {
  const auth = await requireUser(req)
  if (!auth.user) return auth.error
  const { user, admin } = auth

  try {
    await ensureSignupCredits(admin, user.id)
    const unlimited = await hasActiveEntitlement(admin, user.id)
    const balance = unlimited ? null : await getCreditBalance(admin, user.id)

    let plan = 'Free'
    if (unlimited) {
      const { data } = await admin
        .from('entitlements')
        .select('plan, status')
        .eq('user_id', user.id)
        .maybeSingle()
      plan = data?.plan || 'Plus'
    }

    return NextResponse.json({
      plan,
      unlimited,
      balance,
      signupCredits: SIGNUP_CREDITS,
    })
  } catch (err) {
    console.error('[billing/status]', err)
    return NextResponse.json(
      { error: 'Could not load billing status right now.' },
      { status: 500 }
    )
  }
}
