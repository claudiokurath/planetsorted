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
    // Attempt to select from users table
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('[Profile fetch error]', error)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    if (!profile) {
      // Create a default profile row if it doesn't exist yet
      const defaultProfile = {
        user_id: authUser.id,
        first_name: authUser.user_metadata?.first_name || '',
        email: authUser.email || '',
        whatsapp_number: null,
        whatsapp_verified: false,
        weekly_opted_in: false,
        whatsapp_opted_out: false,
        created_at: new Date().toISOString()
      }

      const { error: insertError } = await supabase
        .from('users')
        .insert(defaultProfile)

      if (insertError) {
        console.error('[Default profile insert error]', insertError)
        return NextResponse.json({ error: 'Failed to initialize profile' }, { status: 500 })
      }

      return NextResponse.json(defaultProfile)
    }

    return NextResponse.json(profile)
  } catch (err: any) {
    console.error('[Profile API error]', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  
  // Get authenticated user
  const { data: { user: authUser } } = await supabase.auth.getUser(
    req.headers.get('authorization')?.replace('Bearer ', '') ?? ''
  )
  
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { firstName, weeklyOptedIn } = await req.json()

  try {
    const { data: updatedProfile, error } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        weekly_opted_in: !!weeklyOptedIn
      })
      .eq('user_id', authUser.id)
      .select()
      .single()

    if (error) {
      console.error('[Profile update error]', error)
      return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 })
    }

    return NextResponse.json(updatedProfile)
  } catch (err: any) {
    console.error('[Profile update API error]', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
