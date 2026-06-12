import { describe, expect, it } from 'vitest'
import { validateEvent } from './eventValidation'
import type { EventFormValues } from './types'

function validValues(overrides: Partial<EventFormValues> = {}): EventFormValues {
  return {
    title: 'Reunión de proyecto',
    description: '',
    startsAt: '2026-06-15T10:00',
    endsAt: '2026-06-15T11:00',
    allDay: false,
    priority: 'media',
    status: 'programado',
    requiresDeliverable: false,
    deliverableDescription: '',
    location: '',
    ...overrides,
  }
}

describe('validateEvent', () => {
  it('acepta un evento válido', () => {
    expect(validateEvent(validValues())).toEqual([])
  })

  it('rechaza fecha de fin anterior a la de inicio', () => {
    const errors = validateEvent(
      validValues({ startsAt: '2026-06-15T11:00', endsAt: '2026-06-15T10:00' }),
    )
    expect(errors).toContain('La fecha de fin debe ser posterior a la de inicio.')
  })

  it('rechaza fecha de fin igual a la de inicio', () => {
    const errors = validateEvent(
      validValues({ startsAt: '2026-06-15T10:00', endsAt: '2026-06-15T10:00' }),
    )
    expect(errors).toContain('La fecha de fin debe ser posterior a la de inicio.')
  })

  it('requiere título', () => {
    const errors = validateEvent(validValues({ title: '   ' }))
    expect(errors).toContain('El título es obligatorio.')
  })

  it('requiere fechas', () => {
    const errors = validateEvent(validValues({ startsAt: '', endsAt: '' }))
    expect(errors).toContain('La fecha de inicio es obligatoria.')
    expect(errors).toContain('La fecha de fin es obligatoria.')
  })

  it('exige descripción del entregable cuando se requiere', () => {
    const errors = validateEvent(
      validValues({ requiresDeliverable: true, deliverableDescription: '' }),
    )
    expect(errors).toContain('Describe el entregable requerido.')
  })
})
