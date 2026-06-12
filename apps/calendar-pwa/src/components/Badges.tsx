import { PRIORITY_LABELS, type Priority } from '../lib/domain/types'

const priorityStyles: Record<Priority, string> = {
  baja: 'bg-slate-200 text-slate-700',
  media: 'bg-blue-100 text-blue-800',
  alta: 'bg-amber-100 text-amber-800',
  critica: 'bg-red-100 text-red-800',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[priority]}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

const statusStyles: Record<string, string> = {
  // eventos
  programado: 'bg-indigo-100 text-indigo-800',
  completado: 'bg-green-100 text-green-800',
  cancelado: 'bg-slate-200 text-slate-500',
  pospuesto: 'bg-amber-100 text-amber-800',
  // tareas
  pendiente: 'bg-indigo-100 text-indigo-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  completada: 'bg-green-100 text-green-800',
  pospuesta: 'bg-amber-100 text-amber-800',
  cancelada: 'bg-slate-200 text-slate-500',
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        statusStyles[status] ?? 'bg-slate-200 text-slate-700'
      }`}
    >
      {label}
    </span>
  )
}
