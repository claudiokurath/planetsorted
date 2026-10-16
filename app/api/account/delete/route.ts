import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { stripe } from '@/lib/stripe'
import { AccountDeletionBillingError, cancelAccountSubscriptions } from '@/lib/billing/accountDeletion'

/**
 * GDPR account wipe. Requires an authenticated session/Bearer token.
 * Optionally accepts { confirm: "DELETE" } to reduce accidental clicks.
 */
export async function POST(req: NextRequest) {
  const auth = await requireUser(req)
  if (!auth.user) return auth.error
  const { user: authUser, admin: supabase } = auth

  let confirm: string | undefined
  try {
    const body = await req.json()
    if (typeof body === 'object' && body !== null && 'confirm' in body) {
      confirm = String((body as { confirm?: unknown }).confirm ?? '')
    }
  } catch {
    // Empty body is fine — dashboard currently sends no confirm field.
  }

  // Soft guard: if a confirm field is present it must equal DELETE.
  if (confirm !== undefined && confirm !== 'DELETE') {
    return NextResponse.json(
      { error: 'Please confirm account deletion by sending confirm: "DELETE".' },
      { status: 400 }
    )
  }

  const userId = authUser.id
  let authDeleted = false
  let phase = 'billing-lookup'

  try {
    // Keep the billing links until cancellation AND Auth deletion succeed.
    // A failed/uncertain Stripe request must never erase the IDs needed to retry.
    const { data: entitlements, error: billingReadError } = await supabase
      .from('entitlements')
      .select('status, stripe_customer_id, stripe_subscription_id')
      .eq('user_id', userId)
    if (billingReadError) throw billingReadError
    phase = 'billing-cancellation'
    await cancelAccountSubscriptions(stripe, entitlements ?? [])

    // tool_runs are removed by their tool_request_id ON DELETE CASCADE FK.
    // Scope the parent delete by owner rather than a stale snapshot of IDs.
    phase = 'tool-requests-delete'
    const { error: requestsError } = await supabase.from('tool_requests').delete().eq('user_id', userId)
    if (requestsError) throw requestsError

    phase = 'saved-items-delete'
    const { error: savedItemsError } = await supabase.from('saved_items').delete().eq('user_id', userId)
    if (savedItemsError) throw savedItemsError

    phase = 'credits-delete'
    const { error: creditsError } = await supabase.from('credits_ledger').delete().eq('user_id', userId)
    if (creditsError) throw creditsError

    // public.users has an Auth FK without a delete cascade, so it goes first.
    phase = 'profile-delete'
    const { error: profileError } = await supabase.from('users').delete().eq('user_id', userId)
    if (profileError) throw profileError

    phase = 'auth-delete'
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)
    if (deleteAuthError) {
      console.error('[account deletion]', { phase, status: 'failed' })
      return NextResponse.json(
        { error: 'We could not confirm account deletion. Please try signing in again or contact hello@planetsorted.com.' },
        { status: 500 }
      )
    }
    authDeleted = true

    phase = 'billing-reference-cleanup'
    const { error: entitlementsError } = await supabase.from('entitlements').delete().eq('user_id', userId)
    if (entitlementsError) throw entitlementsError

    return NextResponse.json({
      success: true,
      message: 'Your website account has been deleted.',
    })
  } catch (err) {
    if (authDeleted) {
      // Auth is gone: the caller cannot retry this authenticated endpoint.
      // Retained entitlement rows identify the work support must reconcile.
      console.error('[account deletion]', { phase, status: 'reconciliation-required' })
      return NextResponse.json(
        {
          accountDeleted: true,
          dataCleanupPending: true,
          error: 'Your sign-in account has been deleted, but some account records still need to be removed. Please contact hello@planetsorted.com so we can complete your deletion.',
        },
        { status: 500 }
      )
    }

    console.error('[account deletion]', { phase, status: 'failed' })
    return NextResponse.json(
      { error: err instanceof AccountDeletionBillingError
        ? err.message
        : 'We could not finish deleting your account. Please try again or contact hello@planetsorted.com.' },
      { status: 500 }
    )
  }
}
