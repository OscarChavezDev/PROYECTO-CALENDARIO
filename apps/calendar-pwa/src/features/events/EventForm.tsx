import { useEffect, useState, type FormEvent } from 'react'
import { PRIORITIES, PRIORITY_LABELS, type Priority } from '../../lib/domain/types'
import { isoToLocalInput } from '../../lib/dates/timezone'
import { ReminderPicker } from '../notifications/ReminderPicker'
import { listReminderOffsets } from '../notifications/reminderService'
import { validateEvent } from './eventValidation'
import {
  EVENT_STATUSES,
  EVENT_STATUS_LABELS,
  type CalendarEvent,
  type EventFormValues,
  type EventStatus,
} from './types'

const inputClass =
  'rounded-md border border-slate-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none'
const labelClass = 'flex flex-col gap-1 text-sm font-medium text-slate-700'

interface EventFormProps {
  initial?: CalendarEvent | null
  onSubmit: (values: EventFormValues) => Promise<void>
  onCancel?: () => void
}

export function EventForm({ initial, onSubmit, onCancel }: EventFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [startsAt, setStartsAt] = useState(initial ? isoToLocalInput(initial.starts_at) : '')
  const [endsAt, setEndsAt] = useState(initial ? isoToLocalInput(initial.ends_at) : '')
  const [allDay, setAllDay] = useState(initial?.all_day ?? false)
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'media')
  const [status, setStatus] = useState<EventStatus>(initial?.status ?? 'programado')
  const [requiresDeliverable, setRequiresDeliverable] = useState(
    initial?.requires_deliverable ?? false,
  )
  const [deliverableDescription, setDeliverableDescription] = useState(
    initial?.deliverable_description ?? '',
  )
  const [location, setLocation] = useState(initial?.location ?? '')
  const [reminderOffsets, setReminderOffsets] = useState<number[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Al elegir el inicio, proponer el fin 1 minuto después (si el fin está vacío
  // o quedó antes/igual que el nuevo inicio). No pisa un fin posterior ya elegido.
  function handleStartChange(value: string) {
    setStartsAt(value)
    if (!value) return
    const start = new Date(value)
    if (Number.isNaN(start.getTime())) return
    const plusOne = isoToLocalInput(new Date(start.getTime() + 60_000).toISOString())
    setEndsAt((prev) => {
      if (!prev) return plusOne
      return new Date(prev).getTime() <= start.getTime() ? plusOne : prev
    })
  }

  // Al editar, precargar los tiempos de notificación ya guardados
  useEffect(() => {
    if (!initial) return
    let cancelled = false
    listReminderOffsets('event', initial.id)
      .then((offsets) => {
        if (!cancelled) setReminderOffsets(offsets)
      })
      .catch(() => {
        /* sin reminders o sin conexión: dejar vacío */
      })
    return () => {
      cancelled = true
    }
  }, [initial])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const values: EventFormValues = {
      title,
      description,
      startsAt,
      endsAt,
      allDay,
      priority,
      status,
      requiresDeliverable,
      deliverableDescription,
      location,
      reminderOffsets,
    }
    const validationErrors = validateEvent(values)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors([])
    setSubmitting(true)
    try {
      await onSubmit(values)
      if (!initial) {
        // tras crear, limpiar el formulario
        setTitle('')
        setDescription('')
        setStartsAt('')
        setEndsAt('')
        setAllDay(false)
        setPriority('media')
        setStatus('programado')
        setRequiresDeliverable(false)
        setDeliverableDescription('')
        setLocation('')
        setReminderOffsets([])
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Error inesperado al guardar el evento.'])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className={labelClass}>
        Título
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        Descripción (opcional)
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={inputClass}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Inicio
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => handleStartChange(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Fin
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Prioridad
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={inputClass}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Estado
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as EventStatus)}
            className={inputClass}
          >
            {EVENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {EVENT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={labelClass}>
        Lugar (opcional)
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className="h-4 w-4"
          />
          Todo el día
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={requiresDeliverable}
            onChange={(e) => setRequiresDeliverable(e.target.checked)}
            className="h-4 w-4"
          />
          Requiere entregable
        </label>
      </div>

      {requiresDeliverable && (
        <label className={labelClass}>
          Descripción del entregable
          <input
            type="text"
            value={deliverableDescription}
            onChange={(e) => setDeliverableDescription(e.target.value)}
            className={inputClass}
          />
        </label>
      )}

      <ReminderPicker value={reminderOffsets} onChange={setReminderOffsets} />

      {errors.length > 0 && (
        <ul role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear evento'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
