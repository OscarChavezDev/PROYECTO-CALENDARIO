import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from '../features/auth/authService'
import { useAuth } from '../features/auth/useAuth'
import { useCalendarSidebar } from '../app/CalendarSidebarContext'
import { CalendarSidebarWidgets } from './CalendarSidebarWidgets'

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || 'U'
}

export function SideNavBar() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data } = useCalendarSidebar()

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) || user?.email?.split('@')[0] || 'Usuario'

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login')
    } catch {
      // Ignorar error al salir
    }
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-50 hidden w-72 flex-col border-r border-white/5 bg-ui-panel/55 p-6 backdrop-blur-2xl md:flex select-none">
      {/* Cabecera Logo */}
      <div className="flex shrink-0 items-center gap-3.5 px-1 pb-8">
        <img
          src="/logo.svg"
          alt="Mi Calendario"
          className="h-10 w-10 rounded-xl"
        />
        <h1 className="text-lg font-bold tracking-tight text-white">Mi Calendario</h1>
      </div>

      {/* Contenido scrollable: widgets del calendario */}
      <div className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2 no-scrollbar">
        {data && <CalendarSidebarWidgets {...data} />}
      </div>

      {/* Footer: tarjeta de perfil */}
      <section className="mt-6 shrink-0 rounded-2xl border border-ui-line/50 bg-ui-card/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ui-line bg-blue-600 text-xs font-bold text-white">
              {initials(displayName)}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-semibold text-slate-200">{displayName}</span>
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Sincronizado</span>
              </span>
            </div>
          </div>
          <NavLink
            to="/ajustes"
            title="Ajustes"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-ui-chip hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
          </NavLink>
        </div>

        <div className="my-3 h-px w-full bg-ui-line/60" />

        <button
          type="button"
          onClick={handleSignOut}
          className="group flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
        >
          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">
            logout
          </span>
          <span>Cerrar sesión</span>
        </button>
      </section>
    </aside>
  )
}
