import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  
  // Get authenticated user
  const { data: { user: authUser } } = await supabase.auth.getUser(
    req.headers.get('authorization')?.replace('Bearer ', '') ?? ''
  )
  
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = authUser.id

  // Perform cascading wipe as specified in GDPR deletion rules
  try {
    // 1. Delete saved items
    await supabase.from('saved_items').delete().eq('user_id', userId)

    // 2. Delete credits ledger entries
    await supabase.from('credits_ledger').delete().eq('user_id', userId)

    // 3. Delete entitlements
    await supabase.from('entitlements').delete().eq('user_id', userId)

    // 4. Delete tool requests (cascades to tool_runs via DB schema cascade or manual fetch-and-delete)
    // To be safe, let's fetch tool request IDs and delete associated tool runs first, then tool requests.
    const { data: requests } = await supabase
      .from('tool_requests')
      .select('id')
      .eq('user_id', userId)

    if (requests && requests.length > 0) {
      const requestIds = requests.map(r => r.id)
      await supabase.from('tool_runs').delete().in('tool_request_id', requestIds)
      await supabase.from('tool_requests').delete().in('id', requestIds)
    }

    // 5. Delete users profile row
    await supabase.from('users').delete().eq('user_id', userId)

    // 6. Delete auth user via admin API
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)
    if (deleteAuthError) {
      console.error('[GDPR delete auth user error]', deleteAuthError)
      return NextResponse.json({ error: 'Failed to delete authentication profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Account and all associated data permanently deleted.' })
  } catch (err: any) {
    console.error('[GDPR delete error]', err)
    return NextResponse.json({ error: 'An unexpected error occurred during account deletion.' }, { status: 500 })
  }
}
