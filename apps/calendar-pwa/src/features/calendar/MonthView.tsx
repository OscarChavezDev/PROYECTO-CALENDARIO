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
    <section className="flex h-full min-h-0 flex-col overflow-hidden px-4 md:px-8 pb-6 select-none">
      {/* Cabecera Días de la Semana */}
      <div className="grid grid-cols-7 px-2 pb-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {WEEKDAY_HEADERS.map((header) => (
          <div key={header}>{header}</div>
        ))}
      </div>

      {/* Grilla Mensual */}
      <div className="grid min-h-0 flex-1 grid-cols-7 overflow-hidden rounded-2xl border border-white/[0.07] [background:rgba(255,255,255,0.04)] gap-px">
        {weeks.flat().map((dayKey) => {
          const dayItems = sortItems(byDay.get(dayKey) ?? [])
          const inMonth = isSameMonth(dayKey, anchorKey)
          const isToday = dayKey === today
          const extra = dayItems.length - MAX_CHIPS

          return (
            <div
              key={dayKey}
              onClick={() => onSelectDay(dayKey)}
              className={`group relative flex min-h-[5.5rem] flex-col gap-1 overflow-hidden p-2 text-left transition-colors cursor-pointer ${
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

              <div className="mt-auto flex flex-col gap-1 overflow-hidden">
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
