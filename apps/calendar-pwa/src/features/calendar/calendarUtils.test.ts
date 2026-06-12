import { describe, expect, it } from 'vitest'
import { buildEvent, buildTask } from '../../test/builders'
import {
  applyFilter,
  buildItems,
  itemsForDay,
  openTasksWithoutDate,
  pendingItemsForDay,
  sortItems,
  taskToItem,
} from './calendarUtils'

describe('itemsForDay', () => {
  it('filtra eventos por día local de Bogotá', () => {
    const events = [
      // 22:00 del 15 en Bogotá (03:00 UTC del 16)
      buildEvent({ id: 'late', starts_at: '2026-06-16T03:00:00.000Z', ends_at: '2026-06-16T04:00:00.000Z' }),
      // 10:00 del 16 en Bogotá
      buildEvent({ id: 'next-day', starts_at: '2026-06-16T15:00:00.000Z', ends_at: '2026-06-16T16:00:00.000Z' }),
    ]
    const items = buildItems(events, [])

    const day15 = itemsForDay(items, '2026-06-15')
    expect(day15.map((i) => i.id)).toEqual(['late'])

    const day16 = itemsForDay(items, '2026-06-16')
    expect(day16.map((i) => i.id)).toEqual(['next-day'])
  })

  it('incluye tareas con due_at y con due_date', () => {
    const tasks = [
      buildTask({ id: 't-hora', due_at: '2026-06-15T14:00:00.000Z' }), // 09:00 Bogotá
      buildTask({ id: 't-fecha', due_date: '2026-06-15' }),
    ]
    const items = buildItems([], tasks)
    const day = itemsForDay(items, '2026-06-15')
    expect(day.map((i) => i.id)).toEqual(['t-hora', 't-fecha'])
  })
})

describe('sortItems (hora ascendente, luego prioridad)', () => {
  it('ordena por hora y deja los sin hora al final', () => {
    const items = buildItems(
      [
        buildEvent({ id: 'tarde', starts_at: '2026-06-15T20:00:00.000Z', ends_at: '2026-06-15T21:00:00.000Z' }), // 15:00
        buildEvent({ id: 'manana', starts_at: '2026-06-15T13:00:00.000Z', ends_at: '2026-06-15T14:00:00.000Z' }), // 08:00
        buildEvent({ id: 'todo-dia', all_day: true, starts_at: '2026-06-15T13:00:00.000Z', ends_at: '2026-06-15T14:00:00.000Z' }),
      ],
      [],
    )
    expect(sortItems(items).map((i) => i.id)).toEqual(['manana', 'tarde', 'todo-dia'])
  })

  it('desempata por prioridad: crítica antes que baja', () => {
    const items = buildItems(
      [
        buildEvent({ id: 'baja', priority: 'baja', starts_at: '2026-06-15T15:00:00.000Z', ends_at: '2026-06-15T16:00:00.000Z' }),
        buildEvent({ id: 'critica', priority: 'critica', starts_at: '2026-06-15T15:00:00.000Z', ends_at: '2026-06-15T16:00:00.000Z' }),
      ],
      [],
    )
    expect(sortItems(items).map((i) => i.id)).toEqual(['critica', 'baja'])
  })
})

describe('applyFilter', () => {
  it('filtra por tipo', () => {
    const items = buildItems(
      [buildEvent({ id: 'e1' })],
      [buildTask({ id: 't1', due_date: '2026-06-15' })],
    )
    expect(applyFilter(items, 'eventos').map((i) => i.id)).toEqual(['e1'])
    expect(applyFilter(items, 'tareas').map((i) => i.id)).toEqual(['t1'])
    expect(applyFilter(items, 'todos')).toHaveLength(2)
  })
})

describe('pendingItemsForDay', () => {
  it('excluye tareas completadas/canceladas y eventos cancelados', () => {
    const items = buildItems(
      [
        buildEvent({ id: 'e-ok', starts_at: '2026-06-15T15:00:00.000Z', ends_at: '2026-06-15T16:00:00.000Z' }),
        buildEvent({ id: 'e-cancelado', status: 'cancelado', starts_at: '2026-06-15T15:00:00.000Z', ends_at: '2026-06-15T16:00:00.000Z' }),
      ],
      [
        buildTask({ id: 't-pendiente', due_date: '2026-06-15' }),
        buildTask({ id: 't-completada', status: 'completada', due_date: '2026-06-15' }),
        buildTask({ id: 't-pospuesta', status: 'pospuesta', due_date: '2026-06-15' }),
      ],
    )
    const pending = pendingItemsForDay(items, '2026-06-15')
    expect(pending.map((i) => i.id).sort()).toEqual(['e-ok', 't-pendiente', 't-pospuesta'])
  })
})

describe('taskToItem / openTasksWithoutDate', () => {
  it('devuelve null para tareas sin fecha', () => {
    expect(taskToItem(buildTask({ due_at: null, due_date: null }))).toBeNull()
  })

  it('lista tareas abiertas sin fecha y excluye completadas', () => {
    const tasks = [
      buildTask({ id: 'abierta' }),
      buildTask({ id: 'hecha', status: 'completada' }),
      buildTask({ id: 'con-fecha', due_date: '2026-06-15' }),
    ]
    expect(openTasksWithoutDate(tasks).map((t) => t.id)).toEqual(['abierta'])
  })
})
