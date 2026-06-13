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
          Organiza tus eventos, tareas, prioridades y recordatorios en un solo lugar,
          sincronizado entre tu computador y tu teléfono.
        </p>
      </div>

      {/* Solo se avisa si falta configuración; no se muestra ruido técnico al usuario */}
      {!isSupabaseConfigured && <SupabaseStatusBanner configured={false} />}

      <nav className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/login"
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow"
        >
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <i className="fi fi-rr-sign-in-alt text-indigo-600"></i>
            Iniciar sesión
          </h2>
          <p className="mt-1 text-sm text-slate-500">Entra o crea tu cuenta para empezar.</p>
        </Link>
        <Link
          to="/app"
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow"
        >
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <i className="fi fi-rr-calendar text-indigo-600"></i>
            Mi calendario
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tus eventos, tareas y recordatorios del día.
          </p>
        </Link>
      </nav>
    </section>
  )
}
