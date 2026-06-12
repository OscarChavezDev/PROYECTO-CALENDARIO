import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { todayKey } from '../../lib/dates/dateUtils'
import { buildEvent, buildTask } from '../../test/builders'
import type { CalendarItemActions } from './CalendarItemCard'
import { buildItems } from './calendarUtils'
import { TodayAgenda } from './TodayAgenda'

const actions: CalendarItemActions = {
  onEditEvent: vi.fn(),
  onDeleteEvent: vi.fn(),
  onEditTask: vi.fn(),
  onDeleteTask: vi.fn(),
  onCompleteTask: vi.fn(),
  onPostponeTask: vi.fn(),
}

describe('TodayAgenda', () => {
  it('muestra eventos y tareas pendientes de hoy', () => {
    const nowIso = new Date().toISOString()
    const events = [buildEvent({ title: 'Reunión de hoy', starts_at: nowIso, ends_at: nowIso })]
    const tasks = [buildTask({ title: 'Tarea de hoy', due_at: nowIso })]

    render(<TodayAgenda items={buildItems(events, tasks)} tasks={tasks} actions={actions} />)

    expect(screen.getByText('Reunión de hoy')).toBeInTheDocument()
    expect(screen.getByText('Tarea de hoy')).toBeInTheDocument()
  })

  it('muestra estado vacío cuando no hay pendientes', () => {
    render(<TodayAgenda items={[]} tasks={[]} actions={actions} />)

    expect(
      screen.getByText(/no tienes eventos ni tareas pendientes para hoy/i),
    ).toBeInTheDocument()
  })

  it('agrupa aparte las tareas abiertas sin fecha', () => {
    const tasks = [buildTask({ title: 'Tarea sin fecha' })]

    render(<TodayAgenda items={[]} tasks={tasks} actions={actions} />)

    expect(screen.getByText(/tareas sin fecha/i)).toBeInTheDocument()
    expect(screen.getByText('Tarea sin fecha')).toBeInTheDocument()
  })

  it('no muestra tareas completadas en pendientes de hoy', () => {
    const tasks = [
      buildTask({ title: 'Ya completada', status: 'completada', due_date: todayKey() }),
    ]

    render(<TodayAgenda items={buildItems([], tasks)} tasks={tasks} actions={actions} />)

    expect(screen.queryByText('Ya completada')).not.toBeInTheDocument()
    expect(
      screen.getByText(/no tienes eventos ni tareas pendientes para hoy/i),
    ).toBeInTheDocument()
  })
})
