import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SECRET_KEY

if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY (server-side env vars)')
}

export const supabaseAdmin = createClient(url, serviceKey)
