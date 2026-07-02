import { dayNumber, isSameMonth, monthGrid, todayKey } from '../../lib/dates/dateUtils'
import type { CalendarItem, ItemFilter } from './calendarTypes'
import { applyFilter, sortItems } from './calendarUtils'

const WEEKDAY_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const MAX_CHIPS = 4

// Color de los chips según prioridad (consistente con Día/Semana).
const PRIO_CHIP: Record<string, string> = {
  critica: 'border-rose-500 bg-rose-500/10 text-rose-200',
  alta: 'border-amber-500 bg-amber-500/10 text-amber-200',
  media: 'border-blue-500 bg-blue-500/10 text-blue-200',
  baja: 'border-slate-400 bg-slate-500/15 text-slate-300',
}

// Puntos de color por prioridad (versión móvil: no cabe texto en la celda).
const PRIO_DOT: Record<string, string> = {
  critica: 'bg-rose-500',
  alta: 'bg-amber-500',
  media: 'bg-blue-500',
  baja: 'bg-slate-400',
}

export function MonthView({
  items,
  anchorKey,
  filter,
  onSelectDay,
  onItemClick,
}: {
  items: CalendarItem[]
  anchorKey: string
  filter: ItemFilter
  onSelectDay: (dayKey: string) => void
  onItemClick?: (item: CalendarItem) => void
}) {
  const today = todayKey()
  const weeks = monthGrid(anchorKey)
  const filtered = applyFilter(items, filter)

  const byDay = new Map<string, CalendarItem[]>()
  for (const item of filtered) {
    const list = byDay.get(item.dayKey) ?? []
    list.push(item)
    byDay.set(item.dayKey, list)
  }

  return (
    // Móvil: el mes crece y scrollea en el contenedor padre (sin recortar semanas)
    // y deja hueco para la BottomNavBar. Escritorio: se mantiene a pantalla completa.
    <section className="flex min-h-0 flex-col px-4 pb-24 select-none md:h-full md:overflow-hidden md:px-8 md:pb-6">
      {/* Cabecera Días de la Semana */}
      <div className="grid grid-cols-7 px-2 pb-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {WEEKDAY_HEADERS.map((header) => (
          <div key={header}>{header}</div>
        ))}
      </div>

      {/* Grilla Mensual */}
      <div className="grid flex-1 grid-cols-7 overflow-hidden rounded-2xl border border-white/[0.07] [background:rgba(255,255,255,0.04)] gap-px md:min-h-0">
        {weeks.flat().map((dayKey) => {
          const dayItems = sortItems(byDay.get(dayKey) ?? [])
          const inMonth = isSameMonth(dayKey, anchorKey)
          const isToday = dayKey === today
          const extra = dayItems.length - MAX_CHIPS

          return (
            <div
              key={dayKey}
              onClick={() => onSelectDay(dayKey)}
              className={`group relative flex min-h-16 flex-col gap-1 overflow-hidden p-1.5 text-left transition-colors cursor-pointer md:min-h-[5.5rem] md:p-2 ${
                isToday
                  ? 'bg-blue-500/[0.08] ring-1 ring-inset ring-blue-500/30'
                  : inMonth
                    ? 'bg-ui-bg/60 hover:bg-white/[0.03]'
                    : 'bg-ui-bg/30 opacity-40 hover:bg-white/[0.02]'
              }`}
            >
              <span
                className={`text-xs font-semibold ${
                  isToday ? 'text-blue-400' : inMonth ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                {dayNumber(dayKey)}
              </span>

              {/* Móvil: puntos de color (una celda de ~45px no da para texto legible) */}
              <div className="mt-auto flex flex-wrap items-center gap-1 sm:hidden">
                {dayItems.slice(0, MAX_CHIPS).map((item) => {
                  const isCompleted = item.kind === 'tarea' && item.task?.status === 'completada'
                  return (
                    <span
                      key={`dot-${item.kind}-${item.id}`}
                      className={`h-1.5 w-1.5 rounded-full ${PRIO_DOT[item.priority] ?? PRIO_DOT.media} ${
                        isCompleted ? 'opacity-40' : ''
                      }`}
                    />
                  )
                })}
                {extra > 0 && (
                  <span className="text-[9px] font-bold leading-none text-blue-400">+{extra}</span>
                )}
              </div>

              {/* Tablet/escritorio: chips con título */}
              <div className="mt-auto hidden flex-col gap-1 overflow-hidden sm:flex">
                {dayItems.slice(0, MAX_CHIPS).map((item) => {
                  const isCompleted = item.kind === 'tarea' && item.task?.status === 'completada'
                  return (
                    <div
                      key={`${item.kind}-${item.id}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onItemClick) onItemClick(item)
                      }}
                      className={`truncate rounded-md border-l-2 px-1.5 py-1 text-[10px] font-medium transition-all press ${
                        PRIO_CHIP[item.priority] ?? PRIO_CHIP.media
                      } ${isCompleted ? 'opacity-40 line-through' : ''}`}
                    >
                      {item.title}
                    </div>
                  )
                })}

                {extra > 0 && (
                  <span className="px-1 text-[10px] font-bold text-blue-400 hover:underline">
                    +{extra} más
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
