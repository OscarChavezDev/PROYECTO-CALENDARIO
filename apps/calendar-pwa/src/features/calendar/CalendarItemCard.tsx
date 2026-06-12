import { PriorityBadge, StatusBadge } from '../../components/Badges'
import type { Priority } from '../../lib/domain/types'
import { EVENT_STATUS_LABELS, type CalendarEvent } from '../events/types'
import { TASK_STATUS_LABELS, type Task } from '../tasks/types'
import type { CalendarItem } from './calendarTypes'

export interface CalendarItemActions {
  onEditEvent: (event: CalendarEvent) => void
  onDeleteEvent: (event: CalendarEvent) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onCompleteTask: (task: Task) => void
  onPostponeTask: (task: Task) => void
}

/** Borde izquierdo por prioridad: crítica/alta deben destacar. */
const priorityBorder: Record<Priority, string> = {
  critica: 'border-l-4 border-l-red-500',
  alta: 'border-l-4 border-l-amber-500',
  media: 'border-l-4 border-l-indigo-300',
  baja: 'border-l-4 border-l-slate-200',
}

const kindStyles: Record<CalendarItem['kind'], string> = {
  evento: 'bg-violet-100 text-violet-800',
  tarea: 'bg-teal-100 text-teal-800',
}

const smallButton =
  'rounded px-2 py-0.5 text-xs font-medium border transition'

export function CalendarItemCard({
  item,
  actions,
}: {
  item: CalendarItem
  actions: CalendarItemActions
}) {
  const task = item.task
  const event = item.event
  const isCompletedTask = task?.status === 'completada'

  return (
    <div
      className={`rounded-md border border-slate-200 bg-white p-3 shadow-sm ${priorityBorder[item.priority]}`}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-sm font-semibold tabular-nums text-slate-600">
          {item.time ?? '—'}
        </span>
        <span
          className={`text-sm font-medium ${
            isCompletedTask ? 'text-slate-400 line-through' : 'text-slate-900'
          }`}
        >
          {item.title}
        </span>
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${kindStyles[item.kind]}`}
        >
          {item.kind === 'evento' ? 'Evento' : 'Tarea'}
        </span>
        <PriorityBadge priority={item.priority} />
        {event && (
          <StatusBadge status={event.status} label={EVENT_STATUS_LABELS[event.status]} />
        )}
        {task && <StatusBadge status={task.status} label={TASK_STATUS_LABELS[task.status]} />}
      </div>

      {(event?.location || event?.requires_deliverable || task?.requires_deliverable) && (
        <p className="mt-1 text-xs text-slate-500">
          {event?.location && <>📍 {event.location} </>}
          {(event?.requires_deliverable || task?.requires_deliverable) && (
            <>
              📎 {event?.deliverable_description ?? task?.deliverable_description ?? 'Entregable'}
            </>
          )}
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {task && !isCompletedTask && (
          <button
            onClick={() => actions.onCompleteTask(task)}
            className={`${smallButton} border-green-300 text-green-700 hover:bg-green-50`}
          >
            Completar
          </button>
        )}
        {task && !isCompletedTask && task.status !== 'pospuesta' && (
          <button
            onClick={() => actions.onPostponeTask(task)}
            className={`${smallButton} border-slate-300 text-slate-600 hover:bg-slate-100`}
          >
            Posponer
          </button>
        )}
        <button
          onClick={() => (event ? actions.onEditEvent(event) : actions.onEditTask(task!))}
          className={`${smallButton} border-slate-300 text-slate-600 hover:bg-slate-100`}
        >
          Editar
        </button>
        <button
          onClick={() => (event ? actions.onDeleteEvent(event) : actions.onDeleteTask(task!))}
          className={`${smallButton} border-red-200 text-red-600 hover:bg-red-50`}
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
