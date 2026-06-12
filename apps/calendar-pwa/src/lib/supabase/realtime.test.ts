import { describe, expect, it } from 'vitest'
import { applyChange, removeById, upsertById } from './realtime'

interface FakeRow {
  id: string
  deleted_at: string | null
  title: string
}

const row = (id: string, title = `Fila ${id}`, deleted_at: string | null = null): FakeRow => ({
  id,
  title,
  deleted_at,
})

describe('upsertById', () => {
  it('agrega si no existe', () => {
    expect(upsertById([row('a')], row('b'))).toHaveLength(2)
  })

  it('evita duplicados: reemplaza si ya existe', () => {
    const result = upsertById([row('a', 'Original')], row('a', 'Actualizada'))
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Actualizada')
  })
})

describe('removeById', () => {
  it('remueve el ítem indicado y no falla si no existe', () => {
    expect(removeById([row('a'), row('b')], 'a').map((r) => r.id)).toEqual(['b'])
    expect(removeById([row('a')], 'zzz')).toHaveLength(1)
  })
})

describe('applyChange', () => {
  it('INSERT agrega sin duplicar (eco del insert propio)', () => {
    const items = [row('a')]
    const afterEcho = applyChange(items, 'INSERT', row('a'), null)
    expect(afterEcho).toHaveLength(1)
    const afterNew = applyChange(items, 'INSERT', row('b'), null)
    expect(afterNew).toHaveLength(2)
  })

  it('UPDATE reemplaza el ítem existente', () => {
    const result = applyChange([row('a', 'Vieja')], 'UPDATE', row('a', 'Nueva'), null)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Nueva')
  })

  it('UPDATE con deleted_at (soft delete) remueve el ítem', () => {
    const result = applyChange(
      [row('a'), row('b')],
      'UPDATE',
      row('a', 'Fila a', '2026-06-12T00:00:00.000Z'),
      null,
    )
    expect(result.map((r) => r.id)).toEqual(['b'])
  })

  it('DELETE físico remueve por oldId', () => {
    const result = applyChange([row('a'), row('b')], 'DELETE', null, 'b')
    expect(result.map((r) => r.id)).toEqual(['a'])
  })

  it('ignora cambios incompletos', () => {
    const items = [row('a')]
    expect(applyChange(items, 'UPDATE', null, null)).toEqual(items)
    expect(applyChange(items, 'DELETE', null, null)).toEqual(items)
  })
})
