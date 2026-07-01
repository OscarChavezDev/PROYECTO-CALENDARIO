/* Service worker básico del Organizador de calendario inteligente.
 * Estrategia:
 * - Precache del shell mínimo en install.
 * - Navegaciones: network-first con fallback al index.html cacheado (la SPA
 *   renderiza con datos de IndexedDB cuando no hay conexión).
 * - /assets/ (archivos con hash de Vite): cache-first.
 * - Nunca intercepta peticiones a otros orígenes (Supabase va directo a red).
 */

const CACHE_NAME = 'calendar-pwa-v5'
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg', '/pwa-192.png', '/pwa-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return // Supabase y terceros: directo a red

  // Navegaciones: network-first, fallback al shell cacheado
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy))
          return response
        })
        .catch(() => caches.match('/index.html')),
    )
    return
  }

  // Assets con hash y estáticos: cache-first.
  // Solo se cachean respuestas del mismo origen ('basic') y con status OK;
  // nunca respuestas 'opaque'/'cors' (las de otros orígenes ya se descartan arriba).
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        }),
    ),
  )
})

// Web Push: mostrar notificación al recibir un push
self.addEventListener('push', (event) => {
  if (!event.data) return
  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = { title: 'Recordatorio', body: event.data.text() }
  }
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Recordatorio', {
      body: data.body ?? '',
      icon: '/pwa-192.png',
      badge: '/pwa-192.png',
      tag: data.tag ?? 'reminder',
      data: { url: data.url ?? '/app' },
    }),
  )
})

// Al tocar la notificación, abrir/enfocar la app y navegar al detalle indicado
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/app'
  const target = new URL(url, self.location.origin).href

  event.waitUntil(
    (async () => {
      const list = await clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const client of list) {
        if ('focus' in client) {
          await client.focus()
          // Llevar la ventana ya abierta a la pantalla de detalle
          if (client.url !== target && 'navigate' in client) {
            try {
              await client.navigate(target)
            } catch {
              /* algunos navegadores no permiten navigate; se ignora */
            }
          }
          return
        }
      }
      await clients.openWindow(target)
    })(),
  )
})
