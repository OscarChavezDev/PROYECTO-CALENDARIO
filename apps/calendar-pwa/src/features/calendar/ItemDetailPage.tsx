import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PriorityBadge, StatusBadge } from '../../components/Badges'
import { formatDateTime } from '../../lib/dates/timezone'
import { deleteEvent, getEvent } from '../events/eventService'
import { EVENT_STATUS_LABELS, type CalendarEvent } from '../events/types'
import { deleteTask, getTask } from '../tasks/taskService'
import { TASK_STATUS_LABELS, type Task } from '../tasks/types'

/** Detalle de solo lectura de un evento o tarea, con acciones Editar / Eliminar. */
export function ItemDetailPage({ kind }: { kind: 'evento' | 'tarea' }) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<CalendarEvent | null>(null)
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  async function handleDelete() {
    if (!id || !item) return
    if (!window.confirm(`¿Eliminar este ${kind} "${item.title}"? Esta acción no se puede deshacer.`))
      return
    setDeleting(true)
    try {
      if (kind === 'evento') await deleteEvent(id)
      else await deleteTask(id)
      navigate('/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : `No se pudo eliminar el ${kind}.`)
      setDeleting(false)
    }
  }

  const isEvent = kind === 'evento'

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <Link
        to="/app"
        className="press inline-flex w-fit items-center gap-1 text-sm font-medium text-blue-400 hover:underline"
      >
        <i className="fi fi-rr-angle-left align-middle"></i>Volver al calendario
      </Link>

      {loading ? (
        <div className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-3 h-5 w-24 rounded bg-slate-700" />
          <div className="mb-2 h-7 w-2/3 rounded bg-slate-700" />
          <div className="h-4 w-1/2 rounded bg-slate-800" />
        </div>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      ) : !item ? (
        <p className="rounded-xl bg-amber-500/10 p-3 text-sm text-amber-300">
          Este {kind} ya no existe (pudo eliminarse).
        </p>
      ) : (
        <article className="animate-rise-in overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-black/30 ring-1 ring-white/5 backdrop-blur-sm">
          <div
            className={`h-1.5 w-full bg-gradient-to-r ${
              isEvent ? 'from-blue-500 to-sky-500' : 'from-teal-500 to-emerald-500'
            }`}
          />
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isEvent ? 'bg-sky-500/15 text-sky-300' : 'bg-teal-500/15 text-teal-300'
                }`}
              >
                <i className={`fi ${isEvent ? 'fi-rr-calendar' : 'fi-rr-checkbox'} align-middle`}></i>
                {isEvent ? 'Evento' : 'Tarea'}
              </span>
              <PriorityBadge priority={item.priority} />
              {event && <StatusBadge status={event.status} label={EVENT_STATUS_LABELS[event.status]} />}
              {task && <StatusBadge status={task.status} label={TASK_STATUS_LABELS[task.status]} />}
            </div>

            <h1 className="text-xl font-bold text-slate-100">{item.title}</h1>

            <div className="flex flex-col gap-2.5 text-sm text-slate-300">
              {event && (
                <p className="flex items-center gap-2">
                  <i className="fi fi-rr-clock w-4 text-center text-slate-500"></i>
                  {event.all_day
                    ? 'Todo el día'
                    : `${formatDateTime(event.starts_at)} → ${formatDateTime(event.ends_at)}`}
                </p>
              )}
              {task?.due_at && (
                <p className="flex items-center gap-2">
                  <i className="fi fi-rr-clock w-4 text-center text-slate-500"></i>
                  Vence: {formatDateTime(task.due_at)}
                </p>
              )}
              {event?.location && (
                <p className="flex items-center gap-2">
                  <i className="fi fi-rr-marker w-4 text-center text-slate-500"></i>
                  {event.location}
                </p>
              )}
              {item.description && (
                <p className="flex items-start gap-2 whitespace-pre-line text-slate-400">
                  <i className="fi fi-rr-align-left mt-0.5 w-4 text-center text-slate-500"></i>
                  {item.description}
                </p>
              )}
            </div>

            {item.requires_deliverable && (
              <p className="flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-300">
                <i className="fi fi-rr-clip mt-0.5"></i>
                Entregable: {item.deliverable_description ?? 'sin descripción'}
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                to={`/app?edit=${kind}&id=${item.id}`}
                className="press inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <i className="fi fi-rr-pencil align-middle"></i>Editar
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="press inline-flex items-center gap-1.5 rounded-full border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
              >
                <i className="fi fi-rr-trash align-middle"></i>
                {deleting ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </article>
      )}
    </section>
  )
}
