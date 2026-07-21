import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

/**
 * Server-side Supabase client using the service role key.
 * For use in Server Components, Route Handlers, and Server Actions only.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
