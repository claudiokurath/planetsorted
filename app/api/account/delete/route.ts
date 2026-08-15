import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'

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

  try {
    await supabase.from('saved_items').delete().eq('user_id', userId)
    await supabase.from('credits_ledger').delete().eq('user_id', userId)
    await supabase.from('entitlements').delete().eq('user_id', userId)

    const { data: requests } = await supabase
      .from('tool_requests')
      .select('id')
      .eq('user_id', userId)

    if (requests && requests.length > 0) {
      const requestIds = requests.map((r) => r.id)
      await supabase.from('tool_runs').delete().in('tool_request_id', requestIds)
      await supabase.from('tool_requests').delete().in('id', requestIds)
    }

    await supabase.from('users').delete().eq('user_id', userId)

    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)
    if (deleteAuthError) {
      console.error('[GDPR delete auth user error]', deleteAuthError)
      return NextResponse.json(
        { error: 'Failed to delete authentication profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data permanently deleted.',
    })
  } catch (err) {
    console.error('[GDPR delete error]', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred during account deletion.' },
      { status: 500 }
    )
  }
}
