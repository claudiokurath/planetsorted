import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'

export async function GET(req: NextRequest) {
  const auth = await requireUser(req)
  if (!auth.user) return auth.error
  const { user: authUser, admin: supabase } = auth

  try {
    const { data: items, error } = await supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', authUser.id)
      .order('saved_at', { ascending: false })

    if (error) {
      console.error('[Saved items fetch error]', error)
      return NextResponse.json({ error: 'Failed to fetch saved items' }, { status: 500 })
    }

    return NextResponse.json(items || [])
  } catch (err) {
    console.error('[Saved items API error]', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
