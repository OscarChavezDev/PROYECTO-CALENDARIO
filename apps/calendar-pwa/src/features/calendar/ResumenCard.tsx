import type { CalendarItem } from './calendarTypes'
import { OPEN_TASK_STATUSES } from './calendarUtils'

/** Tarjeta "Resumen de hoy": eventos, tareas pendientes y % completado del día. */
export function ResumenCard({ items, dayKey }: { items: CalendarItem[]; dayKey: string }) {
  const todays = items.filter((i) => i.dayKey === dayKey)
  const eventsCount = todays.filter((i) => i.kind === 'evento' && i.event?.status !== 'cancelado').length
  const tasks = todays.filter((i) => i.kind === 'tarea' && i.task)
  const pending = tasks.filter((i) => i.task && OPEN_TASK_STATUSES.includes(i.task.status)).length
  const completed = tasks.filter((i) => i.task?.status === 'completada').length
  const total = completed + pending
  const pct = total > 0 ? Math.round((completed / total) * 100) : eventsCount > 0 ? 100 : 0

  return (
    <div className="glass-panel-hover glass-card relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-indigo-950/40 p-8 shadow-2xl backdrop-blur-2xl">
      <div className="pointer-events-none absolute right-0 top-0 -z-10 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-black tracking-tight text-white">Resumen de hoy</h2>
          <p className="mt-1 text-sm font-bold text-slate-400">
            <span className="text-blue-400 font-extrabold">{eventsCount} eventos</span>
            <span className="mx-2 text-slate-700">•</span>
            <span className="text-slate-300">{pending} tareas</span>
          </p>
        </div>
        <div className="sm:text-right">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Completado</span>
          <p className="mt-0.5 text-2xl font-black tabular-nums tracking-tight text-white">{pct}%</p>
        </div>
      </div>
      <div className="mt-6 h-3 w-full overflow-hidden rounded-full border border-slate-700/50 bg-slate-800/80 p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 shadow-lg shadow-blue-500/40 transition-all duration-700"
          style={{ width: `${Math.max(5, pct)}%` }}
        />
      </div>
    </div>
  )
}
