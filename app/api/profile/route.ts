import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/requireUser'
import { syncUserToCrm } from '@/lib/notion/syncUserToCrm'

const FIRST_NAME_MAX = 40
const FIRST_NAME_RE = /^[\p{L}\p{N}\s'-]*$/u

function sanitizeFirstName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim().slice(0, FIRST_NAME_MAX)
  if (!FIRST_NAME_RE.test(trimmed)) return null
  return trimmed
}

export async function GET(req: NextRequest) {
  const auth = await requireUser(req)
  if (!auth.user) return auth.error
  const { user: authUser, admin: supabase } = auth

  try {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('[Profile fetch error]', error)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    if (!profile) {
      // users.whatsapp_number is NOT NULL + unique, so a row cannot exist for a
      // web-only signup until WhatsApp is verified. Serve an in-memory default.
      const defaultProfile = {
        user_id: authUser.id,
        first_name: authUser.user_metadata?.first_name || '',
        email: authUser.email || '',
        whatsapp_number: null,
        whatsapp_verified: false,
        weekly_opted_in: false,
        whatsapp_opted_out: false,
        created_at: new Date().toISOString(),
      }

      if (defaultProfile.email) {
        try {
          await syncUserToCrm({
            firstName: defaultProfile.first_name,
            email: defaultProfile.email,
            source: 'Website',
          })
        } catch (err) {
          console.error('[Notion CRM sync error]', err)
        }
      }

      return NextResponse.json(defaultProfile)
    }

    return NextResponse.json(profile)
  } catch (err) {
    console.error('[Profile API error]', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req)
  if (!auth.user) return auth.error
  const { user: authUser, admin: supabase } = auth

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const rawFirst =
    typeof body === 'object' && body !== null && 'firstName' in body
      ? (body as { firstName?: unknown }).firstName
      : undefined
  const rawWeekly =
    typeof body === 'object' && body !== null && 'weeklyOptedIn' in body
      ? (body as { weeklyOptedIn?: unknown }).weeklyOptedIn
      : undefined

  const firstName = sanitizeFirstName(rawFirst)
  if (rawFirst !== undefined && firstName === null) {
    return NextResponse.json(
      { error: 'Please enter a valid first name (letters, numbers, spaces, hyphens, apostrophes).' },
      { status: 400 }
    )
  }

  if (rawWeekly !== undefined && typeof rawWeekly !== 'boolean') {
    return NextResponse.json(
      { error: 'weeklyOptedIn must be true or false.' },
      { status: 400 }
    )
  }

  const updates: { first_name?: string; weekly_opted_in?: boolean } = {}
  if (firstName !== null && firstName !== undefined && rawFirst !== undefined) {
    updates.first_name = firstName
  }
  if (typeof rawWeekly === 'boolean') {
    updates.weekly_opted_in = rawWeekly
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })
  }

  try {
    const { data: updatedProfile, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', authUser.id)
      .select()
      .maybeSingle()

    if (error) {
      console.error('[Profile update error]', error)
      return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 })
    }

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Please verify your WhatsApp number before saving your settings.' },
        { status: 409 }
      )
    }

    return NextResponse.json(updatedProfile)
  } catch (err) {
    console.error('[Profile update API error]', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
