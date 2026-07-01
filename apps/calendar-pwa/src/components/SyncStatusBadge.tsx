import type { RealtimeStatus } from '../features/calendar/useCalendarRealtime'

const statusConfig: Record<RealtimeStatus, { dot: string; label: string }> = {
  conectado: { dot: 'bg-green-500', label: 'Sincronizado' },
  conectando: { dot: 'bg-amber-400 animate-pulse', label: 'Conectando…' },
  desconectado: { dot: 'bg-red-500', label: 'Sin tiempo real' },
}

export function SyncStatusBadge({
  status,
  refreshing,
  onRefresh,
}: {
  status: RealtimeStatus
  refreshing: boolean
  onRefresh: () => void
}) {
  const { dot, label } = statusConfig[status]

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-400">
      <span aria-hidden className={`h-2 w-2 rounded-full ${dot}`} />
      {refreshing ? 'Actualizando…' : label}
      {status === 'desconectado' && !refreshing && (
        <button onClick={onRefresh} className="font-semibold text-blue-400 hover:underline">
          Actualizar
        </button>
      )}
    </span>
  )
}
