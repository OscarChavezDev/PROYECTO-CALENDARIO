import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('muestra el nombre del proyecto y los accesos placeholder', () => {
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

  it('avisa cuando Supabase no está configurado', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/supabase aún no configurado/i)).toBeInTheDocument()
  })
})
