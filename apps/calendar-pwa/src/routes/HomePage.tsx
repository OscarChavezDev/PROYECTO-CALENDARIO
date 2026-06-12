import { Link } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/config/env'
import { SupabaseStatusBanner } from '../components/SupabaseStatusBanner'

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

      <SupabaseStatusBanner configured={isSupabaseConfigured} />

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
