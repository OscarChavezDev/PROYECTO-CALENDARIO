import { useState } from 'react'
import { vapidPublicKey } from '../../lib/config/env'
import { useAuth } from '../auth/useAuth'
import {
  getNotificationPermission,
  isPushSupported,
  requestAndSubscribe,
  savePushSubscription,
} from './pushService'

const DISMISS_KEY = 'notif-prompt-dismissed'

/**
 * Prerrequisito al iniciar: invita a permitir notificaciones explicando que son
 * para los recordatorios. Solo aparece si el navegador las soporta, hay sesión
 * y el permiso aún no se ha decidido ('default'). Se puede posponer por sesión.
 */
export function NotificationPrompt() {
  const { user } = useAuth()
  const [supported] = useState(isPushSupported)
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission)
  const [dismissed, setDismissed] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(DISMISS_KEY) === '1',
  )
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user || !supported || permission !== 'default' || dismissed) return null

  async function enable() {
    setError(null)
    if (!vapidPublicKey) {
      setError('Las notificaciones aún no están configuradas en el servidor.')
      return
    }
    if (!user) return
    setWorking(true)
    try {
      const sub = await requestAndSubscribe(vapidPublicKey)
      setPermission(getNotificationPermission())
      if (!sub) {
        setError('No se concedió el permiso. Puedes activarlo luego desde Ajustes.')
        return
      }
      await savePushSubscription(sub, user.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron activar las notificaciones.')
    } finally {
      setWorking(false)
    }
  }

  function dismiss() {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div
      role="dialog"
      aria-label="Activa los recordatorios"
      className="fixed left-4 right-4 top-20 z-50 mx-auto max-w-[19rem] animate-slide-up sm:left-auto sm:right-6 sm:top-auto sm:bottom-28 sm:mx-0 sm:w-full"
    >
      <div className="glass-modal relative overflow-hidden rounded-2xl p-4 shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          title="Cerrar"
          className="press absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-md text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 text-white shadow-[0_0_14px_rgba(59,130,246,0.45)]">
            <span className="material-symbols-outlined text-[18px]">notifications</span>
          </span>
          <div className="flex-1 pr-5">
            <h3 className="text-sm font-bold text-white">Activa los recordatorios</h3>
            <p className="mt-0.5 text-xs leading-snug text-slate-400">
              Recibe avisos de tus eventos y tareas a tiempo.
            </p>
            {error && <p className="mt-1.5 text-[11px] font-medium text-red-400">{error}</p>}
            <div className="mt-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={enable}
                disabled={working}
                className="press glow-button rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:from-blue-400 hover:to-indigo-500 disabled:opacity-50"
              >
                {working ? 'Activando…' : 'Permitir'}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="press rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
