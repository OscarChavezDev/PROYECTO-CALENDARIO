import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseClient } from './client'

/** Devuelve el cliente o lanza un error legible si Supabase no está configurado. */
export function requireClient(): SupabaseClient {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local.',
    )
  }
  return supabase
}
