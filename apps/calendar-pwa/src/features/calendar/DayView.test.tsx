import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { buildEvent } from '../../test/builders'
import type { CalendarItemActions } from './CalendarItemCard'
import { buildItems } from './calendarUtils'
import { DayView } from './DayView'

const actions: CalendarItemActions = {
  onEditEvent: vi.fn(),
  onDeleteEvent: vi.fn(),
  onEditTask: vi.fn(),
  onDeleteTask: vi.fn(),
  onCompleteTask: vi.fn(),
  onPostponeTask: vi.fn(),
}

describe('DayView', () => {
  it('muestra los eventos del día indicado', () => {
    const items = buildItems(
      [
        buildEvent({
          title: 'Evento del 15',
          starts_at: '2026-06-15T15:00:00.000Z',
          ends_at: '2026-06-15T16:00:00.000Z',
        }),
      ],
      [],
    )

    render(<DayView items={items} dayKey="2026-06-15" filter="todos" actions={actions} />)

    expect(screen.getByText('Evento del 15')).toBeInTheDocument()
  })

  it('muestra estado vacío legible', () => {
    render(<DayView items={[]} dayKey="2026-06-15" filter="todos" actions={actions} />)

    expect(screen.getByText(/no tienes eventos ni tareas para este día/i)).toBeInTheDocument()
  })

  it('respeta el filtro por tipo', () => {
    const items = buildItems(
      [
        buildEvent({
          title: 'Solo evento',
          starts_at: '2026-06-15T15:00:00.000Z',
          ends_at: '2026-06-15T16:00:00.000Z',
        }),
      ],
      [],
    )

    render(<DayView items={items} dayKey="2026-06-15" filter="tareas" actions={actions} />)

    expect(screen.queryByText('Solo evento')).not.toBeInTheDocument()
  })
})
