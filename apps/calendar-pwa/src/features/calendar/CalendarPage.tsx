import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSupabaseConfigured } from '../../lib/config/env'
import { getSupabaseClient } from '../../lib/supabase/client'
import { signOut } from '../auth/authService'
import { useAuth } from '../auth/useAuth'
import {
  createEvent,
  deleteEvent,
  listEvents,
  updateEvent,
} from '../events/eventService'
import type { CalendarEvent, EventFormValues } from '../events/types'
import {
  completeTask,
  createTask,
  deleteTask,
  listTasks,
  postponeTask,
  updateTask,
} from '../tasks/taskService'
import type { Task, TaskFormValues } from '../tasks/types'
import { CalendarShell } from './CalendarShell'

interface DefaultCalendar {
  id: string
  name: string
  color: string | null
  is_default: boolean
}

export function CalendarPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [calendar, setCalendar] = useState<DefaultCalendar | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadError, setLoadError] = useState<string | null>(
    isSupabaseConfigured ? null : 'Supabase no está configurado.',
  )
  const [actionError, setActionError] = useState<string | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return
    }

    let cancelled = false
    Promise.all([
      supabase
        .from('calendars')
        .select('id, name, color, is_default')
        .eq('is_default', true)
        .maybeSingle(),
      listEvents(),
      listTasks(),
    ])
      .then(([calendarResult, eventsData, tasksData]) => {
        if (cancelled) return
        if (calendarResult.error) {
          setLoadError(
            'No se pudo cargar el calendario. ¿Ya aplicaste la migración SQL en Supabase? ' +
              `(${calendarResult.error.message})`,
          )
        } else if (!calendarResult.data) {
          setLoadError(
            'No existe calendario default; revisar Sprint 1 (el trigger crea el calendario al registrar un usuario nuevo).',
          )
        } else {
          setCalendar(calendarResult.data)
          setEvents(eventsData)
          setTasks(tasksData)
        }
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setLoadError(err instanceof Error ? err.message : 'Error cargando datos.')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function reportError(err: unknown, fallback: string) {
    setActionError(err instanceof Error ? err.message : fallback)
  }

  function replaceTask(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      navigate('/login')
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mi calendario</h1>
          <p className="text-sm text-slate-500">
            {user?.email}
            {calendar && (
              <>
                {' · '}
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-full align-middle"
                  style={{ backgroundColor: calendar.color ?? '#2563eb' }}
                />{' '}
                {calendar.name}
              </>
            )}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
        >
          {signingOut ? 'Saliendo…' : 'Cerrar sesión'}
        </button>
      </div>

      {actionError && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Cargando calendario…</p>
      ) : calendar && user ? (
        <CalendarShell
          events={events}
          tasks={tasks}
          onCreateEvent={async (values: EventFormValues) => {
            const created = await createEvent(user.id, calendar.id, values)
            setEvents((prev) => [...prev, created])
          }}
          onUpdateEvent={async (id: string, values: EventFormValues) => {
            const updated = await updateEvent(id, values)
            setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
          }}
          onDeleteEvent={(event: CalendarEvent) => {
            if (!window.confirm(`¿Eliminar el evento "${event.title}"?`)) return
            deleteEvent(event.id)
              .then(() => setEvents((prev) => prev.filter((e) => e.id !== event.id)))
              .catch((err: unknown) => reportError(err, 'Error eliminando el evento.'))
          }}
          onCreateTask={async (values: TaskFormValues) => {
            const created = await createTask(user.id, calendar.id, values)
            setTasks((prev) => [...prev, created])
          }}
          onUpdateTask={async (id: string, values: TaskFormValues) => {
            replaceTask(await updateTask(id, values))
          }}
          onDeleteTask={(task: Task) => {
            if (!window.confirm(`¿Eliminar la tarea "${task.title}"?`)) return
            deleteTask(task.id)
              .then(() => setTasks((prev) => prev.filter((t) => t.id !== task.id)))
              .catch((err: unknown) => reportError(err, 'Error eliminando la tarea.'))
          }}
          onCompleteTask={(task: Task) => {
            completeTask(task.id)
              .then(replaceTask)
              .catch((err: unknown) => reportError(err, 'Error completando la tarea.'))
          }}
          onPostponeTask={(task: Task) => {
            postponeTask(task.id)
              .then(replaceTask)
              .catch((err: unknown) => reportError(err, 'Error posponiendo la tarea.'))
          }}
        />
      ) : (
        <p role="alert" className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          {loadError}
        </p>
      )}
    </section>
  )
}
