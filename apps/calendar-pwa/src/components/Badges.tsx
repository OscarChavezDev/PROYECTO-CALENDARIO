import { PRIORITY_LABELS, type Priority } from '../lib/domain/types'

const priorityStyles: Record<Priority, string> = {
  baja: 'bg-slate-700 text-slate-300',
  media: 'bg-blue-500/15 text-blue-300',
  alta: 'bg-amber-500/15 text-amber-300',
  critica: 'bg-red-500/15 text-red-300',
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
  programado: 'bg-blue-500/15 text-blue-300',
  completado: 'bg-green-500/15 text-green-300',
  cancelado: 'bg-slate-700 text-slate-400',
  pospuesto: 'bg-amber-500/15 text-amber-300',
  // tareas
  pendiente: 'bg-blue-500/15 text-blue-300',
  en_proceso: 'bg-blue-500/15 text-blue-300',
  completada: 'bg-green-500/15 text-green-300',
  pospuesta: 'bg-amber-500/15 text-amber-300',
  cancelada: 'bg-slate-700 text-slate-400',
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        statusStyles[status] ?? 'bg-slate-700 text-slate-300'
      }`}
    >
      {label}
    </span>
  )
}
