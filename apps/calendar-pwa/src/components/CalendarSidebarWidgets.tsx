import { minutesFromIso, todayKey } from '../lib/dates/dateUtils'
import { OPEN_TASK_STATUSES } from '../features/calendar/calendarUtils'
import type { CalendarSidebarData } from '../app/CalendarSidebarContext'

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']

function dateBadge(dayKey: string) {
  const [, m, d] = dayKey.split('-').map(Number)
  return { month: MONTHS[(m ?? 6) - 1] ?? 'JUN', day: d ?? 1 }
}

/**
 * Widgets de la barra lateral en la vista de calendario:
 * Próximos, Lista de Pendientes y Estadísticas (como en el mockup desktop).
 */
export function CalendarSidebarWidgets({ items, tasks, onOpen, onCompleteTask }: CalendarSidebarData) {
  const today = todayKey()
  const nowMin = minutesFromIso(new Date().toISOString())

  const upcoming = items
    .filter((i) => i.dayKey > today || (i.dayKey === today && i.sortMinutes >= nowMin))
    .sort((a, b) => a.dayKey.localeCompare(b.dayKey) || a.sortMinutes - b.sortMinutes)
    .slice(0, 2)

  const openTasks = tasks.filter((t) => OPEN_TASK_STATUSES.includes(t.status)).slice(0, 3)

  return (
    <div className="flex flex-col gap-4">
      {/* ===== Próximos ===== */}
      <section className="glass-panel-hover rounded-2xl border border-ui-line/50 bg-ui-card/45 p-4 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Próximos</h2>
          <span className="material-symbols-outlined text-[16px] text-slate-500">arrow_forward</span>
        </div>
        <div className="flex flex-col gap-2">
          {upcoming.length === 0 ? (
            <p className="py-1 text-xs text-slate-600">Nada próximo en agenda</p>
          ) : (
            upcoming.map((item) => {
              const b = dateBadge(item.dayKey)
              return (
                <button
                  key={`up-${item.id}`}
                  type="button"
                  onClick={() => onOpen(item)}
                  className="group flex w-full items-start gap-3 rounded-xl p-1.5 text-left transition-colors hover:bg-ui-chip/60"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-ui-line/70 bg-ui-chip/80">
                    <span className="text-[9px] font-bold uppercase leading-none text-blue-400">{b.month}</span>
                    <span className="mt-0.5 text-sm font-bold leading-none text-slate-200">{b.day}</span>
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <h3 className="truncate text-xs font-semibold text-slate-200 group-hover:text-white">{item.title}</h3>
                    <p className="mt-1 truncate text-[11px] text-slate-500">
                      {item.time ? `${item.time}${item.endTime ? ` - ${item.endTime}` : ''}` : 'Todo el día'}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </section>

      {/* ===== Lista de Pendientes ===== */}
      <section className="glass-panel-hover rounded-2xl border border-ui-line/50 bg-ui-card/45 p-4 backdrop-blur-xl">
        <h2 className="mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase">Lista de Pendientes</h2>
        <div className="flex flex-col gap-1.5">
          {openTasks.length === 0 ? (
            <p className="py-1 text-xs text-slate-600">Sin tareas pendientes</p>
          ) : (
            openTasks.map((task) => (
              <label key={`pend-${task.id}`} className="group flex cursor-pointer items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-ui-chip/60">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    onCompleteTask(task)
                  }}
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-ui-line bg-ui-chip transition-all group-hover:border-slate-500"
                >
                  <span className="material-symbols-outlined text-[12px] text-transparent group-hover:text-slate-400">check</span>
                </button>
                <span className="truncate text-xs font-medium text-slate-300 group-hover:text-white">
                  {task.title}
                </span>
              </label>
            ))
          )}
        </div>
        <button
          type="button"
          className="mt-4 flex items-center gap-1 pl-1 text-[11px] font-bold tracking-wider uppercase text-blue-400 transition-colors hover:text-blue-300"
        >
          <span>Ver todas</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        </button>
      </section>
    </div>
  )
}
