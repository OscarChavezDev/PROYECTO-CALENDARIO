import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PriorityBadge, StatusBadge } from '../../components/Badges'
import { formatDateTime } from '../../lib/dates/timezone'
import { getEvent } from '../events/eventService'
import { EVENT_STATUS_LABELS, type CalendarEvent } from '../events/types'
import { getTask } from '../tasks/taskService'
import { TASK_STATUS_LABELS, type Task } from '../tasks/types'

/** Detalle de solo lectura de un evento o tarea (destino del clic en la notificación). */
export function ItemDetailPage({ kind }: { kind: 'evento' | 'tarea' }) {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<CalendarEvent | null>(null)
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    queueMicrotask(() => {
      setLoading(true)
      const load = kind === 'evento' ? getEvent(id) : getTask(id)
      load
        .then((data) => {
          if (cancelled) return
          if (kind === 'evento') setEvent(data as CalendarEvent | null)
          else setTask(data as Task | null)
          setLoading(false)
        })
        .catch((err: unknown) => {
          if (cancelled) return
          setError(err instanceof Error ? err.message : 'No se pudo cargar el detalle.')
          setLoading(false)
        })
    })
    return () => {
      cancelled = true
    }
  }, [kind, id])

  const item = event ?? task

  return (
    <section className="flex flex-col gap-4">
      <Link to="/app" className="text-sm font-medium text-indigo-600 hover:underline">
        <i className="fi fi-rr-angle-left mr-1 align-middle"></i>Volver al calendario
      </Link>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando…</p>
      ) : error ? (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : !item ? (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          Este {kind} ya no existe (pudo eliminarse).
        </p>
      ) : (
        <article className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                kind === 'evento' ? 'bg-violet-100 text-violet-800' : 'bg-teal-100 text-teal-800'
              }`}
            >
              {kind === 'evento' ? 'Evento' : 'Tarea'}
            </span>
            <PriorityBadge priority={item.priority} />
            {event && (
              <StatusBadge status={event.status} label={EVENT_STATUS_LABELS[event.status]} />
            )}
            {task && <StatusBadge status={task.status} label={TASK_STATUS_LABELS[task.status]} />}
          </div>

          <h1 className="text-xl font-bold text-slate-900">{item.title}</h1>

          {event && (
            <p className="text-sm text-slate-700">
              <i className="fi fi-rr-clock mr-1 align-middle text-slate-400"></i>
              {event.all_day
                ? 'Todo el día'
                : `${formatDateTime(event.starts_at)} → ${formatDateTime(event.ends_at)}`}
            </p>
          )}
          {task?.due_at && (
            <p className="text-sm text-slate-700">
              <i className="fi fi-rr-clock mr-1 align-middle text-slate-400"></i>
              Vence: {formatDateTime(task.due_at)}
            </p>
          )}

          {event?.location && (
            <p className="text-sm text-slate-700">
              <i className="fi fi-rr-marker mr-1 align-middle text-slate-400"></i>
              {event.location}
            </p>
          )}

          {item.description && (
            <p className="whitespace-pre-line text-sm text-slate-600">{item.description}</p>
          )}

          {item.requires_deliverable && (
            <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              <i className="fi fi-rr-clip mr-1 align-middle"></i>
              Entregable: {item.deliverable_description ?? 'sin descripción'}
            </p>
          )}

          <Link
            to="/app"
            className="mt-2 inline-block rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Abrir en el calendario
          </Link>
        </article>
      )}
    </section>
  )
}
