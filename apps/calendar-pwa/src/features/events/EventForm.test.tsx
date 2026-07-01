import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { EventForm } from './EventForm'

describe('EventForm', () => {
  it('renderiza los campos mínimos', () => {
    render(<EventForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^fecha$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hora inicio/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hora fin/i)).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: /prioridad/i })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /requiere entregable/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear evento/i })).toBeInTheDocument()
  })

  it('prellena la fecha con defaultDate al crear', () => {
    render(<EventForm defaultDate="2026-06-25" onSubmit={vi.fn()} />)
    expect(screen.getByLabelText(/^fecha$/i)).toHaveValue('2026-06-25')
  })

  it('muestra error si la hora de fin no es posterior a la de inicio', () => {
    const onSubmit = vi.fn()
    render(<EventForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Demo' } })
    fireEvent.change(screen.getByLabelText(/^fecha$/i), { target: { value: '2026-06-15' } })
    fireEvent.change(screen.getByLabelText(/hora inicio/i), { target: { value: '11:00' } })
    fireEvent.change(screen.getByLabelText(/hora fin/i), { target: { value: '10:00' } })
    fireEvent.submit(screen.getByRole('button', { name: /crear evento/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      /la fecha de fin debe ser posterior a la de inicio/i,
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
