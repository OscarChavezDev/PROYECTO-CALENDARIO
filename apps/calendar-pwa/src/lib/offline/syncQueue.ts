import {
  createEvent,
  deleteEvent,
  updateEvent,
} from '../../features/events/eventService'
import type { EventFormValues } from '../../features/events/types'
import {
  completeTask,
  createTask,
  deleteTask,
  postponeTask,
  updateTask,
} from '../../features/tasks/taskService'
import type { TaskFormValues } from '../../features/tasks/types'
import { requireClient } from '../supabase/requireClient'
import {
  listQueue,
  markMutationFailed,
  removeMutation,
  type QueuedMutation,
} from './offlineQueue'

export type ExecutionResult = 'aplicada' | 'descartada'

/**
 * Regla simple de conflicto: gana el updated_at más reciente.
 * Si el servidor cambió la fila DESPUÉS de encolarse la mutación offline,
 * la versión del servidor es más nueva y la mutación se descarta.
 */
export function shouldApplyQueuedChange(
  serverUpdatedAt: string | null,
  queuedAt: string,
): boolean {
  if (!serverUpdatedAt) return true
  return new Date(serverUpdatedAt).getTime() <= new Date(queuedAt).getTime()
}

async function fetchServerUpdatedAt(
  table: 'events' | 'tasks',
  id: string,
): Promise<string | null> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from(table)
    .select('updated_at')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as { updated_at: string } | null)?.updated_at ?? null
}

interface CreatePayload {
  userId: string
  calendarId: string
  values: Record<string, unknown>
}

export async function executeMutation(m: QueuedMutation): Promise<ExecutionResult> {
  if (m.entity_type === 'event') {
    switch (m.operation) {
      case 'create': {
        const { userId, calendarId, values } = m.payload as unknown as CreatePayload
        await createEvent(userId, calendarId, values as unknown as EventFormValues)
        return 'aplicada'
      }
      case 'update': {
        if (!shouldApplyQueuedChange(await fetchServerUpdatedAt('events', m.entity_id), m.queued_at)) {
          return 'descartada'
        }
        await updateEvent(m.entity_id, (m.payload as { values: EventFormValues }).values)
        return 'aplicada'
      }
      case 'delete':
        await deleteEvent(m.entity_id)
        return 'aplicada'
      default:
        throw new Error(`Operación no soportada para eventos: ${m.operation}`)
    }
  }

  switch (m.operation) {
    case 'create': {
      const { userId, calendarId, values } = m.payload as unknown as CreatePayload
      await createTask(userId, calendarId, values as unknown as TaskFormValues)
      return 'aplicada'
    }
    case 'update': {
      if (!shouldApplyQueuedChange(await fetchServerUpdatedAt('tasks', m.entity_id), m.queued_at)) {
        return 'descartada'
      }
      await updateTask(m.entity_id, (m.payload as { values: TaskFormValues }).values)
      return 'aplicada'
    }
    case 'complete': {
      if (!shouldApplyQueuedChange(await fetchServerUpdatedAt('tasks', m.entity_id), m.queued_at)) {
        return 'descartada'
      }
      await completeTask(m.entity_id)
      return 'aplicada'
    }
    case 'postpone': {
      if (!shouldApplyQueuedChange(await fetchServerUpdatedAt('tasks', m.entity_id), m.queued_at)) {
        return 'descartada'
      }
      await postponeTask(m.entity_id)
      return 'aplicada'
    }
    case 'delete':
      await deleteTask(m.entity_id)
      return 'aplicada'
  }
}

export interface SyncResult {
  applied: number
  discarded: number
  failed: number
}

/**
 * Procesa la cola en orden. Al primer fallo se detiene (conserva el orden
 * causal); la mutación fallida guarda attempts y last_error para reintentos.
 */
export async function processQueue(
  execute: (m: QueuedMutation) => Promise<ExecutionResult> = executeMutation,
): Promise<SyncResult> {
  const result: SyncResult = { applied: 0, discarded: 0, failed: 0 }
  for (const mutation of await listQueue()) {
    try {
      const outcome = await execute(mutation)
      await removeMutation(mutation.id)
      if (outcome === 'aplicada') result.applied += 1
      else result.discarded += 1
    } catch (err) {
      await markMutationFailed(mutation, err instanceof Error ? err.message : String(err))
      result.failed += 1
      break
    }
  }
  return result
}
