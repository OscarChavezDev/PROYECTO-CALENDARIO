import type { Priority, SyncStatus } from '../../lib/domain/types'

export const TASK_STATUSES = [
  'pendiente',
  'en_proceso',
  'completada',
  'pospuesta',
  'cancelada',
] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  completada: 'Completada',
  pospuesta: 'Pospuesta',
  cancelada: 'Cancelada',
}

/** Fila de la tabla tasks. */
export interface Task {
  id: string
  user_id: string
  calendar_id: string | null
  related_event_id: string | null
  title: string
  description: string | null
  due_at: string | null
  due_date: string | null
  priority: Priority
  status: TaskStatus
  requires_deliverable: boolean
  deliverable_description: string | null
  completed_at: string | null
  sync_status: SyncStatus
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/** Valores del formulario de tarea (fecha límite opcional en formato datetime-local). */
export interface TaskFormValues {
  title: string
  description: string
  dueAt: string
  priority: Priority
  requiresDeliverable: boolean
  deliverableDescription: string
}
