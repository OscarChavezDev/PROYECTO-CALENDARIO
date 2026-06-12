import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { enqueueMutation, listQueue, removeMutation } from './offlineQueue'
import { processQueue, shouldApplyQueuedChange } from './syncQueue'

async function clearQueue() {
  for (const mutation of await listQueue()) {
    await removeMutation(mutation.id)
  }
}

beforeEach(clearQueue)

describe('shouldApplyQueuedChange (gana updated_at más reciente)', () => {
  it('aplica si el servidor no tiene la fila o no cambió después', () => {
    expect(shouldApplyQueuedChange(null, '2026-06-12T10:00:00.000Z')).toBe(true)
    expect(
      shouldApplyQueuedChange('2026-06-12T09:00:00.000Z', '2026-06-12T10:00:00.000Z'),
    ).toBe(true)
  })

  it('descarta si el servidor cambió después de encolar', () => {
    expect(
      shouldApplyQueuedChange('2026-06-12T11:00:00.000Z', '2026-06-12T10:00:00.000Z'),
    ).toBe(false)
  })
})

describe('processQueue', () => {
  function enqueueTwo() {
    return Promise.all([
      enqueueMutation({
        entity_type: 'event',
        operation: 'delete',
        entity_id: 'e-1',
        base_updated_at: null,
        payload: {},
      }),
      enqueueMutation({
        entity_type: 'task',
        operation: 'delete',
        entity_id: 't-1',
        base_updated_at: null,
        payload: {},
      }),
    ])
  }

  it('elimina mutaciones de la cola al tener éxito', async () => {
    await enqueueTwo()
    const execute = vi.fn().mockResolvedValue('aplicada' as const)

    const result = await processQueue(execute)

    expect(result).toEqual({ applied: 2, discarded: 0, failed: 0 })
    expect(execute).toHaveBeenCalledTimes(2)
    expect(await listQueue()).toHaveLength(0)
  })

  it('cuenta las descartadas por conflicto y las remueve', async () => {
    await enqueueTwo()
    const execute = vi.fn().mockResolvedValue('descartada' as const)

    const result = await processQueue(execute)

    expect(result).toEqual({ applied: 0, discarded: 2, failed: 0 })
    expect(await listQueue()).toHaveLength(0)
  })

  it('se detiene en el primer fallo y conserva la cola con attempts/last_error', async () => {
    await enqueueTwo()
    const execute = vi.fn().mockRejectedValue(new Error('red caída'))

    const result = await processQueue(execute)

    expect(result).toEqual({ applied: 0, discarded: 0, failed: 1 })
    expect(execute).toHaveBeenCalledTimes(1)

    const queue = await listQueue()
    expect(queue).toHaveLength(2)
    expect(queue[0].attempts).toBe(1)
    expect(queue[0].last_error).toBe('red caída')
    expect(queue[1].attempts).toBe(0)
  })
})
