import { type Priority } from '../lib/domain/types'
import { type EventStatus } from '../features/events/types'
import type { PillOption } from './OptionPills'

export const PRIORITY_PILLS: PillOption<Priority>[] = [
  { value: 'baja', label: 'Baja', activeClassName: 'border-slate-500 bg-slate-500 text-white' },
  { value: 'media', label: 'Media', activeClassName: 'border-blue-600 bg-blue-600 text-white' },
  { value: 'alta', label: 'Alta', activeClassName: 'border-amber-500 bg-amber-500 text-white' },
  { value: 'critica', label: 'Crítica', activeClassName: 'border-red-600 bg-red-600 text-white' },
]

export const EVENT_STATUS_PILLS: PillOption<EventStatus>[] = [
  { value: 'programado', label: 'Programado', activeClassName: 'border-blue-600 bg-blue-600 text-white' },
  { value: 'completado', label: 'Completado', activeClassName: 'border-green-600 bg-green-600 text-white' },
  { value: 'pospuesto', label: 'Pospuesto', activeClassName: 'border-amber-500 bg-amber-500 text-white' },
  { value: 'cancelado', label: 'Cancelado', activeClassName: 'border-slate-400 bg-slate-400 text-white' },
]
