import { PRIORITIES } from '../../lib/domain/types'
import type { TaskFormValues } from './types'

export function validateTask(values: TaskFormValues): string[] {
  const errors: string[] = []

  if (!values.title.trim()) {
    errors.push('El título es obligatorio.')
  }
  if (!PRIORITIES.includes(values.priority)) {
    errors.push('La prioridad no es válida.')
  }
  if (values.requiresDeliverable && !values.deliverableDescription.trim()) {
    errors.push('Describe el entregable requerido.')
  }

  return errors
}
