import { PriorityBadge, StatusBadge } from '../../components/Badges'
import { formatDate, formatDateTime } from '../../lib/dates/timezone'
import { EVENT_STATUS_LABELS, type CalendarEvent } from './types'

interface EventListProps {
  events: CalendarEvent[]
  onEdit: (event: CalendarEvent) => void
  onDelete: (event: CalendarEvent) => void
}

export function EventList({ events, onEdit, onDelete }: EventListProps) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-500">Todavía no tienes eventos.</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {events.map((event) => (
        <li
          key={event.id}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900">{event.title}</span>
            <PriorityBadge priority={event.priority} />
            <StatusBadge status={event.status} label={EVENT_STATUS_LABELS[event.status]} />
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {event.all_day
              ? `${formatDate(event.starts_at)} (todo el día)`
              : `${formatDateTime(event.starts_at)} → ${formatDateTime(event.ends_at)}`}
            {event.location && ` · ${event.location}`}
          </p>
          {event.description && (
            <p className="mt-1 text-sm text-slate-500">{event.description}</p>
          )}
          {event.requires_deliverable && (
            <p className="mt-1 text-sm text-amber-700">
              📎 Entregable: {event.deliverable_description ?? 'sin descripción'}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onEdit(event)}
              className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(event)}
              className="rounded-md border border-red-200 px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Eliminar
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
