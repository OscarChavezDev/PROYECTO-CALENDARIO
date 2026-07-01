import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from './AuthProvider'
import { LoginPage } from './LoginPage'

// Tests deterministas: sin cliente Supabase real ni dependencia del .env.local
vi.mock('../../lib/supabase/client', () => ({
  getSupabaseClient: () => null,
}))

vi.mock('../../lib/config/env', () => ({
  isSupabaseConfigured: false,
  supabaseEnv: { url: null, anonKey: null },
}))

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('LoginPage', () => {
  it('renderiza campos de correo y contraseña', () => {
    renderLogin()

    expect(screen.getAllByLabelText(/correo/i).length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText(/^contraseña$/i).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /iniciar sesión|^entrar$/i }).length).toBeGreaterThan(0)
  })

  it('ofrece continuar con Google', () => {
    renderLogin()

    expect(screen.getAllByRole('button', { name: /continuar con google/i }).length).toBeGreaterThan(0)
  })

  it('permite cambiar a registro', () => {
    renderLogin()

    expect(screen.getAllByRole('button', { name: /regístrate ahora|crear cuenta/i }).length).toBeGreaterThan(0)
  })
})
