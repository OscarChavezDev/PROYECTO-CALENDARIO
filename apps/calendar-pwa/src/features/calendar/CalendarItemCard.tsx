import { PriorityBadge } from '../../components/Badges'
import type { Priority } from '../../lib/domain/types'
import type { CalendarEvent } from '../events/types'
import type { Task } from '../tasks/types'
import type { CalendarItem } from './calendarTypes'

export interface CalendarItemActions {
  /** Abrir el detalle (solo lectura) del ítem. */
  onOpen: (item: CalendarItem) => void
  onCompleteTask: (task: Task) => void
  onPostponeTask: (task: Task) => void
}

/** Acento izquierdo por prioridad: crítica/alta destacan. */
const priorityBar: Record<Priority, string> = {
  critica: 'before:bg-gradient-to-b before:from-red-500 before:to-rose-600 shadow-red-500/5',
  alta: 'before:bg-gradient-to-b before:from-amber-500 before:to-orange-600 shadow-amber-500/5',
  media: 'before:bg-gradient-to-b before:from-blue-400 before:to-indigo-500',
  baja: 'before:bg-slate-700',
}

const kindStyles: Record<CalendarItem['kind'], string> = {
  evento: 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30',
  tarea: 'bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/30',
}

const quickButton = 'press rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all duration-200 active:scale-95 flex items-center gap-1'

export function CalendarItemCard({
  item,
  actions,
}: {
  item: CalendarItem
  actions: CalendarItemActions
}) {
  const task = item.task
  const event = item.event as CalendarEvent | undefined
  const isCompletedTask = task?.status === 'completada'

  return (
    <div
      className={`glass-card group relative overflow-hidden rounded-2xl border border-slate-800/80 pl-4 shadow-xl transition-all duration-200 hover:scale-[1.01] hover:border-slate-700 hover:shadow-2xl before:absolute before:inset-y-0 before:left-0 before:w-1.5 ${priorityBar[item.priority]}`}
    >
      <button
        type="button"
        onClick={() => actions.onOpen(item)}
        className="press flex w-full items-start justify-between gap-3 p-3.5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {item.time && (
              <span className="text-xs font-bold tabular-nums text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                {item.time}
              </span>
            )}
            <span
              className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${kindStyles[item.kind]}`}
            >
              {item.kind === 'evento' ? 'Evento' : 'Tarea'}
            </span>
            <PriorityBadge priority={item.priority} />
          </div>

          <h3
            className={`truncate text-base font-bold tracking-tight mt-1 ${
              isCompletedTask ? 'text-slate-500 line-through' : 'text-slate-100 group-hover:text-white'
            }`}
          >
            {item.title}
          </h3>

          {(event?.location || event?.requires_deliverable || task?.requires_deliverable) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
              {event?.location && (
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="material-symbols-outlined text-sm text-rose-400">location_on</span>
                  {event.location}
                </span>
              )}
              {(event?.requires_deliverable || task?.requires_deliverable) && (
                <span className="flex items-center gap-1 text-amber-300">
                  <span className="material-symbols-outlined text-sm">attachment</span>
                  {event?.deliverable_description ?? task?.deliverable_description ?? 'Entregable requerido'}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-800/50 text-slate-400 transition-colors group-hover:bg-slate-800 group-hover:text-white shrink-0">
          <span className="material-symbols-outlined text-base">chevron_right</span>
        </div>
      </button>

      {task && !isCompletedTask && (
        <div className="flex flex-wrap items-center gap-2 px-3.5 pb-3.5 pt-1 border-t border-slate-800/50 mt-1">
          <button
            type="button"
            onClick={() => actions.onCompleteTask(task)}
            className={`${quickButton} border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 shadow-sm`}
          >
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>Completar</span>
          </button>
          {task.status !== 'pospuesta' && (
            <button
              type="button"
              onClick={() => actions.onPostponeTask(task)}
              className={`${quickButton} border-slate-700/80 bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-white`}
            >
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>Posponer</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
