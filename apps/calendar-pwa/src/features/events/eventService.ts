import { localInputToIso } from '../../lib/dates/timezone'
import { requireClient } from '../../lib/supabase/requireClient'
import type { CalendarEvent, EventFormValues } from './types'

function toPayload(values: EventFormValues) {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    starts_at: localInputToIso(values.startsAt),
    ends_at: localInputToIso(values.endsAt),
    all_day: values.allDay,
    priority: values.priority,
    status: values.status,
    requires_deliverable: values.requiresDeliverable,
    deliverable_description: values.requiresDeliverable
      ? values.deliverableDescription.trim() || null
      : null,
    location: values.location.trim() || null,
  }
}

export async function listEvents(): Promise<CalendarEvent[]> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .is('deleted_at', null)
    .order('starts_at', { ascending: true })
  if (error) throw new Error(`No se pudieron cargar los eventos: ${error.message}`)
  return (data ?? []) as CalendarEvent[]
}

export async function createEvent(
  userId: string,
  calendarId: string,
  values: EventFormValues,
): Promise<CalendarEvent> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from('events')
    .insert({ user_id: userId, calendar_id: calendarId, ...toPayload(values) })
    .select()
    .single()
  if (error) throw new Error(`No se pudo crear el evento: ${error.message}`)
  return data as CalendarEvent
}

export async function updateEvent(
  id: string,
  values: EventFormValues,
): Promise<CalendarEvent> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from('events')
    .update(toPayload(values))
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`No se pudo actualizar el evento: ${error.message}`)
  return data as CalendarEvent
}

/** Soft delete: marca deleted_at en vez de borrar la fila. */
export async function deleteEvent(id: string): Promise<void> {
  const supabase = requireClient()
  const { error } = await supabase
    .from('events')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(`No se pudo eliminar el evento: ${error.message}`)
}
