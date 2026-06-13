import { requireClient } from '../../lib/supabase/requireClient'

/** Convierte la clave VAPID pública (base64url) a Uint8Array para applicationServerKey. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

/** ¿El navegador soporta Web Push? (Notification + Service Worker + PushManager) */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  )
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof Notification === 'undefined') return 'denied'
  return Notification.permission
}

/** Subscription activa registrada en el service worker, si existe. */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null
  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.getSubscription()
}

/** Pide permiso y suscribe al usuario a Web Push. Devuelve null si se rechaza/ no soporta. */
export async function requestAndSubscribe(
  vapidPublicKey: string,
): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  if (existing) return existing

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
  })
}

/** Guarda (o re-activa) la subscription en Supabase para el usuario. */
export async function savePushSubscription(
  sub: PushSubscription,
  userId: string,
): Promise<void> {
  const json = sub.toJSON()
  const keys = json.keys ?? {}
  const supabase = requireClient()
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: sub.endpoint,
      p256dh: keys.p256dh ?? '',
      auth: keys.auth ?? '',
      user_agent: navigator.userAgent,
      revoked_at: null,
    },
    { onConflict: 'user_id,endpoint' },
  )
  if (error) throw new Error(`No se pudo guardar la suscripción: ${error.message}`)
}
