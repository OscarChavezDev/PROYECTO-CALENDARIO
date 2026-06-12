export const supabaseEnv = {
  url: (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? null,
  anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? null,
}

export const isSupabaseConfigured = Boolean(supabaseEnv.url && supabaseEnv.anonKey)
