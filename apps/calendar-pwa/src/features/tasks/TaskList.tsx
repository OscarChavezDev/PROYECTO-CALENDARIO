import { PriorityBadge, StatusBadge } from '../../components/Badges'
import { formatDateTime } from '../../lib/dates/timezone'
import { TASK_STATUS_LABELS, type Task } from './types'

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onComplete: (task: Task) => void
  onPostpone: (task: Task) => void
}

const actionButtonClass =
  'rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-100'

export function TaskList({ tasks, onEdit, onDelete, onComplete, onPostpone }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="text-sm text-slate-500">Todavía no tienes tareas.</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task) => (
        <li key={task.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`font-medium ${
                task.status === 'completada' ? 'text-slate-400 line-through' : 'text-slate-900'
              }`}
            >
              {task.title}
            </span>
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} label={TASK_STATUS_LABELS[task.status]} />
          </div>
          {task.due_at && (
            <p className="mt-1 text-sm text-slate-600">Vence: {formatDateTime(task.due_at)}</p>
          )}
          {task.description && <p className="mt-1 text-sm text-slate-500">{task.description}</p>}
          {task.requires_deliverable && (
            <p className="mt-1 text-sm text-amber-700">
              📎 Entregable: {task.deliverable_description ?? 'sin descripción'}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {task.status !== 'completada' && (
              <button
                onClick={() => onComplete(task)}
                className="rounded-md border border-green-300 px-3 py-1 text-sm font-medium text-green-700 transition hover:bg-green-50"
              >
                Completar
              </button>
            )}
            {task.status !== 'completada' && task.status !== 'pospuesta' && (
              <button onClick={() => onPostpone(task)} className={actionButtonClass}>
                Posponer
              </button>
            )}
            <button onClick={() => onEdit(task)} className={actionButtonClass}>
              Editar
            </button>
            <button
              onClick={() => onDelete(task)}
              className="rounded-md border border-red-200 px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Eliminar
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
