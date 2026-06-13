import { formatDayHeading, todayKey } from '../../lib/dates/dateUtils'
import type { Task } from '../tasks/types'
import { CalendarItemCard, type CalendarItemActions } from './CalendarItemCard'
import type { CalendarItem } from './calendarTypes'
import { openTasksWithoutDate, pendingItemsForDay } from './calendarUtils'

function noDateTaskToItem(task: Task, dayKey: string): CalendarItem {
  return {
    kind: 'tarea',
    id: task.id,
    dayKey,
    time: null,
    sortMinutes: Number.MAX_SAFE_INTEGER,
    title: task.title,
    priority: task.priority,
    task,
  }
}

export function TodayAgenda({
  items,
  tasks,
  actions,
}: {
  items: CalendarItem[]
  tasks: Task[]
  actions: CalendarItemActions
}) {
  const today = todayKey()
  const pending = pendingItemsForDay(items, today)
  const noDateTasks = openTasksWithoutDate(tasks)

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          Pendientes de hoy
          <span className="ml-2 text-sm font-normal capitalize text-slate-500">
            {formatDayHeading(today)}
          </span>
        </h2>
        {pending.length === 0 ? (
          <p className="rounded-md bg-white p-4 text-sm text-slate-500 shadow-sm">
            No tienes eventos ni tareas pendientes para hoy. <i className="fi fi-rr-check-circle ml-1 align-middle text-green-500"></i>
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {pending.map((item) => (
              <CalendarItemCard key={`${item.kind}-${item.id}`} item={item} actions={actions} />
            ))}
          </div>
        )}
      </div>

      {noDateTasks.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Tareas sin fecha</h3>
          <div className="flex flex-col gap-2">
            {noDateTasks.map((task) => (
              <CalendarItemCard
                key={`tarea-${task.id}`}
                item={noDateTaskToItem(task, today)}
                actions={actions}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
