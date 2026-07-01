import { dayKeyFromIso, minutesFromIso, timeFromIso } from '../../lib/dates/dateUtils'
import { PRIORITY_WEIGHT } from '../../lib/domain/types'
import type { CalendarEvent } from '../events/types'
import type { Task, TaskStatus } from '../tasks/types'
import type { CalendarItem, ItemFilter } from './calendarTypes'

const NO_TIME = Number.MAX_SAFE_INTEGER

/** Estados de tarea que cuentan como "pendiente" para la agenda de hoy. */
export const OPEN_TASK_STATUSES: TaskStatus[] = ['pendiente', 'en_proceso', 'pospuesta']

export function eventToItem(event: CalendarEvent): CalendarItem {
  const hasTime = !event.all_day
  const startMin = hasTime ? minutesFromIso(event.starts_at) : 540
  const endMin = hasTime ? minutesFromIso(event.ends_at) : 630
  const dur = Math.max(15, endMin - startMin)

  return {
    kind: 'evento',
    id: event.id,
    dayKey: dayKeyFromIso(event.starts_at),
    time: hasTime ? timeFromIso(event.starts_at) : null,
    endTime: hasTime ? timeFromIso(event.ends_at) : null,
    durationMin: dur > 0 ? dur : 60,
    location: event.location || null,
    notes: event.description,
    sortMinutes: hasTime ? startMin : NO_TIME,
    title: event.title,
    priority: event.priority,
    event,
  }
}

/** Convierte una tarea en ítem de calendario; null si no tiene fecha. */
export function taskToItem(task: Task): CalendarItem | null {
  if (task.due_at) {
    return {
      kind: 'tarea',
      id: task.id,
      dayKey: dayKeyFromIso(task.due_at),
      time: timeFromIso(task.due_at),
      endTime: null,
      durationMin: 30,
      location: null,
      notes: task.description,
      sortMinutes: minutesFromIso(task.due_at),
      title: task.title,
      priority: task.priority,
      task,
    }
  }
  if (task.due_date) {
    return {
      kind: 'tarea',
      id: task.id,
      dayKey: task.due_date,
      time: null,
      endTime: null,
      durationMin: 30,
      location: null,
      notes: task.description,
      sortMinutes: NO_TIME,
      title: task.title,
      priority: task.priority,
      task,
    }
  }
  return null
}

/** Construye los ítems de calendario a partir de eventos y tareas. */
export function buildItems(events: CalendarEvent[], tasks: Task[]): CalendarItem[] {
  const items: CalendarItem[] = events.map(eventToItem)
  for (const task of tasks) {
    const item = taskToItem(task)
    if (item) items.push(item)
  }
  return items
}

/** Orden principal: hora ascendente (sin hora al final); empate por prioridad y título. */
export function sortItems(items: CalendarItem[]): CalendarItem[] {
  return [...items].sort(
    (a, b) =>
      a.sortMinutes - b.sortMinutes ||
      PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] ||
      a.title.localeCompare(b.title),
  )
}

export function applyFilter(items: CalendarItem[], filter: ItemFilter): CalendarItem[] {
  if (filter === 'eventos') return items.filter((i) => i.kind === 'evento')
  if (filter === 'tareas') return items.filter((i) => i.kind === 'tarea')
  return items
}

/** Ítems de un día concreto, filtrados y ordenados. */
export function itemsForDay(
  items: CalendarItem[],
  dayKey: string,
  filter: ItemFilter = 'todos',
): CalendarItem[] {
  return sortItems(applyFilter(items.filter((i) => i.dayKey === dayKey), filter))
}

/**
 * Pendientes de hoy: eventos del día (no cancelados) más tareas del día
 * en estado pendiente/en_proceso/pospuesta.
 */
export function pendingItemsForDay(items: CalendarItem[], dayKey: string): CalendarItem[] {
  return sortItems(
    items.filter((item) => {
      if (item.dayKey !== dayKey) return false
      if (item.kind === 'evento') return item.event?.status !== 'cancelado'
      return OPEN_TASK_STATUSES.includes(item.task!.status)
    }),
  )
}

/** Tareas abiertas sin fecha (no aparecen en las vistas por día). */
export function openTasksWithoutDate(tasks: Task[]): Task[] {
  return tasks.filter(
    (t) => !t.due_at && !t.due_date && OPEN_TASK_STATUSES.includes(t.status),
  )
}
