import { useState } from 'react'
import { vapidPublicKey } from '../../lib/config/env'
import { useAuth } from '../auth/useAuth'
import { signOut } from '../auth/authService'
import {
  getNotificationPermission,
  isPushSupported,
  requestAndSubscribe,
  savePushSubscription,
} from './pushService'

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || 'U'
}

/**
 * Pantalla de Ajustes (/ajustes). Solo funcionalidad real: perfil, permiso de
 * notificaciones push (con suscripción) y cerrar sesión.
 */
export function NotificationSettings() {
  const { user } = useAuth()
  const [supported] = useState(isPushSupported)
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) || user?.email?.split('@')[0] || 'Usuario'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const email = user?.email ?? ''
  const granted = permission === 'granted'
  const denied = permission === 'denied'

  async function enablePush() {
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
        setError('No se concedió el permiso. Puedes activarlo desde los ajustes del navegador.')
        return
      }
      await savePushSubscription(sub, user.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron activar las notificaciones.')
    } finally {
      setWorking(false)
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
    } catch {
      // ignorar
    }
  }

  const sectionLabel = 'px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-aurora-primary-bright'

  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-in select-none px-5 py-8 md:px-8 md:py-12 text-left">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-white">Configuración</h1>

      <div className="flex flex-col gap-8">
        {/* Perfil */}
        <section className="glass-panel-hover glass-card flex flex-col items-center gap-3 rounded-3xl border border-white/10 p-7 text-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-24 w-24 rounded-full border-2 border-blue-400/60 object-cover shadow-[0_0_24px_rgba(59,130,246,0.35)]"
            />
          ) : (
            <span className="grid h-24 w-24 place-items-center rounded-full border-2 border-blue-400/40 bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-black text-white shadow-[0_0_24px_rgba(59,130,246,0.35)]">
              {initials(displayName)}
            </span>
          )}
          <div className="mt-1">
            <h2 className="text-lg font-bold capitalize text-white">{displayName}</h2>
            {email && <p className="mt-0.5 text-sm text-slate-400">{email}</p>}
          </div>
          <span className="mt-1 flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            Sincronizado
          </span>
        </section>

        {/* Notificaciones */}
        <section className="flex flex-col gap-3">
          <span className={sectionLabel}>Notificaciones</span>

          {!supported ? (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm font-medium text-amber-300">
              Tu navegador no soporta Web Push.
            </div>
          ) : (
            <div className="glass-panel-hover glass-card flex items-center justify-between gap-4 rounded-2xl border border-white/10 p-5">
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-blue-300">
                  <span className="material-symbols-outlined text-[22px]">notifications_active</span>
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">Recordatorios push</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {granted
                      ? 'Activos — te avisaremos de tus eventos y tareas.'
                      : denied
                        ? 'Bloqueados en el navegador. Actívalos desde su configuración.'
                        : 'Recibe avisos de tus eventos y tareas a tiempo.'}
                  </p>
                </div>
              </div>

              {granted ? (
                <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Activos
                </span>
              ) : (
                <button
                  type="button"
                  onClick={enablePush}
                  disabled={working || denied}
                  className="glow-button shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:from-blue-400 hover:to-indigo-500 disabled:opacity-50 press"
                >
                  {working ? 'Activando…' : 'Activar'}
                </button>
              )}
            </div>
          )}

          {error && <p className="px-1 text-xs font-medium text-rose-400">{error}</p>}
        </section>

        {/* Cerrar sesión */}
        <section className="flex flex-col gap-3">
          <span className={sectionLabel}>Cuenta</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="group flex items-center justify-center gap-2.5 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm font-bold text-rose-400 transition-all hover:bg-rose-500/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] press"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-0.5">
              logout
            </span>
            Cerrar sesión
          </button>
        </section>
      </div>
    </div>
  )
}
