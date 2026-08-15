import { NextRequest, NextResponse } from 'next/server'
import { createClient, type User } from '@supabase/supabase-js'
import { createServerClient, createSessionClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Resolve the calling user for a Route Handler.
 *
 * Accepts either:
 *  1. `Authorization: Bearer <access_token>` (dashboard / SPA clients), or
 *  2. Supabase auth cookies (server actions, cookie-based fetches).
 *
 * Returns a service-role admin client for privileged DB work AFTER the user
 * has been authenticated. Never use the admin client to identify the caller.
 */
export type RequireUserOk = {
  user: User
  /** Service-role client — use only after auth succeeds. */
  admin: SupabaseClient<Database>
}

export type RequireUserResult =
  | (RequireUserOk & { error?: undefined })
  | { user: null; admin?: undefined; error: NextResponse }

function anonClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  )
}

export async function requireUser(req: NextRequest): Promise<RequireUserResult> {
  const admin = createServerClient()

  const authHeader = req.headers.get('authorization')
  const bearer =
    authHeader && authHeader.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : ''

  if (bearer) {
    // Validate the JWT with the anon key — do not trust service-role getUser
    // as the primary identity path (keeps admin key out of the auth hot path).
    const { data, error } = await anonClient().auth.getUser(bearer)
    if (!error && data.user) {
      return { user: data.user, admin }
    }
  }

  // Cookie session fallback (works for same-origin fetches that send cookies).
  try {
    const session = await createSessionClient()
    const { data } = await session.auth.getUser()
    if (data.user) {
      return { user: data.user, admin }
    }
  } catch (err) {
    console.error('[requireUser] session client error', err)
  }

  return {
    user: null,
    error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  }
}

/** Soft variant — returns null user instead of an error Response. */
export async function getRequestUser(
  req: NextRequest
): Promise<{ user: User | null; admin: SupabaseClient<Database> }> {
  const result = await requireUser(req)
  if (result.user) {
    return { user: result.user, admin: result.admin }
  }
  return { user: null, admin: createServerClient() }
}
