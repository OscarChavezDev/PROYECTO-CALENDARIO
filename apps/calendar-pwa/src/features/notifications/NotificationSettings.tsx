import { useEffect, useState } from 'react'
import { vapidPublicKey } from '../../lib/config/env'
import { getSupabaseClient } from '../../lib/supabase/client'
import { useAuth } from '../auth/useAuth'
import {
  getCurrentSubscription,
  getNotificationPermission,
  isPushSupported,
  requestAndSubscribe,
  savePushSubscription,
} from './pushService'

type Feedback = { kind: 'ok' | 'error'; text: string } | null

export function NotificationSettings() {
  const { user } = useAuth()
  const [supported] = useState(isPushSupported)
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission)
  const [subscribed, setSubscribed] = useState(false)
  const [working, setWorking] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  useEffect(() => {
    if (!supported) return
    getCurrentSubscription()
      .then((sub) => setSubscribed(Boolean(sub)))
      .catch(() => setSubscribed(false))
  }, [supported])

  async function handleEnable() {
    setFeedback(null)
    if (!vapidPublicKey) {
      setFeedback({ kind: 'error', text: 'Falta configurar VITE_VAPID_PUBLIC_KEY.' })
      return
    }
    if (!user) return
    setWorking(true)
    try {
      const sub = await requestAndSubscribe(vapidPublicKey)
      if (!sub) {
        setPermission(getNotificationPermission())
        setFeedback({ kind: 'error', text: 'No se concedió el permiso de notificaciones.' })
        return
      }
      await savePushSubscription(sub, user.id)
      setSubscribed(true)
      setPermission('granted')
      setFeedback({ kind: 'ok', text: 'Notificaciones activadas en este dispositivo.' })
    } catch (err) {
      setFeedback({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Error activando notificaciones.',
      })
    } finally {
      setWorking(false)
    }
  }

  async function handleTest() {
    setFeedback(null)
    if (!user) return
    const supabase = getSupabaseClient()
    if (!supabase) {
      setFeedback({ kind: 'error', text: 'Supabase no está configurado.' })
      return
    }
    setWorking(true)
    try {
      const { data, error } = await supabase.functions.invoke('send-test-push', {
        body: {
          userId: user.id,
          title: 'Prueba de notificación',
          body: '¡Funciona! Tu Organizador de calendario puede enviarte recordatorios.',
        },
      })
      if (error) throw new Error(error.message)
      const result = data as { sent?: number; error?: string }
      if (result.error) throw new Error(result.error)
      setFeedback({
        kind: 'ok',
        text: `Notificación enviada (${result.sent ?? 0}). Debería llegarte en segundos.`,
      })
    } catch (err) {
      setFeedback({
        kind: 'error',
        text:
          (err instanceof Error ? err.message : 'Error enviando la prueba.') +
          ' ¿Desplegaste la Edge Function send-test-push y sus secrets?',
      })
    } finally {
      setWorking(false)
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Notificaciones</h1>
        <p className="mt-1 text-sm text-slate-500">
          Recibe recordatorios de tus eventos y tareas por Web Push.
        </p>
      </div>

      {!supported ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Este navegador no soporta Web Push. En iPhone debes{' '}
          <strong>instalar la app en la pantalla de inicio</strong> desde Safari (botón
          Compartir → Agregar a pantalla de inicio) y abrirla desde ahí.
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-700">
            Estado del permiso:{' '}
            <strong>
              {permission === 'granted'
                ? 'Permitido'
                : permission === 'denied'
                  ? 'Denegado'
                  : 'No solicitado'}
            </strong>
            {subscribed && ' · suscrito en este dispositivo'}
          </p>

          {permission === 'denied' && (
            <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              Bloqueaste las notificaciones. Actívalas desde la configuración del navegador
              para este sitio.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleEnable}
              disabled={working || permission === 'denied'}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {subscribed ? 'Re-activar notificaciones' : 'Activar notificaciones'}
            </button>
            <button
              onClick={handleTest}
              disabled={working || !subscribed}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Enviar notificación de prueba
            </button>
          </div>

          {feedback && (
            <p
              role="status"
              className={`rounded-md p-3 text-sm ${
                feedback.kind === 'ok'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {feedback.text}
            </p>
          )}

          <p className="text-xs text-slate-400">
            En iPhone, las notificaciones solo funcionan con la app instalada en la pantalla
            de inicio (PWA), no desde Safari directamente.
          </p>
        </div>
      )}
    </section>
  )
}
