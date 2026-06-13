import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { EventForm } from './EventForm'

describe('EventForm', () => {
  it('renderiza los campos mínimos', () => {
    render(<EventForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^inicio$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^fin$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/prioridad/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/estado/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/requiere entregable/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear evento/i })).toBeInTheDocument()
  })

  it('muestra errores de validación y no llama onSubmit', () => {
    const onSubmit = vi.fn()
    render(<EventForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Demo' } })
    fireEvent.change(screen.getByLabelText(/^inicio$/i), {
      target: { value: '2026-06-15T11:00' },
    })
    fireEvent.change(screen.getByLabelText(/^fin$/i), {
      target: { value: '2026-06-15T10:00' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /crear evento/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      /la fecha de fin debe ser posterior a la de inicio/i,
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
