import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { buildEvent } from '../../test/builders'
import { buildItems } from './calendarUtils'
import { TimeGrid } from './TimeGrid'

describe('TimeGrid', () => {
  it('muestra los eventos con hora del día en la grilla', () => {
    const items = buildItems(
      [
        buildEvent({
          title: 'Reunión grilla',
          starts_at: '2026-06-15T15:00:00.000Z',
          ends_at: '2026-06-15T16:00:00.000Z',
        }),
      ],
      [],
    )

    render(
      <TimeGrid
        items={items}
        days={['2026-06-15']}
        filter="todos"
        onItemClick={vi.fn()}
        onSelectDay={vi.fn()}
      />,
    )

    expect(screen.getByText('Reunión grilla')).toBeInTheDocument()
  })

  it('coloca los eventos todo el día en la franja superior', () => {
    const items = buildItems(
      [
        buildEvent({
          title: 'Feriado',
          all_day: true,
          starts_at: '2026-06-15T05:00:00.000Z',
          ends_at: '2026-06-15T06:00:00.000Z',
        }),
      ],
      [],
    )

    render(
      <TimeGrid
        items={items}
        days={['2026-06-15']}
        filter="todos"
        onItemClick={vi.fn()}
        onSelectDay={vi.fn()}
      />,
    )

    expect(screen.getByText('todo el día')).toBeInTheDocument()
    expect(screen.getByText('Feriado')).toBeInTheDocument()
  })

  it('llama onItemClick al tocar un bloque', async () => {
    const onItemClick = vi.fn()
    const items = buildItems(
      [
        buildEvent({
          title: 'Click me',
          starts_at: '2026-06-15T15:00:00.000Z',
          ends_at: '2026-06-15T16:00:00.000Z',
        }),
      ],
      [],
    )

    render(
      <TimeGrid
        items={items}
        days={['2026-06-15']}
        filter="todos"
        onItemClick={onItemClick}
        onSelectDay={vi.fn()}
      />,
    )

    screen.getByText('Click me').closest('button')!.click()
    expect(onItemClick).toHaveBeenCalledOnce()
  })

  it('respeta el filtro por tipo', () => {
    const items = buildItems(
      [
        buildEvent({
          title: 'Solo evento grid',
          starts_at: '2026-06-15T15:00:00.000Z',
          ends_at: '2026-06-15T16:00:00.000Z',
        }),
      ],
      [],
    )

    render(
      <TimeGrid
        items={items}
        days={['2026-06-15']}
        filter="tareas"
        onItemClick={vi.fn()}
        onSelectDay={vi.fn()}
      />,
    )

    expect(screen.queryByText('Solo evento grid')).not.toBeInTheDocument()
  })
})
