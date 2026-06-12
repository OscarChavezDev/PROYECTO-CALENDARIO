import { useState, type FormEvent } from 'react'
import { PRIORITIES, PRIORITY_LABELS, type Priority } from '../../lib/domain/types'
import { isoToLocalInput } from '../../lib/dates/timezone'
import { validateTask } from './taskValidation'
import type { Task, TaskFormValues } from './types'

const inputClass =
  'rounded-md border border-slate-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none'
const labelClass = 'flex flex-col gap-1 text-sm font-medium text-slate-700'

interface TaskFormProps {
  initial?: Task | null
  onSubmit: (values: TaskFormValues) => Promise<void>
  onCancel?: () => void
}

export function TaskForm({ initial, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [dueAt, setDueAt] = useState(initial?.due_at ? isoToLocalInput(initial.due_at) : '')
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'media')
  const [requiresDeliverable, setRequiresDeliverable] = useState(
    initial?.requires_deliverable ?? false,
  )
  const [deliverableDescription, setDeliverableDescription] = useState(
    initial?.deliverable_description ?? '',
  )
  const [errors, setErrors] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const values: TaskFormValues = {
      title,
      description,
      dueAt,
      priority,
      requiresDeliverable,
      deliverableDescription,
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
        setDueAt('')
        setPriority('media')
        setRequiresDeliverable(false)
        setDeliverableDescription('')
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Error inesperado al guardar la tarea.'])
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
          Fecha límite (opcional)
          <input
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className={inputClass}
          />
        </label>
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
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={requiresDeliverable}
          onChange={(e) => setRequiresDeliverable(e.target.checked)}
          className="h-4 w-4"
        />
        Requiere entregable
      </label>

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
          {submitting ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear tarea'}
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
