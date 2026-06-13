/**
 * Registra el service worker solo en builds de producción
 * (en dev rompería el HMR de Vite y cachearía módulos volátiles).
 *
 * Versionado del cache: los assets los hashea Vite (nombre único por build) y la
 * navegación es network-first, así que el HTML siempre se revalida. Para tomar una
 * versión nueva del propio SW sin que el usuario tenga que cerrar la PWA, se fuerza
 * `update()` al cargar y cada vez que la app vuelve a primer plano.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD) return
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Buscar actualizaciones al volver a primer plano (PWA abierta mucho tiempo)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            void registration.update()
          }
        })
      })
      .catch((error: unknown) => {
        console.error('No se pudo registrar el service worker:', error)
      })
  })
}
