import { useCallback, useEffect, useState } from 'react'
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
  const [, _setRefreshing] = useState(false)
  const [, _setPendingCount] = useState(0)

  const refreshPendingCount = useCallback(() => {
    countQueue()
      .then(_setPendingCount)
      .catch(() => _setPendingCount(0))
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
    _setRefreshing(true)
    await loadData()
    _setRefreshing(false)
  }, [loadData])

  useCalendarRealtime({
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
    try {
      if (!online) {
        if (event.id.startsWith('local-')) {
          // Aún no existe en el servidor: basta con descartar el create encolado.
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
        setEvents((prev) => prev.filter((e) => e.id !== event.id))
        refreshPendingCount()
        return
      }
      await deleteEvent(event.id)
      setEvents((prev) => prev.filter((e) => e.id !== event.id))
      await safeReminders(() => deleteReminders('event', event.id))
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
          due_at: new Date(Date.now() + 10 * 60_000).toISOString(),
          completed_at: null,
          updated_at: new Date().toISOString(),
        })
        refreshPendingCount()
        return
      }
      const updated = await postponeTask(task.id)
      replaceTaskInState(updated)
      // Snooze: volver a recordar en la nueva hora (10 min después)
      if (user && updated.due_at) {
        await safeReminders(() =>
          createReminders({
            entityId: updated.id,
            entityType: 'task',
            userId: user.id,
            anchorAt: updated.due_at!,
            offsets: [0],
          }),
        )
      }
    } catch (err) {
      reportError(err, 'Error posponiendo la tarea.')
    }
  }

  async function handleDeleteTask(task: Task) {
    try {
      if (!online) {
        if (task.id.startsWith('local-')) {
          // Aún no existe en el servidor: basta con descartar el create encolado.
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
        setTasks((prev) => prev.filter((t) => t.id !== task.id))
        refreshPendingCount()
        return
      }
      await deleteTask(task.id)
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
      await safeReminders(() => deleteReminders('task', task.id))
    } catch (err) {
      reportError(err, 'Error eliminando la tarea.')
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col">

      {usingCachedData && (
        <p className="rounded-md bg-amber-500/10 p-3 text-sm text-amber-300">
          Estás viendo datos guardados localmente (sin conexión con el servidor).
        </p>
      )}

      {actionError && (
        <p role="alert" className="rounded-md bg-red-500/10 p-3 text-sm text-red-300">
          {actionError}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando calendario…</p>
      ) : calendar && user ? (
        <CalendarShell
          events={events}
          tasks={tasks}
          onCreateEvent={handleCreateEvent}
          onUpdateEvent={handleUpdateEvent}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onCompleteTask={(task) => {
            void handleCompleteTask(task)
          }}
          onPostponeTask={(task) => {
            void handlePostponeTask(task)
          }}
          onDeleteEvent={(event) => {
            void handleDeleteEvent(event)
          }}
          onDeleteTask={(task) => {
            void handleDeleteTask(task)
          }}
        />
      ) : (
        <p role="alert" className="rounded-md bg-amber-500/10 p-3 text-sm text-amber-300">
          {loadError}
        </p>
      )}
    </section>
  )
}
