import { localInputToIso } from '../../lib/dates/timezone'
import { requireClient } from '../../lib/supabase/requireClient'
import type { Task, TaskFormValues } from './types'

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
    .select('*')
    .is('deleted_at', null)
    .order('due_at', { ascending: true, nullsFirst: false })
  if (error) throw new Error(`No se pudieron cargar las tareas: ${error.message}`)
  return (data ?? []) as Task[]
}

export async function createTask(
  userId: string,
  calendarId: string,
  values: TaskFormValues,
): Promise<Task> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from('tasks')
    .insert({ user_id: userId, calendar_id: calendarId, ...toPayload(values) })
    .select()
    .single()
  if (error) throw new Error(`No se pudo crear la tarea: ${error.message}`)
  return data as Task
}

export async function updateTask(id: string, values: TaskFormValues): Promise<Task> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from('tasks')
    .update(toPayload(values))
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`No se pudo actualizar la tarea: ${error.message}`)
  return data as Task
}

export async function completeTask(id: string): Promise<Task> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'completada', completed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`No se pudo completar la tarea: ${error.message}`)
  return data as Task
}

export async function postponeTask(id: string): Promise<Task> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'pospuesta', completed_at: null })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`No se pudo posponer la tarea: ${error.message}`)
  return data as Task
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
