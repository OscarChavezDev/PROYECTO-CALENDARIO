export const supabaseEnv = {
  url: (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? null,
  anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? null,
}

export const isSupabaseConfigured = Boolean(supabaseEnv.url && supabaseEnv.anonKey)

/** Clave pública VAPID para Web Push (null si no está configurada). */
export const vapidPublicKey =
  (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) ?? null
