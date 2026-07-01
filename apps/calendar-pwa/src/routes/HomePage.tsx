import { Link, Navigate } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/config/env'
import { SupabaseStatusBanner } from '../components/SupabaseStatusBanner'
import { useAuth } from '../features/auth/useAuth'

const features = [
  {
    icon: 'calendar_month',
    title: 'Eventos y tareas',
    desc: 'Un solo lugar para tus eventos, tareas y prioridades, organizados por día, semana y mes.',
  },
  {
    icon: 'notifications_active',
    title: 'Recordatorios a tiempo',
    desc: 'Avisos programados para que nada se te pase, con la opción de posponer cuando lo necesites.',
  },
  {
    icon: 'sync',
    title: 'Siempre sincronizado',
    desc: 'Tus datos al día entre tu computador y tu teléfono, sin tener que copiar nada a mano.',
  },
  {
    icon: 'bolt',
    title: 'Rápido y sin conexión',
    desc: 'Instálalo como app y úsalo aunque te quedes sin internet. Todo carga al instante.',
  },
] as const

export function HomePage() {
  const { session, loading } = useAuth()

  // Con sesión iniciada, Inicio lleva directo al calendario.
  if (session && !loading) return <Navigate to="/app" replace />

  return (
    <div className="relative min-h-dvh overflow-x-hidden text-aurora-text">
      {/* Barra superior */}
      <header className="sticky top-0 z-30 border-b border-ui-line/40 bg-ui-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link to="/" className="press flex items-center gap-3">
            <img
              src="/logo.svg"
              alt=""
              className="h-9 w-9 rounded-xl drop-shadow-[0_0_12px_rgba(77,142,255,0.45)]"
            />
            <span className="text-base font-bold tracking-tight text-white">Mi Calendario</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to="/login"
              className="press rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="press glow-button rounded-full bg-gradient-to-br from-aurora-primary to-aurora-indigo px-4 py-2 text-sm font-semibold text-white"
            >
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Hero */}
        <section className="stagger flex flex-col items-center gap-7 pb-16 pt-16 text-center sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-ui-line/60 bg-ui-chip/40 px-4 py-1.5 text-xs font-medium text-aurora-primary-bright backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-aurora-emerald" />
            Tu tiempo, organizado
          </span>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl">
            Organiza tu día con{' '}
            <span className="bg-gradient-to-r from-aurora-primary-bright via-aurora-primary to-aurora-indigo-bright bg-clip-text text-transparent">
              claridad
            </span>
          </h1>

          <p className="max-w-xl text-balance text-base text-aurora-text-muted sm:text-lg">
            Eventos, tareas, prioridades y recordatorios en un solo lugar, sincronizados entre tu
            computador y tu teléfono.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="press glow-button inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-aurora-primary to-aurora-indigo px-7 py-3 text-sm font-bold text-white"
            >
              Comenzar gratis
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
            <Link
              to="/app"
              className="press inline-flex items-center gap-2 rounded-full border border-ui-line/70 bg-ui-card/40 px-7 py-3 text-sm font-semibold text-slate-200 backdrop-blur transition-colors hover:border-white/25 hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              Ver mi calendario
            </Link>
          </div>

          {!isSupabaseConfigured && (
            <div className="w-full max-w-md text-left">
              <SupabaseStatusBanner configured={false} />
            </div>
          )}
        </section>

        {/* Características */}
        <section className="stagger grid gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <article
              key={f.title}
              className="glass-card glass-panel-hover flex flex-col gap-3 rounded-glass p-5"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-aurora-primary/25 to-aurora-indigo/20 text-aurora-primary-bright ring-1 ring-inset ring-white/10">
                <span className="material-symbols-outlined text-[22px]">{f.icon}</span>
              </span>
              <h3 className="text-sm font-bold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-aurora-text-muted">{f.desc}</p>
            </article>
          ))}
        </section>

        {/* CTA final */}
        <section className="pb-20">
          <div className="glass-panel relative overflow-hidden rounded-glass px-6 py-12 text-center sm:px-10">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Empieza a organizarte hoy
            </h2>
            <p className="mx-auto mt-3 max-w-md text-aurora-text-muted">
              Crea tu cuenta gratis y ten tu agenda lista en menos de un minuto.
            </p>
            <Link
              to="/register"
              className="press glow-button mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-aurora-primary to-aurora-indigo px-7 py-3 text-sm font-bold text-white"
            >
              Crear mi cuenta
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-ui-line/40 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-sm text-aurora-text-dim sm:flex-row sm:px-8">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="" className="h-6 w-6 rounded-md" />
            <span className="font-semibold text-slate-300">Mi Calendario</span>
          </div>
          <p>Hecho para que tu día fluya.</p>
        </div>
      </footer>
    </div>
  )
}
