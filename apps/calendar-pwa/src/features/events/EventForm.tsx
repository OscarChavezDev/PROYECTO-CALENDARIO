import { useEffect, useState, type FormEvent } from 'react'
import { OptionPills } from '../../components/OptionPills'
import { TimePicker } from '../../components/TimePicker'
import { PRIORITY_PILLS } from '../../components/pills'
import { type Priority } from '../../lib/domain/types'
import { addDays, todayKey } from '../../lib/dates/dateUtils'
import { isoToLocalInput } from '../../lib/dates/timezone'
import { ReminderPicker } from '../notifications/ReminderPicker'
import { listReminderOffsets } from '../notifications/reminderService'
import { validateEvent } from './eventValidation'
import { type CalendarEvent, type EventFormValues, type EventStatus } from './types'

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-all hover:bg-white/[0.05] focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/30'
const labelClass = 'flex flex-col gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400/80'
const quickChip =
  'press rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold normal-case tracking-normal text-slate-300 transition-colors hover:border-blue-400/40 hover:text-white'

interface EventFormProps {
  initial?: CalendarEvent | null
  /** Día por defecto (YYYY-MM-DD) al crear, según la vista activa. */
  defaultDate?: string
  /** Hora por defecto ("HH:mm") al crear desde un hueco de la grilla. */
  defaultTime?: string
  onSubmit: (values: EventFormValues) => Promise<void>
  onCancel?: () => void
}

/** Suma `minutes` a una hora "HH:mm"; recorta a 23:59 si se pasa del día. */
function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = Math.min(h * 60 + m + minutes, 23 * 60 + 59)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function EventForm({ initial, defaultDate, defaultTime, onSubmit, onCancel }: EventFormProps) {
  const initialLocalStart = initial ? isoToLocalInput(initial.starts_at) : ''
  const initialLocalEnd = initial ? isoToLocalInput(initial.ends_at) : ''

  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [date, setDate] = useState(initial ? initialLocalStart.slice(0, 10) : (defaultDate ?? ''))
  const [startTime, setStartTime] = useState(
    initial ? initialLocalStart.slice(11, 16) : (defaultTime ?? ''),
  )
  const [endTime, setEndTime] = useState(
    initial
      ? initialLocalEnd.slice(11, 16)
      : defaultTime
        ? addMinutesToTime(defaultTime, 60)
        : '',
  )
  const [allDay, setAllDay] = useState(initial?.all_day ?? false)
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'media')
  const [status, setStatus] = useState<EventStatus>(initial?.status ?? 'programado')
  const [requiresDeliverable, setRequiresDeliverable] = useState(initial?.requires_deliverable ?? false)
  const [deliverableDescription, setDeliverableDescription] = useState(
    initial?.deliverable_description ?? '',
  )
  const [location, setLocation] = useState(initial?.location ?? '')
  const [reminderOffsets, setReminderOffsets] = useState<number[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Al elegir la hora de inicio, proponer fin +1h si está vacío o quedó antes.
  function handleStartTimeChange(value: string) {
    setStartTime(value)
    if (!value) return
    setEndTime((prev) => (!prev || prev <= value ? addMinutesToTime(value, 60) : prev))
  }

  useEffect(() => {
    if (!initial) return
    let cancelled = false
    listReminderOffsets('event', initial.id)
      .then((offsets) => {
        if (!cancelled) setReminderOffsets(offsets)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [initial])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const startsAt = date && (allDay || startTime) ? `${date}T${allDay ? '00:00' : startTime}` : ''
    const endsAt = date && (allDay || endTime) ? `${date}T${allDay ? '23:59' : endTime}` : ''
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
        setTitle('')
        setDescription('')
        setStartTime('')
        setEndTime('')
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className={labelClass}>
        <span>Título del Evento</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿Qué tienes planeado?"
          className={inputClass}
          autoFocus
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400/80">Fecha</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => setDate(todayKey())} className={quickChip}>
                Hoy
              </button>
              <button type="button" onClick={() => setDate(addDays(todayKey(), 1))} className={quickChip}>
                Mañana
              </button>
            </div>
          </div>
          <input
            type="date"
            aria-label="Fecha"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            role="switch"
            aria-checked={allDay}
            onClick={() => setAllDay(!allDay)}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06]"
          >
            <span>Todo el día</span>
            <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${allDay ? 'bg-blue-600' : 'bg-white/15'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${allDay ? 'left-[1.375rem]' : 'left-0.5'}`} />
            </span>
          </button>
        </div>
      </div>

      {!allDay && (
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-3">
            <div className={labelClass}>
              <span>Hora inicio</span>
              <TimePicker ariaLabel="Hora inicio" value={startTime} onChange={handleStartTimeChange} />
            </div>
            <div className={labelClass}>
              <span>Hora fin</span>
              <TimePicker ariaLabel="Hora fin" value={endTime} onChange={setEndTime} />
            </div>
          </div>
          {/* Duración rápida: fija el fin relativo al inicio */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Duración</span>
            {[30, 60, 90, 120].map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => {
                  const s = startTime || '09:00'
                  setStartTime(s)
                  setEndTime(addMinutesToTime(s, min))
                }}
                className={quickChip}
              >
                {min === 30 ? '30 min' : min === 60 ? '1 h' : min === 90 ? '1.5 h' : '2 h'}
              </button>
            ))}
          </div>
        </div>
      )}

      <OptionPills label="Prioridad" value={priority} options={PRIORITY_PILLS} onChange={setPriority} />

      <label className={labelClass}>
        <span>Ubicación o Enlace (opcional)</span>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Sala de juntas, Zoom, Google Meet…"
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        <span>Notas o Descripción</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Añade detalles, orden del día o recordatorios…"
          className={`${inputClass} resize-none`}
        />
      </label>

      <div className="flex flex-col gap-2.5 rounded-xl border border-white/[0.07] bg-black/20 p-3">
        <button
          type="button"
          role="switch"
          aria-checked={requiresDeliverable}
          onClick={() => setRequiresDeliverable(!requiresDeliverable)}
          className="flex items-center justify-between gap-3 text-left text-sm font-medium text-slate-200"
        >
          <span>Requiere entregable (adjuntar archivo)</span>
          <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${requiresDeliverable ? 'bg-blue-600' : 'bg-white/15'}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${requiresDeliverable ? 'left-[1.375rem]' : 'left-0.5'}`} />
          </span>
        </button>

        {requiresDeliverable && (
          <input
            type="text"
            value={deliverableDescription}
            onChange={(e) => setDeliverableDescription(e.target.value)}
            placeholder="Describe el entregable (ej. Acta firmada, Presentación en PDF…)"
            className={inputClass}
          />
        )}
      </div>

      <ReminderPicker value={reminderOffsets} onChange={setReminderOffsets} />

      {errors.length > 0 && (
        <ul role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-300 space-y-1">
          {errors.map((error) => (
            <li key={error} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-1 flex gap-3 border-t border-white/10 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-wide text-slate-300 transition-all duration-200 hover:bg-white/5 hover:text-white active:scale-[0.98]"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="glow-button flex flex-[1.5] items-center justify-center gap-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 hover:from-blue-400 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? (
            'Guardando…'
          ) : (
            <>
              {initial ? 'Guardar cambios' : 'Crear evento'}
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
