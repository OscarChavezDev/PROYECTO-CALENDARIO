import { addDays } from '../../lib/dates/dateUtils'
import { DayGroupedList } from './DayGroupedList'
import type { CalendarItemActions } from './CalendarItemCard'
import type { CalendarItem, ItemFilter } from './calendarTypes'

/** Vista de 3 días consecutivos a partir de la fecha ancla. */
export function ThreeDayView({
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
  const days = [anchorKey, addDays(anchorKey, 1), addDays(anchorKey, 2)]
  return (
    <DayGroupedList
      items={items}
      days={days}
      filter={filter}
      actions={actions}
      onSelectDay={onSelectDay}
    />
  )
}
