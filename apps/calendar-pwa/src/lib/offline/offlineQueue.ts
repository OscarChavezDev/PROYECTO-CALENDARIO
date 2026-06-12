import { STORES, deleteRow, getAll, putRow } from './db'

export type QueueEntityType = 'event' | 'task'
export type QueueOperation = 'create' | 'update' | 'delete' | 'complete' | 'postpone'

export interface QueuedMutation {
  id: string
  entity_type: QueueEntityType
  operation: QueueOperation
  /** Para create: { userId, calendarId, values }. Para update: { values }. Resto: {}. */
  payload: Record<string, unknown>
  /** Id del registro afectado (para create, el id local temporal). */
  entity_id: string
  /** updated_at que tenía la fila al encolar (para la regla de conflicto). */
  base_updated_at: string | null
  queued_at: string
  attempts: number
  last_error: string | null
}

export interface NewMutation {
  entity_type: QueueEntityType
  operation: QueueOperation
  payload: Record<string, unknown>
  entity_id: string
  base_updated_at: string | null
}

export async function enqueueMutation(mutation: NewMutation): Promise<QueuedMutation> {
  const queued: QueuedMutation = {
    ...mutation,
    id: `mut-${Date.now()}-${crypto.randomUUID()}`,
    queued_at: new Date().toISOString(),
    attempts: 0,
    last_error: null,
  }
  await putRow(STORES.queue, queued)
  return queued
}

/** Cola en orden de encolado (los ids llevan timestamp como prefijo ordenable). */
export async function listQueue(): Promise<QueuedMutation[]> {
  const all = await getAll<QueuedMutation>(STORES.queue)
  return all.sort((a, b) => a.queued_at.localeCompare(b.queued_at) || a.id.localeCompare(b.id))
}

export async function removeMutation(id: string): Promise<void> {
  await deleteRow(STORES.queue, id)
}

export async function markMutationFailed(mutation: QueuedMutation, error: string): Promise<void> {
  await putRow(STORES.queue, {
    ...mutation,
    attempts: mutation.attempts + 1,
    last_error: error,
  })
}

export async function countQueue(): Promise<number> {
  return (await getAll<QueuedMutation>(STORES.queue)).length
}

/** Busca el create encolado de una entidad local (id `local-…`) para fusionar ediciones. */
export async function findQueuedCreate(
  entityType: QueueEntityType,
  entityId: string,
): Promise<QueuedMutation | null> {
  const queue = await listQueue()
  return (
    queue.find(
      (m) => m.operation === 'create' && m.entity_type === entityType && m.entity_id === entityId,
    ) ?? null
  )
}

export async function updateMutationPayload(
  mutation: QueuedMutation,
  payload: Record<string, unknown>,
): Promise<void> {
  await putRow(STORES.queue, { ...mutation, payload })
}
