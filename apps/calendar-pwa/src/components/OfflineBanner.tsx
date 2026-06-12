import { useOnlineStatus } from '../lib/network/useOnlineStatus'

/** Aviso global cuando no hay conexión: la app muestra datos guardados. */
export function OfflineBanner() {
  const online = useOnlineStatus()

  if (online) return null

  return (
    <div
      role="status"
      className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900"
    >
      📡 Sin conexión: estás viendo datos guardados. Tus cambios se sincronizarán al
      recuperar la conexión.
    </div>
  )
}
