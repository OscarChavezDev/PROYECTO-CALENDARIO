import { useEffect, useState, type FormEvent } from 'react'
import { OptionPills } from '../../components/OptionPills'
import { TimePicker } from '../../components/TimePicker'
import { PRIORITY_PILLS } from '../../components/pills'
import { type Priority } from '../../lib/domain/types'
import { addDays, todayKey } from '../../lib/dates/dateUtils'
import { isoToLocalInput } from '../../lib/dates/timezone'
import { ReminderPicker } from '../notifications/ReminderPicker'
import { listReminderOffsets } from '../notifications/reminderService'
import { validateTask } from './taskValidation'
import type { Task, TaskFormValues } from './types'

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-all hover:bg-white/[0.05] focus:border-teal-400/50 focus:ring-2 focus:ring-teal-500/30'
const labelClass = 'flex flex-col gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400/80'
const quickChip =
  'press rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold normal-case tracking-normal text-slate-300 transition-colors hover:border-teal-400/40 hover:text-white'

// Autofoco solo con puntero fino: en táctil el teclado taparía el bottom sheet.
const canAutoFocus = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: fine)').matches

interface TaskFormProps {
  initial?: Task | null
  /** Día por defecto (YYYY-MM-DD) al crear, según la vista activa. */
  defaultDate?: string
  /** Hora por defecto ("HH:mm") al crear desde un hueco de la grilla. */
  defaultTime?: string
  onSubmit: (values: TaskFormValues) => Promise<void>
  onCancel?: () => void
}

export function TaskForm({ initial, defaultDate, defaultTime, onSubmit, onCancel }: TaskFormProps) {
  const initialLocalDue = initial?.due_at ? isoToLocalInput(initial.due_at) : ''

  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [dueDate, setDueDate] = useState(
    initial ? initialLocalDue.slice(0, 10) : (defaultDate ?? ''),
  )
  const [dueTime, setDueTime] = useState(
    initial ? initialLocalDue.slice(11, 16) : (defaultTime ?? ''),
  )
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'media')
  const [requiresDeliverable, setRequiresDeliverable] = useState(initial?.requires_deliverable ?? false)
  const [deliverableDescription, setDeliverableDescription] = useState(
    initial?.deliverable_description ?? '',
  )
  const [reminderOffsets, setReminderOffsets] = useState<number[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!initial) return
    let cancelled = false
    listReminderOffsets('task', initial.id)
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
    const dueAt = dueDate ? `${dueDate}T${dueTime || '09:00'}` : ''
    const values: TaskFormValues = {
      title,
      description,
      dueAt,
      priority,
      requiresDeliverable,
      deliverableDescription,
      reminderOffsets,
    }
    const validationErrors = validateTask(values)
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
        setDueDate('')
        setDueTime('')
        setPriority('media')
        setRequiresDeliverable(false)
        setDeliverableDescription('')
        setReminderOffsets([])
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Error inesperado al guardar la tarea.'])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className={labelClass}>
        <span>Título de la Tarea</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿Qué necesitas completar?"
          className={inputClass}
          autoFocus={canAutoFocus()}
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400/80">
              Fecha límite (opcional)
            </span>
            <div className="flex gap-1">
              <button type="button" onClick={() => setDueDate(todayKey())} className={quickChip}>
                Hoy
              </button>
              <button type="button" onClick={() => setDueDate(addDays(todayKey(), 1))} className={quickChip}>
                Mañana
              </button>
            </div>
          </div>
          <input
            type="date"
            aria-label="Fecha límite"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className={labelClass}>
          <span>Hora (opcional)</span>
          <TimePicker ariaLabel="Hora" value={dueTime} onChange={setDueTime} disabled={!dueDate} />
        </div>
      </div>

      <OptionPills label="Prioridad" value={priority} options={PRIORITY_PILLS} onChange={setPriority} />

      <label className={labelClass}>
        <span>Notas o Descripción</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Pasos a seguir, checklist o contexto adicional…"
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
          <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${requiresDeliverable ? 'bg-teal-500' : 'bg-white/15'}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${requiresDeliverable ? 'left-[1.375rem]' : 'left-0.5'}`} />
          </span>
        </button>

        {requiresDeliverable && (
          <input
            type="text"
            value={deliverableDescription}
            onChange={(e) => setDeliverableDescription(e.target.value)}
            placeholder="Describe el entregable (ej. Repositorio de GitHub, Captura de pantalla…)"
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
          className="glow-button flex flex-[1.5] items-center justify-center gap-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 hover:from-teal-400 hover:to-emerald-500 active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? (
            'Guardando…'
          ) : (
            <>
              {initial ? 'Guardar cambios' : 'Crear tarea'}
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
