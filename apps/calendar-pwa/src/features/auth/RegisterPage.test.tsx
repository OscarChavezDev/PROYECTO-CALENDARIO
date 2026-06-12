import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from './AuthProvider'
import { RegisterPage } from './RegisterPage'

vi.mock('../../lib/supabase/client', () => ({
  getSupabaseClient: () => null,
}))

vi.mock('../../lib/config/env', () => ({
  isSupabaseConfigured: false,
  supabaseEnv: { url: null, anonKey: null },
}))

function renderRegister() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('RegisterPage', () => {
  it('renderiza formulario con email, contraseña y confirmación', () => {
    renderRegister()

    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()
  })

  it('muestra error si las contraseñas no coinciden', () => {
    renderRegister()

    fireEvent.change(screen.getByLabelText(/correo/i), {
      target: { value: 'oscar@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { value: 'secreta123' },
    })
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: 'otra-distinta' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/las contraseñas no coinciden/i)
  })
})
