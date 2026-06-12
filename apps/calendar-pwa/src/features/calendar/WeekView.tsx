import { formatDayShort, todayKey, weekKeys } from '../../lib/dates/dateUtils'
import { CalendarItemCard, type CalendarItemActions } from './CalendarItemCard'
import type { CalendarItem, ItemFilter } from './calendarTypes'
import { itemsForDay } from './calendarUtils'

export function WeekView({
  items,
  anchorKey,
  filter,
  actions,
  onSelectDay,
}: {
  items: CalendarItem[]
  anchorKey: string
  filter: ItemFilter
  actions: CalendarItemActions
  onSelectDay: (dayKey: string) => void
}) {
  const today = todayKey()
  const days = weekKeys(anchorKey)

  return (
    <section className="flex flex-col gap-4">
      {days.map((dayKey) => {
        const dayItems = itemsForDay(items, dayKey, filter)
        const isToday = dayKey === today
        return (
          <div key={dayKey}>
            <button
              onClick={() => onSelectDay(dayKey)}
              className={`mb-2 rounded px-2 py-0.5 text-sm font-semibold capitalize ${
                isToday ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-200'
              }`}
              title="Ver día"
            >
              {formatDayShort(dayKey)}
              {isToday && ' · hoy'}
            </button>
            {dayItems.length === 0 ? (
              <p className="px-2 text-xs text-slate-400">Sin elementos</p>
            ) : (
              <div className="flex flex-col gap-2">
                {dayItems.map((item) => (
                  <CalendarItemCard
                    key={`${item.kind}-${item.id}`}
                    item={item}
                    actions={actions}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}
