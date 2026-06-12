import { NavLink, Outlet } from 'react-router-dom'
import { OfflineBanner } from '../components/OfflineBanner'
import { useAuth } from '../features/auth/useAuth'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
  }`

export function AppLayout() {
  const { session } = useAuth()

  return (
    <div className="flex min-h-dvh flex-col bg-slate-100">
      <header className="bg-slate-900 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <span className="text-base font-semibold text-white">📅 Calendario</span>
          <nav className="flex gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Inicio
            </NavLink>
            {session ? (
              <NavLink to="/app" className={navLinkClass}>
                Mi calendario
              </NavLink>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
                <NavLink to="/register" className={navLinkClass}>
                  Registro
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <OfflineBanner />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
