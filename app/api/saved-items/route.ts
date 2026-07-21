import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  
  // Get authenticated user
  const { data: { user: authUser } } = await supabase.auth.getUser(
    req.headers.get('authorization')?.replace('Bearer ', '') ?? ''
  )
  
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: items, error } = await supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Saved items fetch error]', error)
      return NextResponse.json({ error: 'Failed to fetch saved items' }, { status: 500 })
    }

    return NextResponse.json(items || [])
  } catch (err: any) {
    console.error('[Saved items API error]', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
