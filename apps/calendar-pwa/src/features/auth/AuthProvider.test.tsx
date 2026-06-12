import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthProvider } from './AuthProvider'

vi.mock('../../lib/supabase/client', () => ({
  getSupabaseClient: () => null,
}))

vi.mock('../../lib/config/env', () => ({
  isSupabaseConfigured: false,
  supabaseEnv: { url: null, anonKey: null },
}))

describe('AuthProvider', () => {
  it('renderiza sus hijos sin romper aunque Supabase no esté configurado', async () => {
    render(
      <AuthProvider>
        <div>contenido hijo</div>
      </AuthProvider>,
    )

    expect(await screen.findByText('contenido hijo')).toBeInTheDocument()
  })
})
