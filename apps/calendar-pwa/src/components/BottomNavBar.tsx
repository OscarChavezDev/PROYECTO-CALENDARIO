import { useNavigate } from 'react-router-dom'
import type { CalendarViewId } from '../features/calendar/calendarTypes'

const ITEMS: Array<{ id: CalendarViewId; label: string; icon: string }> = [
  { id: 'hoy', label: 'Hoy', icon: 'today' },
  { id: 'dia', label: 'Día', icon: 'view_day' },
  { id: 'semana', label: 'Semana', icon: 'calendar_view_week' },
  { id: 'mes', label: 'Mes', icon: 'calendar_view_month' },
]

/** Barra de navegación inferior (solo móvil) con el selector de vistas + Ajustes. */
export function BottomNavBar({
  view,
  onChange,
}: {
  view: CalendarViewId
  onChange: (view: CalendarViewId) => void
}) {
  const navigate = useNavigate()

  return (
    <nav
      className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-xl border-t border-ui-line/50 bg-ui-panel/90 px-2 py-2 shadow-[0_-4px_20px_rgba(37,99,235,0.12)] backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)' }}
    >
      {ITEMS.map((it) => {
        const active = view === it.id
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1 transition-colors ${
              active ? 'bg-blue-500/15 text-blue-400' : 'text-slate-400 hover:text-blue-400'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {it.icon}
            </span>
            <span className="mt-0.5 text-[0.7rem] font-medium">{it.label}</span>
          </button>
        )
      })}
      <button
        type="button"
        onClick={() => navigate('/ajustes')}
        className="flex flex-col items-center justify-center rounded-xl px-2.5 py-1 text-slate-400 transition-colors hover:text-blue-400"
      >
        <span className="material-symbols-outlined text-[22px]">settings</span>
        <span className="mt-0.5 text-[0.7rem] font-medium">Ajustes</span>
      </button>
    </nav>
  )
}
