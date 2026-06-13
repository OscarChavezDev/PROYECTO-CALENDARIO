import { describe, expect, it } from 'vitest'
import { getNotificationPermission, isPushSupported } from './pushService'

// En jsdom no existen Notification / PushManager / serviceWorker:
// el servicio debe reportar "no soportado" sin lanzar errores.
describe('pushService en entorno sin APIs de push', () => {
  it('isPushSupported devuelve false', () => {
    expect(isPushSupported()).toBe(false)
  })

  it('getNotificationPermission devuelve "denied" cuando no hay Notification', () => {
    expect(getNotificationPermission()).toBe('denied')
  })
})
