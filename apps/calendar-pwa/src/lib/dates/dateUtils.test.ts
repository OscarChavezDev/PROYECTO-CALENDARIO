import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  dayKeyFromIso,
  isSameMonth,
  mondayOf,
  monthGrid,
  weekKeys,
} from './dateUtils'

describe('dayKeyFromIso (zona America/Bogota, UTC-5)', () => {
  it('usa el día local de Bogotá, no el UTC', () => {
    // 03:00 UTC del 16 = 22:00 del 15 en Bogotá
    expect(dayKeyFromIso('2026-06-16T03:00:00.000Z')).toBe('2026-06-15')
  })

  it('mantiene el día cuando coincide con UTC', () => {
    // 15:00 UTC del 15 = 10:00 del 15 en Bogotá
    expect(dayKeyFromIso('2026-06-15T15:00:00.000Z')).toBe('2026-06-15')
  })
})

describe('addDays', () => {
  it('suma y resta días cruzando fin de mes', () => {
    expect(addDays('2026-06-30', 1)).toBe('2026-07-01')
    expect(addDays('2026-07-01', -1)).toBe('2026-06-30')
  })

  it('cruza fin de año', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })
})

describe('addMonths', () => {
  it('suma meses ajustando el día al máximo del mes destino', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28')
    expect(addMonths('2026-06-15', 1)).toBe('2026-07-15')
    expect(addMonths('2026-01-15', -1)).toBe('2025-12-15')
  })
})

describe('mondayOf / weekKeys', () => {
  it('devuelve el mismo día si ya es lunes', () => {
    // 2026-06-15 es lunes
    expect(mondayOf('2026-06-15')).toBe('2026-06-15')
  })

  it('retrocede al lunes desde un domingo', () => {
    // 2026-06-14 es domingo
    expect(mondayOf('2026-06-14')).toBe('2026-06-08')
  })

  it('genera 7 días de lunes a domingo', () => {
    const week = weekKeys('2026-06-17')
    expect(week).toHaveLength(7)
    expect(week[0]).toBe('2026-06-15')
    expect(week[6]).toBe('2026-06-21')
  })
})

describe('monthGrid', () => {
  it('cubre todos los días del mes en semanas completas', () => {
    const weeks = monthGrid('2026-06-10')
    const allDays = weeks.flat()
    expect(allDays).toContain('2026-06-01')
    expect(allDays).toContain('2026-06-30')
    // cada semana tiene 7 días y empieza en lunes
    for (const week of weeks) {
      expect(week).toHaveLength(7)
      expect(mondayOf(week[0])).toBe(week[0])
    }
  })
})

describe('isSameMonth', () => {
  it('compara solo año y mes', () => {
    expect(isSameMonth('2026-06-01', '2026-06-30')).toBe(true)
    expect(isSameMonth('2026-05-31', '2026-06-01')).toBe(false)
  })
})
