import { describe, expect, it } from 'vitest'
import { validateTask } from './taskValidation'
import type { TaskFormValues } from './types'

function validValues(overrides: Partial<TaskFormValues> = {}): TaskFormValues {
  return {
    title: 'Preparar informe',
    description: '',
    dueAt: '',
    priority: 'alta',
    requiresDeliverable: false,
    deliverableDescription: '',
    ...overrides,
  }
}

describe('validateTask', () => {
  it('acepta una tarea válida (fecha límite opcional)', () => {
    expect(validateTask(validValues())).toEqual([])
  })

  it('requiere título', () => {
    const errors = validateTask(validValues({ title: '  ' }))
    expect(errors).toContain('El título es obligatorio.')
  })

  it('exige descripción del entregable cuando se requiere', () => {
    const errors = validateTask(
      validValues({ requiresDeliverable: true, deliverableDescription: ' ' }),
    )
    expect(errors).toContain('Describe el entregable requerido.')
  })
})
