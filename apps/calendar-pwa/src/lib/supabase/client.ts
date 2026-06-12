import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabaseEnv } from '../config/env'

let client: SupabaseClient | null = null

/**
 * Devuelve el cliente de Supabase, o null si las variables
 * VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY aún no están configuradas
 * (la app debe seguir cargando sin proyecto Supabase creado).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null
  }
  if (!client) {
    client = createClient(supabaseEnv.url!, supabaseEnv.anonKey!)
  }
  return client
}
