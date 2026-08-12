import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { syncUserToCrm } from '@/lib/notion/syncUserToCrm'

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
      // `users.whatsapp_number` is NOT NULL and unique, so a row cannot be created
      // for a web-only signup — there is no number to store yet. The row is created
      // when the user verifies a WhatsApp number (see /api/whatsapp/verify-otp).
      // Until then serve an in-memory default so the dashboard still renders.
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

      // Best-effort — a Notion hiccup should never block dashboard access.
      if (defaultProfile.email) {
        try {
          await syncUserToCrm({ firstName: defaultProfile.first_name, email: defaultProfile.email, source: 'Website' })
        } catch (err) {
          console.error('[Notion CRM sync error]', err)
        }
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
      .maybeSingle()

    if (error) {
      console.error('[Profile update error]', error)
      return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 })
    }

    if (!updatedProfile) {
      // No profile row yet — see the GET handler above for why one cannot exist
      // before a WhatsApp number is verified.
      return NextResponse.json(
        { error: 'Please verify your WhatsApp number before saving your settings.' },
        { status: 409 }
      )
    }

    return NextResponse.json(updatedProfile)
  } catch (err: any) {
    console.error('[Profile update API error]', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
