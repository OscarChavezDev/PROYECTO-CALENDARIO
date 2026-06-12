/**
 * Helpers puros para aplicar cambios de Supabase Realtime al estado local
 * sin duplicados. Las filas con soft delete (deleted_at) se remueven de la UI.
 */

export type ChangeType = 'INSERT' | 'UPDATE' | 'DELETE'

interface Row {
  id: string
  deleted_at: string | null
}

/** Reemplaza el ítem si ya existe (por id) o lo agrega al final. */
export function upsertById<T extends Row>(items: T[], incoming: T): T[] {
  const exists = items.some((item) => item.id === incoming.id)
  return exists
    ? items.map((item) => (item.id === incoming.id ? incoming : item))
    : [...items, incoming]
}

/** Remueve el ítem con el id dado (no falla si no existe). */
export function removeById<T extends Row>(items: T[], id: string): T[] {
  return items.filter((item) => item.id !== id)
}

/**
 * Aplica un cambio de Realtime al estado local:
 * - DELETE físico → remover por oldId.
 * - INSERT/UPDATE con deleted_at → remover (soft delete).
 * - INSERT/UPDATE normal → upsert (evita duplicados con los inserts propios).
 */
export function applyChange<T extends Row>(
  items: T[],
  type: ChangeType,
  newRow: T | null,
  oldId: string | null,
): T[] {
  if (type === 'DELETE') {
    return oldId ? removeById(items, oldId) : items
  }
  if (!newRow) return items
  if (newRow.deleted_at !== null) {
    return removeById(items, newRow.id)
  }
  return upsertById(items, newRow)
}
