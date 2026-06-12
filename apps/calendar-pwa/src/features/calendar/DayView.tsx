import { formatDayHeading } from '../../lib/dates/dateUtils'
import { CalendarItemCard, type CalendarItemActions } from './CalendarItemCard'
import type { CalendarItem, ItemFilter } from './calendarTypes'
import { itemsForDay } from './calendarUtils'

export function DayView({
  items,
  dayKey,
  filter,
  actions,
}: {
  items: CalendarItem[]
  dayKey: string
  filter: ItemFilter
  actions: CalendarItemActions
}) {
  const dayItems = itemsForDay(items, dayKey, filter)

  return (
    <section>
      <h2 className="mb-3 text-base font-semibold capitalize text-slate-900">
        {formatDayHeading(dayKey)}
      </h2>
      {dayItems.length === 0 ? (
        <p className="rounded-md bg-white p-4 text-sm text-slate-500 shadow-sm">
          No tienes eventos ni tareas para este día.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {dayItems.map((item) => (
            <CalendarItemCard key={`${item.kind}-${item.id}`} item={item} actions={actions} />
          ))}
        </div>
      )}
    </section>
  )
}
