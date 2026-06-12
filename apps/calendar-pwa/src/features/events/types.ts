import type { Priority, SyncStatus } from '../../lib/domain/types'

export const EVENT_STATUSES = ['programado', 'completado', 'cancelado', 'pospuesto'] as const
export type EventStatus = (typeof EVENT_STATUSES)[number]

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  programado: 'Programado',
  completado: 'Completado',
  cancelado: 'Cancelado',
  pospuesto: 'Pospuesto',
}

/** Fila de la tabla events (se llama CalendarEvent para no chocar con el Event del DOM). */
export interface CalendarEvent {
  id: string
  user_id: string
  calendar_id: string
  title: string
  description: string | null
  starts_at: string
  ends_at: string
  all_day: boolean
  priority: Priority
  status: EventStatus
  requires_deliverable: boolean
  deliverable_description: string | null
  location: string | null
  sync_status: SyncStatus
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/** Valores del formulario de evento (fechas en formato datetime-local). */
export interface EventFormValues {
  title: string
  description: string
  startsAt: string
  endsAt: string
  allDay: boolean
  priority: Priority
  status: EventStatus
  requiresDeliverable: boolean
  deliverableDescription: string
  location: string
}
