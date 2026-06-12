import { useEffect, useState } from 'react'
import { EventForm } from './EventForm'
import { EventList } from './EventList'
import { createEvent, deleteEvent, listEvents, updateEvent } from './eventService'
import type { CalendarEvent, EventFormValues } from './types'

function sortByStart(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => a.starts_at.localeCompare(b.starts_at))
}

export function EventsSection({
  userId,
  calendarId,
}: {
  userId: string
  calendarId: string
}) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<CalendarEvent | null>(null)

  useEffect(() => {
    let cancelled = false
    listEvents()
      .then((data) => {
        if (!cancelled) {
          setEvents(data)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error cargando eventos.')
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleCreate(values: EventFormValues) {
    const created = await createEvent(userId, calendarId, values)
    setEvents((prev) => sortByStart([...prev, created]))
  }

  async function handleUpdate(values: EventFormValues) {
    if (!editing) return
    const updated = await updateEvent(editing.id, values)
    setEvents((prev) => sortByStart(prev.map((e) => (e.id === updated.id ? updated : e))))
    setEditing(null)
  }

  async function handleDelete(event: CalendarEvent) {
    if (!window.confirm(`¿Eliminar el evento "${event.title}"?`)) return
    try {
      await deleteEvent(event.id)
      setEvents((prev) => prev.filter((e) => e.id !== event.id))
      if (editing?.id === event.id) setEditing(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando el evento.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          {editing ? `Editar evento: ${editing.title}` : 'Crear evento'}
        </h2>
        <EventForm
          key={editing?.id ?? 'new'}
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={editing ? () => setEditing(null) : undefined}
        />
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Eventos</h2>
        {error && (
          <p role="alert" className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {loading ? (
          <p className="text-sm text-slate-500">Cargando eventos…</p>
        ) : (
          <EventList events={events} onEdit={setEditing} onDelete={handleDelete} />
        )}
      </section>
    </div>
  )
}
