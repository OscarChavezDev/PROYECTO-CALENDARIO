import { localInputToIso } from '../../lib/dates/timezone'
import { requireClient } from '../../lib/supabase/requireClient'
import type { Task, TaskFormValues } from './types'

// Columnas explícitas (evita overfetching con select('*'))
const TASK_COLUMNS =
  'id, user_id, calendar_id, related_event_id, title, description, due_at, due_date, priority, status, requires_deliverable, deliverable_description, completed_at, external_provider, external_task_id, sync_status, created_at, updated_at, deleted_at'

function toPayload(values: TaskFormValues) {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    due_at: values.dueAt ? localInputToIso(values.dueAt) : null,
    priority: values.priority,
    requires_deliverable: values.requiresDeliverable,
    deliverable_description: values.requiresDeliverable
      ? values.deliverableDescription.trim() || null
      : null,
  }
}

/** Tarea local optimista para mostrar offline antes de sincronizar. */
export function buildLocalTask(userId: string, calendarId: string, values: TaskFormValues): Task {
  const now = new Date().toISOString()
  return {
    id: `local-${crypto.randomUUID()}`,
    user_id: userId,
    calendar_id: calendarId,
    related_event_id: null,
    ...toPayload(values),
    due_date: null,
    status: 'pendiente',
    completed_at: null,
    external_provider: null,
    external_task_id: null,
    sync_status: 'local',
    created_at: now,
    updated_at: now,
    deleted_at: null,
  }
}

/** Aplica valores del formulario a una tarea existente (edición offline). */
export function mergeTaskValues(task: Task, values: TaskFormValues): Task {
  return { ...task, ...toPayload(values), updated_at: new Date().toISOString() }
}

export async function listTasks(): Promise<Task[]> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from('tasks')
    .select(TASK_COLUMNS)
    .is('deleted_at', null)
    .order('due_at', { ascending: true, nullsFirst: false })
  if (error) throw new Error(`No se pudieron cargar las tareas: ${error.message}`)
  return (data ?? []) as unknown as Task[]
}

/** Una tarea por id (no borrada), o null si no existe. */
export async function getTask(id: string): Promise<Task | null> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from('tasks')
    .select(TASK_COLUMNS)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw new Error(`No se pudo cargar la tarea: ${error.message}`)
  return (data as unknown as Task) ?? null
}

/** Minutos que se pospone una tarea (snooze). */
export const POSTPONE_MINUTES = 10

export async function createTask(
  userId: string,
  calendarId: string,
  values: TaskFormValues,
): Promise<Task> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from('tasks')
    .insert({ user_id: userId, calendar_id: calendarId, ...toPayload(values) })
    .select(TASK_COLUMNS)
    .single()
  if (error) throw new Error(`No se pudo crear la tarea: ${error.message}`)
  return data as unknown as Task
}

export async function updateTask(id: string, values: TaskFormValues): Promise<Task> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from('tasks')
    .update(toPayload(values))
    .eq('id', id)
    .select(TASK_COLUMNS)
    .single()
  if (error) throw new Error(`No se pudo actualizar la tarea: ${error.message}`)
  return data as unknown as Task
}

export async function completeTask(id: string): Promise<Task> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'completada', completed_at: new Date().toISOString() })
    .eq('id', id)
    .select(TASK_COLUMNS)
    .single()
  if (error) throw new Error(`No se pudo completar la tarea: ${error.message}`)
  return data as unknown as Task
}

/**
 * Posponer = snooze: mueve la fecha límite 10 minutos hacia adelante.
 * Si la tarea ya estaba vencida, cuenta desde ahora; si aún no vencía, desde su due_at.
 * Devuelve la tarea con el nuevo due_at para poder re-crear su recordatorio.
 */
export async function postponeTask(id: string): Promise<Task> {
  const supabase = requireClient()
  const { data: current, error: readError } = await supabase
    .from('tasks')
    .select('due_at')
    .eq('id', id)
    .single()
  if (readError) throw new Error(`No se pudo posponer la tarea: ${readError.message}`)

  const now = Date.now()
  const currentDue = (current as { due_at: string | null }).due_at
  const base =
    currentDue && new Date(currentDue).getTime() > now ? new Date(currentDue).getTime() : now
  const newDueAt = new Date(base + POSTPONE_MINUTES * 60_000).toISOString()

  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'pospuesta', due_at: newDueAt, completed_at: null })
    .eq('id', id)
    .select(TASK_COLUMNS)
    .single()
  if (error) throw new Error(`No se pudo posponer la tarea: ${error.message}`)
  return data as unknown as Task
}

/** Soft delete: marca deleted_at en vez de borrar la fila. */
export async function deleteTask(id: string): Promise<void> {
  const supabase = requireClient()
  const { error } = await supabase
    .from('tasks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(`No se pudo eliminar la tarea: ${error.message}`)
}
