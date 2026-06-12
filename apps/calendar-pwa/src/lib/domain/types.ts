export const PRIORITIES = ['baja', 'media', 'alta', 'critica'] as const
export type Priority = (typeof PRIORITIES)[number]

export const PRIORITY_LABELS: Record<Priority, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
}

/** Peso para ordenar: crítica primero, baja al final. */
export const PRIORITY_WEIGHT: Record<Priority, number> = {
  critica: 0,
  alta: 1,
  media: 2,
  baja: 3,
}

export type SyncStatus = 'local' | 'synced' | 'conflict' | 'error'
