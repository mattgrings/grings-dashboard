import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('[Supabase] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY precisam estar no .env')
}

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_ANON ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'grings-auth',
  },
})
