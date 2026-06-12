/**
 * Registra el service worker solo en builds de producción
 * (en dev rompería el HMR de Vite y cachearía módulos volátiles).
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD) return
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      console.error('No se pudo registrar el service worker:', error)
    })
  })
}
