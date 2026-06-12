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
  it('renderiza formulario con email y contraseña', () => {
    renderLogin()

    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('tiene link hacia registro', () => {
    renderLogin()

    expect(screen.getByRole('link', { name: /regístrate/i })).toBeInTheDocument()
  })
})
