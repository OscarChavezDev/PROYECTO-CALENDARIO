import { PRIORITIES } from '../../lib/domain/types'
import { EVENT_STATUSES, type EventFormValues } from './types'

export function validateEvent(values: EventFormValues): string[] {
  const errors: string[] = []

  if (!values.title.trim()) {
    errors.push('El título es obligatorio.')
  }
  if (!values.startsAt) {
    errors.push('La fecha de inicio es obligatoria.')
  }
  if (!values.endsAt) {
    errors.push('La fecha de fin es obligatoria.')
  }
  if (
    values.startsAt &&
    values.endsAt &&
    new Date(values.endsAt).getTime() <= new Date(values.startsAt).getTime()
  ) {
    errors.push('La fecha de fin debe ser posterior a la de inicio.')
  }
  if (!PRIORITIES.includes(values.priority)) {
    errors.push('La prioridad no es válida.')
  }
  if (!EVENT_STATUSES.includes(values.status)) {
    errors.push('El estado no es válido.')
  }
  if (values.requiresDeliverable && !values.deliverableDescription.trim()) {
    errors.push('Describe el entregable requerido.')
  }

  return errors
}
