import { dayNumber, isSameMonth, monthGrid, todayKey } from '../../lib/dates/dateUtils'
import type { CalendarItem, ItemFilter } from './calendarTypes'
import { applyFilter, sortItems } from './calendarUtils'

const WEEKDAY_HEADERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const chipBg: Record<CalendarItem['kind'], string> = {
  evento: 'bg-indigo-600',
  tarea: 'bg-teal-600',
}

const MAX_CHIPS = 2 // chips visibles por día en móvil

export function MonthView({
  items,
  anchorKey,
  filter,
  onSelectDay,
}: {
  items: CalendarItem[]
  anchorKey: string
  filter: ItemFilter
  onSelectDay: (dayKey: string) => void
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
    <section>
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-500">
        {WEEKDAY_HEADERS.map((header, i) => (
          <div key={`${header}-${i}`} className="py-1">
            {header}
          </div>
        ))}
      </div>
      <div className="flex flex-col">
        {weeks.map((week) => (
          <div key={week[0]} className="grid grid-cols-7">
            {week.map((dayKey) => {
              const dayItems = sortItems(byDay.get(dayKey) ?? [])
              const inMonth = isSameMonth(dayKey, anchorKey)
              const isToday = dayKey === today
              const extra = dayItems.length - MAX_CHIPS
              return (
                <button
                  key={dayKey}
                  onClick={() => onSelectDay(dayKey)}
                  title={`Ver ${dayKey}`}
                  className={`flex min-h-20 flex-col gap-0.5 border border-slate-100 p-1 text-left align-top transition hover:bg-slate-50 ${
                    inMonth ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  <span
                    className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                      isToday
                        ? 'bg-indigo-600 font-bold text-white'
                        : inMonth
                          ? 'text-slate-700'
                          : 'text-slate-300'
                    }`}
                  >
                    {dayNumber(dayKey)}
                  </span>

                  {dayItems.slice(0, MAX_CHIPS).map((item) => (
                    <span
                      key={`${item.kind}-${item.id}`}
                      className={`truncate rounded-sm px-1 text-[9px] leading-tight text-white ${chipBg[item.kind]} ${
                        item.task?.status === 'completada' ? 'opacity-50 line-through' : ''
                      }`}
                    >
                      {item.title}
                    </span>
                  ))}
                  {extra > 0 && (
                    <span className="px-1 text-[9px] leading-tight text-slate-500">+{extra} más</span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-400">Toca un día para ver su detalle.</p>
    </section>
  )
}
