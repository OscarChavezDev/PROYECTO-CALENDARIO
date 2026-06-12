import { Link } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/config/env'

export function HomePage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Organizador de calendario inteligente
        </h1>
        <p className="mt-2 text-slate-600">
          PWA mobile-first para organizar eventos, tareas, prioridades y recordatorios,
          sincronizada entre PC y iPhone.
        </p>
      </div>

      <div
        className={`rounded-lg border p-4 text-sm ${
          isSupabaseConfigured
            ? 'border-green-300 bg-green-50 text-green-800'
            : 'border-amber-300 bg-amber-50 text-amber-800'
        }`}
      >
        {isSupabaseConfigured
          ? 'Supabase configurado: la app puede conectarse al backend.'
          : 'Supabase aún no configurado: define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local.'}
      </div>

      <nav className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/login"
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow"
        >
          <h2 className="font-semibold text-slate-900">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-slate-500">Registro y login (Sprint 1)</p>
        </Link>
        <Link
          to="/app"
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow"
        >
          <h2 className="font-semibold text-slate-900">Mi calendario</h2>
          <p className="mt-1 text-sm text-slate-500">Eventos y tareas (Sprints 2-3)</p>
        </Link>
      </nav>
    </section>
  )
}
