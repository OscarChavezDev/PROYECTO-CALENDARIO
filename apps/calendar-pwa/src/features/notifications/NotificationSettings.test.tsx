import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthProvider } from '../auth/AuthProvider'
import { NotificationSettings } from './NotificationSettings'

vi.mock('../../lib/config/env', () => ({
  isSupabaseConfigured: false,
  supabaseEnv: { url: null, anonKey: null },
  vapidPublicKey: 'test-vapid-key',
}))

vi.mock('../../lib/supabase/client', () => ({
  getSupabaseClient: () => null,
}))

vi.mock('./pushService', () => ({
  isPushSupported: vi.fn(),
  getNotificationPermission: vi.fn(),
  getCurrentSubscription: vi.fn().mockResolvedValue(null),
  requestAndSubscribe: vi.fn(),
  savePushSubscription: vi.fn(),
}))

import {
  getNotificationPermission,
  isPushSupported,
} from './pushService'

const mockedSupported = vi.mocked(isPushSupported)
const mockedPermission = vi.mocked(getNotificationPermission)

function renderSettings() {
  return render(
    <AuthProvider>
      <NotificationSettings />
    </AuthProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('NotificationSettings', () => {
  it('muestra mensaje de no soporte cuando el navegador no soporta push', () => {
    mockedSupported.mockReturnValue(false)
    mockedPermission.mockReturnValue('denied')
    renderSettings()
    expect(screen.getByText(/no soporta web push/i)).toBeInTheDocument()
  })

  it('deshabilita activar cuando el permiso está denegado', () => {
    mockedSupported.mockReturnValue(true)
    mockedPermission.mockReturnValue('denied')
    renderSettings()
    expect(screen.getByRole('button', { name: /^activar$/i })).toBeDisabled()
  })

  it('permite activar cuando el permiso no ha sido solicitado', () => {
    mockedSupported.mockReturnValue(true)
    mockedPermission.mockReturnValue('default')
    renderSettings()
    expect(screen.getByRole('button', { name: /^activar$/i })).toBeEnabled()
  })

  it('muestra estado activo cuando el permiso está concedido', () => {
    mockedSupported.mockReturnValue(true)
    mockedPermission.mockReturnValue('granted')
    renderSettings()
    expect(screen.getAllByText(/activos/i).length).toBeGreaterThan(0)
  })
})
