import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('muestra el nombre del proyecto y los accesos', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /organizador de calendario inteligente/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /mi calendario/i })).toBeInTheDocument()
  })

  it('muestra el estado de Supabase sin asumir un estado fijo', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    // No depende del .env.local real: acepta configurado o no configurado
    expect(screen.getByText(/supabase (configurado|aún no configurado)/i)).toBeInTheDocument()
  })
})
