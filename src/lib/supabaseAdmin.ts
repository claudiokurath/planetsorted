import { createClient } from '@supabase/supabase-js';

// Server-only Supabase client with Service Role bypass
export const supabaseAdmin = createClient(
    process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SECRET_KEY || 'placeholder'
);
