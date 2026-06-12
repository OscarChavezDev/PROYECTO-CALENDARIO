export function SupabaseStatusBanner({ configured }: { configured: boolean }) {
  return (
    <div
      className={`rounded-lg border p-4 text-sm ${
        configured
          ? 'border-green-300 bg-green-50 text-green-800'
          : 'border-amber-300 bg-amber-50 text-amber-800'
      }`}
    >
      {configured
        ? 'Supabase configurado: la app puede conectarse al backend.'
        : 'Supabase aún no configurado: define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local.'}
    </div>
  )
}
