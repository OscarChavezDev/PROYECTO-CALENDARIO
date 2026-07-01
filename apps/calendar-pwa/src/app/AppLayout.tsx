import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { OfflineBanner } from '../components/OfflineBanner'
import { NotificationPrompt } from '../features/notifications/NotificationPrompt'
import { useAuth } from '../features/auth/useAuth'
import { SideNavBar } from '../components/SideNavBar'
import { CalendarSidebarProvider } from './CalendarSidebarContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `press rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-gradient-to-b from-blue-500/30 to-blue-600/20 text-white ring-1 ring-inset ring-blue-400/40 shadow-lg shadow-blue-900/30'
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || 'U'
}

export function AppLayout() {
  const { session, user } = useAuth()
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) || user?.email?.split('@')[0] || 'Usuario'

  // Brillo que sigue el cursor sobre las tarjetas de cristal (.glass-panel-hover).
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.('.glass-panel-hover') as HTMLElement | null
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mouse-x', `${e.clientX - r.left}px`)
      el.style.setProperty('--mouse-y', `${e.clientY - r.top}px`)
    }
    document.addEventListener('pointermove', onMove)
    return () => document.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <CalendarSidebarProvider>
    <div className="relative flex h-dvh overflow-hidden bg-ui-bg select-none">
      {/* Orbes de aurora: color visible detrás del cristal (header + sidebar + tarjetas)
          para que la transparencia "glass" se note, como en el mockup. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-48 -top-40 h-[520px] w-[520px] rounded-full bg-blue-700/14 blur-[155px]" />
        <div className="absolute right-[14%] -top-32 h-[460px] w-[460px] rounded-full bg-indigo-600/14 blur-[150px]" />
        <div className="absolute -right-48 top-[30%] h-[520px] w-[520px] rounded-full bg-indigo-700/12 blur-[170px]" />
        <div className="absolute -right-40 -bottom-48 h-[540px] w-[540px] rounded-full bg-blue-800/12 blur-[170px]" />
      </div>
      <SideNavBar />
      <div className="relative z-10 flex flex-1 flex-col min-w-0 min-h-0 overflow-hidden md:pl-80">
        {/* TopAppBar (solo móvil) */}
        <header className="sticky top-0 z-30 border-b border-ui-line/50 bg-ui-panel/85 backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Mi Calendario" className="h-9 w-9 rounded-md drop-shadow-[0_0_10px_rgba(77,142,255,0.4)]" />
              <span className="text-lg font-bold tracking-tight text-white">Mi Calendario</span>
            </div>
            {session ? (
              <NavLink to="/ajustes" className="flex items-center gap-2.5 press">
                <span className="text-sm font-bold text-white">{displayName}</span>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                  {initials(displayName)}
                </span>
              </NavLink>
            ) : (
              <nav className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-1">
                <NavLink to="/login" className={navLinkClass}>
                  Entrar
                </NavLink>
                <NavLink to="/register" className={navLinkClass}>
                  Registro
                </NavLink>
              </nav>
            )}
          </div>
        </header>
        <OfflineBanner />
        <NotificationPrompt />
        <main className="w-full flex-1 min-h-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
    </CalendarSidebarProvider>
  )
}
