import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SupabaseStatusBanner } from './SupabaseStatusBanner'

describe('SupabaseStatusBanner', () => {
  it('muestra aviso verde cuando Supabase está configurado', () => {
    render(<SupabaseStatusBanner configured={true} />)
    expect(screen.getByText(/supabase configurado/i)).toBeInTheDocument()
  })

  it('muestra aviso ámbar cuando Supabase no está configurado', () => {
    render(<SupabaseStatusBanner configured={false} />)
    expect(screen.getByText(/supabase aún no configurado/i)).toBeInTheDocument()
  })
})
