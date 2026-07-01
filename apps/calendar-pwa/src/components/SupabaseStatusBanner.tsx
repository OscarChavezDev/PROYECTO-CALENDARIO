export function SupabaseStatusBanner({ configured }: { configured: boolean }) {
  return (
    <div
      className={`rounded-lg border p-4 text-sm ${
        configured
          ? 'border-green-500/30 bg-green-500/10 text-green-300'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
      }`}
    >
      {configured
        ? 'Supabase configurado: la app puede conectarse al backend.'
        : 'Supabase aún no configurado: define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local.'}
    </div>
  )
}
