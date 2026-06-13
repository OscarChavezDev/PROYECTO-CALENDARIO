import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SyncStatusBadge } from '../../components/SyncStatusBadge'
import { isSupabaseConfigured } from '../../lib/config/env'
import { useOnlineStatus } from '../../lib/network/useOnlineStatus'
import { STORES, getAll, getMeta, replaceAll, setMeta } from '../../lib/offline/db'
import {
  countQueue,
  enqueueMutation,
  findQueuedCreate,
  removeMutation,
  updateMutationPayload,
} from '../../lib/offline/offlineQueue'
import { processQueue } from '../../lib/offline/syncQueue'
import { getSupabaseClient } from '../../lib/supabase/client'
import { applyChange } from '../../lib/supabase/realtime'
import {
  createReminders,
  deleteReminders,
  replaceReminders,
} from '../notifications/reminderService'
import { signOut } from '../auth/authService'
import { useAuth } from '../auth/useAuth'
import {
  buildLocalEvent,
  createEvent,
  deleteEvent,
  listEvents,
  mergeEventValues,
  updateEvent,
} from '../events/eventService'
import type { CalendarEvent, EventFormValues } from '../events/types'
import {
  buildLocalTask,
  completeTask,
  createTask,
  deleteTask,
  listTasks,
  mergeTaskValues,
  postponeTask,
  updateTask,
} from '../tasks/taskService'
import type { Task, TaskFormValues } from '../tasks/types'
import { CalendarShell } from './CalendarShell'
import { useCalendarRealtime } from './useCalendarRealtime'

interface DefaultCalendar {
  id: string
  name: string
  color: string | null
  is_default: boolean
}

