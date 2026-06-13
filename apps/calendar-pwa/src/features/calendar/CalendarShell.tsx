import { useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  formatDayHeading,
  formatDayShort,
  formatMonthHeading,
  todayKey,
  weekKeys,
} from '../../lib/dates/dateUtils'
import { EventForm } from '../events/EventForm'
import type { CalendarEvent, EventFormValues } from '../events/types'
import { TaskForm } from '../tasks/TaskForm'
import type { Task, TaskFormValues } from '../tasks/types'
import type { CalendarItemActions } from './CalendarItemCard'
import type { CalendarViewId, ItemFilter } from './calendarTypes'
import { buildItems } from './calendarUtils'
import { DayView } from './DayView'
import { MonthView } from './MonthView'
import { TodayAgenda } from './TodayAgenda'
import { WeekView } from './WeekView'

interface CalendarShellProps {
  events: CalendarEvent[]
  tasks: Task[]
  onCreateEvent: (values: EventFormValues) => Promise<void>
  onUpdateEvent: (id: string, values: EventFormValues) => Promise<void>
  onDeleteEvent: (event: CalendarEvent) => void
  onCreateTask: (values: TaskFormValues) => Promise<void>
  onUpdateTask: (id: string, values: TaskFormValues) => Promise<void>
  onDeleteTask: (task: Task) => void
  onCompleteTask: (task: Task) => void
  onPostponeTask: (task: Task) => void
}

type FormPanel =
  | { type: 'event'; editing: CalendarEvent | null }
  | { type: 'task'; editing: Task | null }
  | null

const VIEWS: Array<{ id: CalendarViewId; label: string }> = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'dia', label: 'Día' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
]

const FILTERS: Array<{ id: ItemFilter; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'tareas', label: 'Tareas' },
]

export function CalendarShell(props: CalendarShellProps) {
  const [view, setView] = useState<CalendarViewId>('hoy')
  const [anchorKey, setAnchorKey] = useState(todayKey)
  const [filter, setFilter] = useState<ItemFilter>('todos')
  const [panel, setPanel] = useState<FormPanel>(null)

  const items = useMemo(
    () => buildItems(props.events, props.tasks),
    [props.events, props.tasks],
  )

  const actions: CalendarItemActions = {
    onEditEvent: (event) => setPanel({ type: 'event', editing: event }),
    onDeleteEvent: props.onDeleteEvent,
    onEditTask: (task) => setPanel({ type: 'task', editing: task }),
    onDeleteTask: props.onDeleteTask,
    onCompleteTask: props.onCompleteTask,
    onPostponeTask: props.onPostponeTask,
  }

  function navigate(direction: -1 | 1) {
    if (view === 'dia') setAnchorKey((k) => addDays(k, direction))
    else if (view === 'semana') setAnchorKey((k) => addDays(k, direction * 7))
    else if (view === 'mes') setAnchorKey((k) => addMonths(k, direction))
  }

  function goToDay(dayKey: string) {
    setAnchorKey(dayKey)
    setView('dia')
  }

  async function handleEventSubmit(values: EventFormValues) {
    if (panel?.type === 'event' && panel.editing) {
      await props.onUpdateEvent(panel.editing.id, values)
    } else {
      await props.onCreateEvent(values)
    }
    setPanel(null)
  }

  async function handleTaskSubmit(values: TaskFormValues) {
    if (panel?.type === 'task' && panel.editing) {
      await props.onUpdateTask(panel.editing.id, values)
    } else {
      await props.onCreateTask(values)
    }
    setPanel(null)
  }

  const week = weekKeys(anchorKey)
  const navLabel =
    view === 'dia'
      ? formatDayHeading(anchorKey)
      : view === 'semana'
        ? `${formatDayShort(week[0])} – ${formatDayShort(week[6])}`
        : view === 'mes'
          ? formatMonthHeading(anchorKey)
          : null

  return (
    <div className="flex flex-col gap-4">
      {/* Selector de vista + filtro */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex rounded-lg border border-slate-300 bg-white p-0.5">
          {VIEWS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                view === id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          aria-label="Filtrar por tipo"
          value={filter}
          onChange={(e) => setFilter(e.target.value as ItemFilter)}
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
        >
          {FILTERS.map(({ id, label }) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Navegación de fechas */}
      {view !== 'hoy' && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            aria-label="Anterior"
            className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <i className="fi fi-rr-angle-left"></i>
          </button>
          <button
            onClick={() => setAnchorKey(todayKey())}
            className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Hoy
          </button>
          <button
            onClick={() => navigate(1)}
            aria-label="Siguiente"
            className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <i className="fi fi-rr-angle-right"></i>
          </button>
          <span className="ml-1 text-sm font-medium capitalize text-slate-600">{navLabel}</span>
        </div>
      )}

      {/* CTA crear */}
      <div className="flex gap-2">
        <button
          onClick={() =>
            setPanel(panel?.type === 'event' && !panel.editing ? null : { type: 'event', editing: null })
          }
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          <i className="fi fi-rr-plus mr-1 align-middle"></i> Evento
        </button>
        <button
          onClick={() =>
            setPanel(panel?.type === 'task' && !panel.editing ? null : { type: 'task', editing: null })
          }
          className="rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-teal-700"
        >
          <i className="fi fi-rr-plus mr-1 align-middle"></i> Tarea
        </button>
      </div>

      {/* Panel crear/editar */}
      {panel?.type === 'event' && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-slate-900">
            {panel.editing ? `Editar evento: ${panel.editing.title}` : 'Crear evento'}
          </h2>
          <EventForm
            key={panel.editing?.id ?? 'new-event'}
            initial={panel.editing}
            onSubmit={handleEventSubmit}
            onCancel={() => setPanel(null)}
          />
        </section>
      )}
      {panel?.type === 'task' && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-slate-900">
            {panel.editing ? `Editar tarea: ${panel.editing.title}` : 'Crear tarea'}
          </h2>
          <TaskForm
            key={panel.editing?.id ?? 'new-task'}
            initial={panel.editing}
            onSubmit={handleTaskSubmit}
            onCancel={() => setPanel(null)}
          />
        </section>
      )}

      {/* Vista activa */}
      {view === 'hoy' && <TodayAgenda items={items} tasks={props.tasks} actions={actions} />}
      {view === 'dia' && (
        <DayView items={items} dayKey={anchorKey} filter={filter} actions={actions} />
      )}
      {view === 'semana' && (
        <WeekView
          items={items}
          anchorKey={anchorKey}
          filter={filter}
          actions={actions}
          onSelectDay={goToDay}
        />
      )}
      {view === 'mes' && (
        <MonthView items={items} anchorKey={anchorKey} filter={filter} onSelectDay={goToDay} />
      )}
    </div>
  )
}
