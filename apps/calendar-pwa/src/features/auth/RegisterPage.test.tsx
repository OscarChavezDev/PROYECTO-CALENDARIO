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
  it('renderiza formulario con nombre, correo y contraseña', () => {
    renderRegister()

    expect(screen.getAllByLabelText(/nombre completo/i).length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText(/correo/i).length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText(/^contraseña$/i).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /crear cuenta|registrarse/i }).length).toBeGreaterThan(0)
  })

  it('muestra el medidor de seguridad al escribir la contraseña', () => {
    renderRegister()

    fireEvent.change(screen.getByPlaceholderText(/mínimo 6 caracteres/i), {
      target: { value: 'SuperSegura123!' },
    })

    expect(screen.getAllByText(/^seguridad$/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/fuerte/i).length).toBeGreaterThan(0)
  })
})
