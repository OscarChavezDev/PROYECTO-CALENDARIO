import {
  dayNumber,
  isSameMonth,
  monthGrid,
  todayKey,
} from '../../lib/dates/dateUtils'
import type { Priority } from '../../lib/domain/types'
import type { CalendarItem, ItemFilter } from './calendarTypes'
import { applyFilter, sortItems } from './calendarUtils'

const WEEKDAY_HEADERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const dotColor: Record<Priority, string> = {
  critica: 'bg-red-500',
  alta: 'bg-amber-500',
  media: 'bg-indigo-400',
  baja: 'bg-slate-300',
}

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
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">
        {WEEKDAY_HEADERS.map((header, i) => (
          <div key={`${header}-${i}`} className="py-1">
            {header}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {weeks.map((week) => (
          <div key={week[0]} className="grid grid-cols-7 gap-1">
            {week.map((dayKey) => {
              const dayItems = sortItems(byDay.get(dayKey) ?? [])
              const inMonth = isSameMonth(dayKey, anchorKey)
              const isToday = dayKey === today
              return (
                <button
                  key={dayKey}
                  onClick={() => onSelectDay(dayKey)}
                  title={`Ver ${dayKey}`}
                  className={`flex min-h-14 flex-col items-center gap-1 rounded-md border p-1 text-sm transition ${
                    isToday
                      ? 'border-indigo-500 bg-indigo-50 font-bold text-indigo-700'
                      : inMonth
                        ? 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                        : 'border-transparent bg-transparent text-slate-300'
                  }`}
                >
                  <span>{dayNumber(dayKey)}</span>
                  {dayItems.length > 0 && (
                    <span className="flex items-center gap-0.5">
                      {dayItems.slice(0, 3).map((item) => (
                        <span
                          key={`${item.kind}-${item.id}`}
                          className={`h-1.5 w-1.5 rounded-full ${dotColor[item.priority]}`}
                        />
                      ))}
                      {dayItems.length > 3 && (
                        <span className="text-[10px] leading-none text-slate-500">
                          +{dayItems.length - 3}
                        </span>
                      )}
                    </span>
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
