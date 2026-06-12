import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthProvider'
import { ProtectedRoute } from './ProtectedRoute'

vi.mock('../../lib/supabase/client', () => ({
  getSupabaseClient: () => null,
}))

vi.mock('../../lib/config/env', () => ({
  isSupabaseConfigured: false,
  supabaseEnv: { url: null, anonKey: null },
}))

describe('ProtectedRoute', () => {
  it('redirige a /login cuando no hay sesión', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/app']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<div>contenido privado</div>} />
            </Route>
            <Route path="/login" element={<div>página de login</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(await screen.findByText('página de login')).toBeInTheDocument()
    expect(screen.queryByText('contenido privado')).not.toBeInTheDocument()
  })
})
