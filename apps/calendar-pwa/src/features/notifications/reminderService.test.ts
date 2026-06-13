import { describe, expect, it } from 'vitest'
import { offsetsFromReminders, remindAtFor } from './reminderService'

describe('remindAtFor', () => {
  it('resta el offset en minutos al anchor', () => {
    // 10:00 − 15 min = 09:45
    expect(remindAtFor('2026-06-15T10:00:00.000Z', 15)).toBe('2026-06-15T09:45:00.000Z')
  })

  it('con offset 0 devuelve el mismo instante (al inicio exacto)', () => {
    expect(remindAtFor('2026-06-15T10:00:00.000Z', 0)).toBe('2026-06-15T10:00:00.000Z')
  })

  it('1 hora antes (60 min) cruza la hora', () => {
    expect(remindAtFor('2026-06-15T10:30:00.000Z', 60)).toBe('2026-06-15T09:30:00.000Z')
  })
})

describe('offsetsFromReminders', () => {
  it('reconstruye los offsets a partir del anchor y los remind_at', () => {
    const anchor = '2026-06-15T10:00:00.000Z'
    const remindAts = [
      '2026-06-15T10:00:00.000Z', // 0
      '2026-06-15T09:30:00.000Z', // 30
      '2026-06-15T09:00:00.000Z', // 60
    ]
    expect(offsetsFromReminders(anchor, remindAts)).toEqual([0, 30, 60])
  })

  it('descarta diferencias que no son offsets válidos', () => {
    const anchor = '2026-06-15T10:00:00.000Z'
    // 45 min no está en la lista de offsets permitidos
    expect(offsetsFromReminders(anchor, ['2026-06-15T09:15:00.000Z'])).toEqual([])
  })

  it('devuelve [] sin reminders', () => {
    expect(offsetsFromReminders('2026-06-15T10:00:00.000Z', [])).toEqual([])
  })
})
