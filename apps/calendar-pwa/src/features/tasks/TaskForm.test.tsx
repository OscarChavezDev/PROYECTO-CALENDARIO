import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { TaskForm } from './TaskForm'

describe('TaskForm', () => {
  it('renderiza los campos mínimos', () => {
    render(<TaskForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fecha límite/i)).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: /prioridad/i })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /requiere entregable/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear tarea/i })).toBeInTheDocument()
  })

  it('requiere título y no llama onSubmit si falta', () => {
    const onSubmit = vi.fn()
    render(<TaskForm onSubmit={onSubmit} />)

    fireEvent.submit(screen.getByRole('button', { name: /crear tarea/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/el título es obligatorio/i)
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
