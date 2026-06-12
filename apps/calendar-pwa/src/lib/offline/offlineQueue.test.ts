import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  countQueue,
  enqueueMutation,
  findQueuedCreate,
  listQueue,
  markMutationFailed,
  removeMutation,
  updateMutationPayload,
} from './offlineQueue'

async function clearQueue() {
  for (const mutation of await listQueue()) {
    await removeMutation(mutation.id)
  }
}

beforeEach(clearQueue)

describe('offlineQueue', () => {
  it('agrega mutaciones y las lista en orden', async () => {
    await enqueueMutation({
      entity_type: 'event',
      operation: 'create',
      entity_id: 'local-1',
      base_updated_at: null,
      payload: { values: { title: 'Primero' } },
    })
    await enqueueMutation({
      entity_type: 'task',
      operation: 'delete',
      entity_id: 'task-9',
      base_updated_at: '2026-06-12T10:00:00.000Z',
      payload: {},
    })

    const queue = await listQueue()
    expect(queue).toHaveLength(2)
    expect(queue[0].entity_id).toBe('local-1')
    expect(queue[0].attempts).toBe(0)
    expect(queue[0].last_error).toBeNull()
    expect(await countQueue()).toBe(2)
  })

  it('elimina la mutación (flujo de éxito)', async () => {
    const queued = await enqueueMutation({
      entity_type: 'event',
      operation: 'delete',
      entity_id: 'event-1',
      base_updated_at: null,
      payload: {},
    })
    await removeMutation(queued.id)
    expect(await countQueue()).toBe(0)
  })

  it('marca fallo con attempts y last_error', async () => {
    const queued = await enqueueMutation({
      entity_type: 'task',
      operation: 'update',
      entity_id: 'task-1',
      base_updated_at: null,
      payload: { values: { title: 'X' } },
    })
    await markMutationFailed(queued, 'sin conexión')

    const [failed] = await listQueue()
    expect(failed.attempts).toBe(1)
    expect(failed.last_error).toBe('sin conexión')
  })

  it('encuentra el create encolado de una entidad local y fusiona payload', async () => {
    await enqueueMutation({
      entity_type: 'task',
      operation: 'create',
      entity_id: 'local-abc',
      base_updated_at: null,
      payload: { values: { title: 'Original' } },
    })

    const queued = await findQueuedCreate('task', 'local-abc')
    expect(queued).not.toBeNull()

    await updateMutationPayload(queued!, { values: { title: 'Editada offline' } })
    const updated = await findQueuedCreate('task', 'local-abc')
    expect((updated!.payload as { values: { title: string } }).values.title).toBe(
      'Editada offline',
    )
  })
})