export function CalendarPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const online = useOnlineStatus()
  const [calendar, setCalendar] = useState<DefaultCalendar | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [usingCachedData, setUsingCachedData] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(
    isSupabaseConfigured ? null : 'Supabase no está configurado.',
  )
  const [actionError, setActionError] = useState<string | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [signingOut, setSigningOut] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  const refreshPendingCount = useCallback(() => {
    countQueue()
      .then(setPendingCount)
      .catch(() => setPendingCount(0))
  }, [])

  const loadData = useCallback(async () => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return
    }
    try {
      const [calendarResult, eventsData, tasksData] = await Promise.all([
        supabase
          .from('calendars')
          .select('id, name, color, is_default')
          .eq('is_default', true)
          .maybeSingle(),
        listEvents(),
        listTasks(),
      ])
      if (calendarResult.error) {
        throw new Error(calendarResult.error.message)
      }
      if (!calendarResult.data) {
        setLoadError(
          'No existe calendario default; revisar Sprint 1 (el trigger crea el calendario al registrar un usuario nuevo).',
        )
      } else {
        setCalendar(calendarResult.data)
        setEvents(eventsData)
        setTasks(tasksData)
        setLoadError(null)
        setUsingCachedData(false)
      }
    } catch (err) {
      // Sin red (u otro fallo): intentar datos guardados en IndexedDB
      try {
        const [cachedCalendar, cachedEvents, cachedTasks] = await Promise.all([
          getMeta<DefaultCalendar>('defaultCalendar'),
          getAll<CalendarEvent>(STORES.events),
          getAll<Task>(STORES.tasks),
        ])
        if (cachedCalendar) {
          setCalendar(cachedCalendar)
          setEvents(cachedEvents)
          setTasks(cachedTasks)
          setLoadError(null)
          setUsingCachedData(true)
          return
        }
      } catch {
        // sin cache disponible: cae al error original
      }
      setLoadError(err instanceof Error ? err.message : 'Error cargando datos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Diferido a microtask: la carga resuelve estado en callbacks async
    queueMicrotask(() => {
      void loadData()
      refreshPendingCount()
    })
  }, [loadData, refreshPendingCount])

  // Snapshot a IndexedDB para lectura offline (sin filas locales sin sincronizar)
  useEffect(() => {
    if (loading || usingCachedData) return
    void replaceAll(STORES.events, events.filter((e) => !e.id.startsWith('local-')))
    void replaceAll(STORES.tasks, tasks.filter((t) => !t.id.startsWith('local-')))
  }, [events, tasks, loading, usingCachedData])

  useEffect(() => {
    if (calendar) void setMeta('defaultCalendar', calendar)
  }, [calendar])

  // Al recuperar conexión (y al montar): drenar cola offline y reconciliar
  useEffect(() => {
    if (!online) return
    queueMicrotask(() => {
      void (async () => {
        const result = await processQueue()
        refreshPendingCount()
        if (result.applied + result.discarded > 0) {
          await loadData()
        }
      })()
    })
  }, [online, loadData, refreshPendingCount])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  const realtimeStatus = useCalendarRealtime({
    userId: user?.id ?? null,
    onEventChange: (type, newRow, oldId) =>
      setEvents((prev) => applyChange(prev, type, newRow, oldId)),
    onTaskChange: (type, newRow, oldId) =>
      setTasks((prev) => applyChange(prev, type, newRow, oldId)),
    onReconnect: () => {
      void refresh()
    },
  })

  function reportError(err: unknown, fallback: string) {
    setActionError(err instanceof Error ? err.message : fallback)
  }

  function replaceTaskInState(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  // Los recordatorios solo se gestionan con conexión (necesitan el id real del servidor).
  // Un fallo aquí no debe romper el guardado del evento/tarea.
  async function safeReminders(action: () => Promise<void>) {
    try {
      await action()
    } catch (err) {
      reportError(err, 'El evento se guardó, pero no se pudieron guardar los recordatorios.')
    }
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

  // ----- Eventos -----

  async function handleCreateEvent(values: EventFormValues) {
    if (!user || !calendar) return
    if (!online) {
      const local = buildLocalEvent(user.id, calendar.id, values)
      await enqueueMutation({
        entity_type: 'event',
        operation: 'create',
        entity_id: local.id,
        base_updated_at: null,
        payload: { userId: user.id, calendarId: calendar.id, values },
      })
      setEvents((prev) => [...prev, local])
      refreshPendingCount()
      return
    }
    const created = await createEvent(user.id, calendar.id, values)
    setEvents((prev) => [...prev, created])
    await safeReminders(() =>
      createReminders({
        entityId: created.id,
        entityType: 'event',
        userId: user.id,
        anchorAt: created.starts_at,
        offsets: values.reminderOffsets ?? [],
      }),
    )
  }

  async function handleUpdateEvent(id: string, values: EventFormValues) {
    if (!online) {
      if (id.startsWith('local-')) {
        const queued = await findQueuedCreate('event', id)
        if (queued) await updateMutationPayload(queued, { ...queued.payload, values })
      } else {
        const existing = events.find((e) => e.id === id)
        await enqueueMutation({
          entity_type: 'event',
          operation: 'update',
          entity_id: id,
          base_updated_at: existing?.updated_at ?? null,
          payload: { values },
        })
      }
      setEvents((prev) => prev.map((e) => (e.id === id ? mergeEventValues(e, values) : e)))
      refreshPendingCount()
      return
    }
    const updated = await updateEvent(id, values)
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
    if (user) {
      await safeReminders(() =>
        replaceReminders({
          entityId: updated.id,
          entityType: 'event',
          userId: user.id,
          anchorAt: updated.starts_at,
          offsets: values.reminderOffsets ?? [],
        }),
      )
    }
  }

  async function handleDeleteEvent(event: CalendarEvent) {
    if (!window.confirm(`¿Eliminar el evento "${event.title}"?`)) return
    try {
      if (!online) {
        if (event.id.startsWith('local-')) {
          const queued = await findQueuedCreate('event', event.id)
          if (queued) await removeMutation(queued.id)
        } else {
          await enqueueMutation({
            entity_type: 'event',
            operation: 'delete',
            entity_id: event.id,
            base_updated_at: event.updated_at,
            payload: {},
          })
        }
        refreshPendingCount()
      } else {
        await deleteEvent(event.id)
      }
      setEvents((prev) => prev.filter((e) => e.id !== event.id))
    } catch (err) {
      reportError(err, 'Error eliminando el evento.')
    }
  }

  // ----- Tareas -----

  async function handleCreateTask(values: TaskFormValues) {
    if (!user || !calendar) return
    if (!online) {
      const local = buildLocalTask(user.id, calendar.id, values)
      await enqueueMutation({
        entity_type: 'task',
        operation: 'create',
        entity_id: local.id,
        base_updated_at: null,
        payload: { userId: user.id, calendarId: calendar.id, values },
      })
      setTasks((prev) => [...prev, local])
      refreshPendingCount()
      return
    }
    const created = await createTask(user.id, calendar.id, values)
    setTasks((prev) => [...prev, created])
    if (created.due_at) {
      await safeReminders(() =>
        createReminders({
          entityId: created.id,
          entityType: 'task',
          userId: user.id,
          anchorAt: created.due_at!,
          offsets: values.reminderOffsets ?? [],
        }),
      )
    }
  }

  async function handleUpdateTask(id: string, values: TaskFormValues) {
    if (!online) {
      if (id.startsWith('local-')) {
        const queued = await findQueuedCreate('task', id)
        if (queued) await updateMutationPayload(queued, { ...queued.payload, values })
      } else {
        const existing = tasks.find((t) => t.id === id)
        await enqueueMutation({
          entity_type: 'task',
          operation: 'update',
          entity_id: id,
          base_updated_at: existing?.updated_at ?? null,
          payload: { values },
        })
      }
      setTasks((prev) => prev.map((t) => (t.id === id ? mergeTaskValues(t, values) : t)))
      refreshPendingCount()
      return
    }
    const updated = await updateTask(id, values)
    replaceTaskInState(updated)
    if (user) {
      await safeReminders(() =>
        updated.due_at
          ? replaceReminders({
              entityId: updated.id,
              entityType: 'task',
              userId: user.id,
              anchorAt: updated.due_at,
              offsets: values.reminderOffsets ?? [],
            })
          : deleteReminders('task', updated.id),
      )
    }
  }

  async function handleCompleteTask(task: Task) {
    try {
      if (!online) {
        if (task.id.startsWith('local-')) {
          setActionError('Esta tarea aún no está sincronizada; conéctate para completarla.')
          return
        }
        await enqueueMutation({
          entity_type: 'task',
          operation: 'complete',
          entity_id: task.id,
          base_updated_at: task.updated_at,
          payload: {},
        })
        const now = new Date().toISOString()
        replaceTaskInState({ ...task, status: 'completada', completed_at: now, updated_at: now })
        refreshPendingCount()
        return
      }
      replaceTaskInState(await completeTask(task.id))
    } catch (err) {
      reportError(err, 'Error completando la tarea.')
    }
  }

  async function handlePostponeTask(task: Task) {
    try {
      if (!online) {
        if (task.id.startsWith('local-')) {
          setActionError('Esta tarea aún no está sincronizada; conéctate para posponerla.')
          return
        }
        await enqueueMutation({
          entity_type: 'task',
          operation: 'postpone',
          entity_id: task.id,
          base_updated_at: task.updated_at,
          payload: {},
        })
        replaceTaskInState({
          ...task,
          status: 'pospuesta',
          completed_at: null,
          updated_at: new Date().toISOString(),
        })
        refreshPendingCount()
        return
      }
      replaceTaskInState(await postponeTask(task.id))
    } catch (err) {
      reportError(err, 'Error posponiendo la tarea.')
    }
  }

  async function handleDeleteTask(task: Task) {
    if (!window.confirm(`¿Eliminar la tarea "${task.title}"?`)) return
    try {
      if (!online) {
        if (task.id.startsWith('local-')) {
          const queued = await findQueuedCreate('task', task.id)
          if (queued) await removeMutation(queued.id)
        } else {
          await enqueueMutation({
            entity_type: 'task',
            operation: 'delete',
            entity_id: task.id,
            base_updated_at: task.updated_at,
            payload: {},
          })
        }
        refreshPendingCount()
      } else {
        await deleteTask(task.id)
      }
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
    } catch (err) {
      reportError(err, 'Error eliminando la tarea.')
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
        <div className="flex flex-wrap items-center gap-2">
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              {pendingCount} {pendingCount === 1 ? 'cambio' : 'cambios'} por sincronizar
            </span>
          )}
          <SyncStatusBadge
            status={realtimeStatus}
            refreshing={refreshing}
            onRefresh={() => {
              void refresh()
            }}
          />
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
          >
            {signingOut ? 'Saliendo…' : 'Cerrar sesión'}
          </button>
        </div>
      </div>

      {usingCachedData && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          Estás viendo datos guardados localmente (sin conexión con el servidor).
        </p>
      )}

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
          onCreateEvent={handleCreateEvent}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={(event) => {
            void handleDeleteEvent(event)
          }}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={(task) => {
            void handleDeleteTask(task)
          }}
          onCompleteTask={(task) => {
            void handleCompleteTask(task)
          }}
          onPostponeTask={(task) => {
            void handlePostponeTask(task)
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
