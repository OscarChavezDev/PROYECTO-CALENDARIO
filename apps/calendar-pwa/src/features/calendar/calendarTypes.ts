import type { Priority } from '../../lib/domain/types'
import type { CalendarEvent } from '../events/types'
import type { Task } from '../tasks/types'

export type ItemKind = 'evento' | 'tarea'

export type ItemFilter = 'todos' | 'eventos' | 'tareas'

/** Representación unificada de eventos y tareas para las vistas de calendario. */
export interface CalendarItem {
  kind: ItemKind
  id: string
  /** Day key (YYYY-MM-DD) en la zona del producto. */
  dayKey: string
  /** "HH:mm" en la zona del producto, o null si no tiene hora (todo el día / solo fecha). */
  time: string | null
  endTime?: string | null
  durationMin?: number
  location?: string | null
  notes?: string | null
  attendeesCount?: number
  /** Minutos desde medianoche para ordenar; los sin hora van al final. */
  sortMinutes: number
  title: string
  priority: Priority
  event?: CalendarEvent
  task?: Task
}

export type CalendarViewId = 'hoy' | 'dia' | 'semana' | 'mes'
