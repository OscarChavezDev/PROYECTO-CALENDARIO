import { useOnlineStatus } from '../lib/network/useOnlineStatus'

/** Aviso global cuando no hay conexión: la app muestra datos guardados. */
export function OfflineBanner() {
  const online = useOnlineStatus()

  if (online) return null

  return (
    <div
      role="status"
      className="bg-amber-500/15 px-4 py-2 text-center text-sm font-medium text-amber-200"
    >
      <i className="fi fi-rr-wifi-slash mr-1 align-middle"></i> Sin conexión: estás viendo datos guardados. Tus cambios se sincronizarán al
      recuperar la conexión.
    </div>
  )
}
