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

    expect(screen.getByRole('heading', { name: /organiza tu día con claridad/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver mi calendario/i })).toBeInTheDocument()
  })

  it('no muestra el aviso técnico de Supabase cuando está configurado', () => {
    // En este entorno Supabase está configurado (.env.local): el banner verde
    // de "configurado" ya no debe mostrarse al usuario; solo aparecería el aviso
    // ámbar si faltara configuración.
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.queryByText(/supabase configurado/i)).not.toBeInTheDocument()
  })
})
