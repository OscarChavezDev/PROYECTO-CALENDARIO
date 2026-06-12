import type { CalendarEvent } from '../features/events/types'
import type { Task } from '../features/tasks/types'

let counter = 0

export function buildEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  counter += 1
  return {
    id: `event-${counter}`,
    user_id: 'user-1',
    calendar_id: 'cal-1',
    title: `Evento ${counter}`,
    description: null,
    starts_at: '2026-06-15T15:00:00.000Z',
    ends_at: '2026-06-15T16:00:00.000Z',
    all_day: false,
    priority: 'media',
    status: 'programado',
    requires_deliverable: false,
    deliverable_description: null,
    location: null,
    sync_status: 'local',
    created_at: '2026-06-01T00:00:00.000Z',
    updated_at: '2026-06-01T00:00:00.000Z',
    deleted_at: null,
    ...overrides,
  }
}

export function buildTask(overrides: Partial<Task> = {}): Task {
  counter += 1
  return {
    id: `task-${counter}`,
    user_id: 'user-1',
    calendar_id: 'cal-1',
    related_event_id: null,
    title: `Tarea ${counter}`,
    description: null,
    due_at: null,
    due_date: null,
    priority: 'media',
    status: 'pendiente',
    requires_deliverable: false,
    deliverable_description: null,
    completed_at: null,
    sync_status: 'local',
    created_at: '2026-06-01T00:00:00.000Z',
    updated_at: '2026-06-01T00:00:00.000Z',
    deleted_at: null,
    ...overrides,
  }
}
