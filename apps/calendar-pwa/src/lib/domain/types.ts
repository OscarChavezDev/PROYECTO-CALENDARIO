export const PRIORITIES = ['baja', 'media', 'alta', 'critica'] as const
export type Priority = (typeof PRIORITIES)[number]

export const PRIORITY_LABELS: Record<Priority, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
}

export type SyncStatus = 'local' | 'synced' | 'conflict' | 'error'
