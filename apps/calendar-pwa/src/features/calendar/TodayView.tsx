import { Fragment } from 'react'
import { minutesFromIso, todayKey } from '../../lib/dates/dateUtils'
import type { Task } from '../tasks/types'
import type { CalendarItemActions } from './CalendarItemCard'
import type { CalendarItem, ItemFilter } from './calendarTypes'
import { OPEN_TASK_STATUSES } from './calendarUtils'
import { TodayMobile } from './TodayMobile'

/** Línea luminosa que marca la hora actual sobre la espina del turno. */
function NowLine({ label }: { label: string }) {
  return (
    <div className="relative z-20 -ml-[5px] flex items-center">
      <span className="rounded-full border border-blue-300/30 bg-blue-500 px-3 py-1 text-[10px] font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.8)] backdrop-blur-md">
        {label}
      </span>
      <div className="ml-2 h-px flex-1 bg-gradient-to-r from-blue-500 to-transparent shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
      <div className="-ml-1.5 h-2.5 w-2.5 rounded-full border border-white/50 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,1)]" />
    </div>
  )
}

/** Tarjeta de evento, anclada a la espina del turno (glow azul a la izquierda). */
function EventRow({ item, active, actions }: { item: CalendarItem; active: boolean; actions: CalendarItemActions }) {
  const isCall = item.location
    ? /zoom|meet|teams|video|llamada|call/.test(item.location.toLowerCase())
    : true
  return (
    <div
      onClick={() => actions.onOpen(item)}
      className={`glass-panel-hover glass-card glow-border-left -ml-[5px] flex cursor-pointer items-start gap-6 rounded-2xl p-5 ${
        active ? 'border-blue-500/20 bg-blue-900/10' : ''
      }`}
    >
      <div className="w-24 shrink-0">
        <span className="block text-sm font-bold text-white drop-shadow-sm">{item.time ?? 'Día'}</span>
        {item.endTime && (
          <span className={`mt-1 block text-xs font-medium ${active ? 'text-blue-200/80' : 'text-slate-400'}`}>
            {item.endTime}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="mb-2.5 truncate text-base font-semibold text-white">{item.title}</h4>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5 rounded-md border border-white/5 bg-white/5 px-2.5 py-1">
            <span className="material-symbols-outlined text-[14px] text-blue-400">
              {isCall ? 'videocam' : 'location_on'}
            </span>
            <span className="truncate max-w-[200px]">{item.location ?? 'Zoom'}</span>
          </span>
          <div className="flex -space-x-2">
            <div className="grid h-6 w-6 place-items-center rounded-full border border-ui-card bg-slate-600 text-[9px] font-bold text-white shadow-sm">JD</div>
            <div className="grid h-6 w-6 place-items-center rounded-full border border-ui-card bg-blue-600 text-[9px] font-bold text-white shadow-sm">+4</div>
          </div>
        </div>
      </div>
      <div className="shrink-0">
        <span className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300 shadow-inner">
          {item.durationMin ?? 60} MIN
        </span>
      </div>
    </div>
  )
}

/** Tarjeta de tarea, indentada respecto a la espina del turno. */
function TaskRow({ item, actions }: { item: CalendarItem; actions: CalendarItemActions }) {
  const isCompleted = item.task?.status === 'completada'
  const isCritical = item.priority === 'critica' && !isCompleted
  return (
    <div
      onClick={() => actions.onOpen(item)}
      className={`glass-panel-hover glass-card ml-4 flex cursor-pointer items-center gap-6 rounded-2xl p-5 ${
        isCompleted ? 'opacity-70 hover:opacity-100' : ''
      }`}
    >
      <div className="w-20 shrink-0">
        <span className={`block text-sm font-semibold ${isCompleted ? 'text-slate-400' : 'text-white drop-shadow-sm'}`}>
          {item.time ?? 'Día'}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (item.task) actions.onCompleteTask(item.task)
          }}
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all ${
            isCompleted
              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'border-white/30 bg-white/5 text-transparent shadow-inner hover:border-blue-400 hover:bg-blue-500/10'
          }`}
        >
          <span className="material-symbols-outlined text-[14px] font-black">check</span>
        </button>
        <span className={`truncate text-sm font-medium ${isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
          {item.title}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {isCritical && (
          <div
            className="grid h-6 w-6 place-items-center rounded-full border border-red-500/30 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
            title="Prioridad crítica"
          >
            <span className="material-symbols-outlined text-[14px] text-red-400">priority_high</span>
          </div>
        )}
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          title="Más opciones"
        >
          <span className="material-symbols-outlined text-[18px]">more_vert</span>
        </button>
      </div>
    </div>
  )
}

function renderSectionItems(sectionItems: CalendarItem[], nowMin: number, isCurrentSection: boolean, actions: CalendarItemActions) {
  const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (sectionItems.length === 0) {
    return (
      <div className="ml-2 flex flex-col gap-2 border-l border-white/5 pl-4">
        {isCurrentSection && <NowLine label={nowFormatted} />}
        <p className="py-8 text-center text-xs font-medium text-slate-500/70">
          No hay eventos programados en este bloque
        </p>
      </div>
    )
  }

  let lineRendered = false

  return (
    <div className="relative ml-2 flex flex-col gap-4 border-l border-white/5 pl-4">
      {sectionItems.map((item) => {
        const showLineBefore = isCurrentSection && !lineRendered && item.sortMinutes >= nowMin
        if (showLineBefore) lineRendered = true
        const end = item.sortMinutes + (item.durationMin ?? 60)
        const active = item.time !== null && item.sortMinutes <= nowMin && nowMin < end

        return (
          <Fragment key={`section-item-${item.id}`}>
            {showLineBefore && <NowLine label={nowFormatted} />}
            {item.kind === 'evento' ? (
              <EventRow item={item} active={active} actions={actions} />
            ) : (
              <TaskRow item={item} actions={actions} />
            )}
          </Fragment>
        )
      })}
      {isCurrentSection && !lineRendered && <NowLine label={nowFormatted} />}
    </div>
  )
}

export function TodayView({
  items,
  tasks: _tasks,
  filter: _filter,
  actions,
}: {
  items: CalendarItem[]
  tasks: Task[]
  filter: ItemFilter
  actions: CalendarItemActions
  onSlotClick?: (dayKey: string, time: string) => void
}) {
  const today = todayKey()
  const todays = items.filter((i) => i.dayKey === today)
  
  const eventsCount = todays.filter((i) => i.kind === 'evento' && i.event?.status !== 'cancelado').length
  const todaysTasks = todays.filter((i) => i.kind === 'tarea' && i.task)
  const pendingTasksCount = todaysTasks.filter((i) => i.task?.status && OPEN_TASK_STATUSES.includes(i.task.status)).length

  const completedCount = todaysTasks.filter((i) => i.task?.status === 'completada').length
  const totalTasks = todaysTasks.length
  const pct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : (eventsCount > 0 ? 100 : 0)

  const nowMin = minutesFromIso(new Date().toISOString())
  const isMorningNow = nowMin < 720
  const isAfternoonNow = nowMin >= 720 && nowMin < 1140
  const isNightNow = nowMin >= 1140

  const timed = todays.filter((i) => i.time !== null).sort((a, b) => a.sortMinutes - b.sortMinutes)
  const allDay = todays.filter((i) => i.time === null)

  const morningItems = [...allDay, ...timed.filter((i) => i.sortMinutes < 720)]
  const afternoonItems = timed.filter((i) => i.sortMinutes >= 720 && i.sortMinutes < 1140)
  const nightItems = timed.filter((i) => i.sortMinutes >= 1140)

  return (
    <>
      <TodayMobile items={items} actions={actions} />

      <div className="hidden md:flex flex-col gap-8 pb-16 max-w-5xl mx-auto w-full animate-fade-in px-2">
        <div className="flex flex-col gap-8">
          {/* Tarjeta "Resumen de hoy" idéntica al mockup de Stitch */}
          <div className="glass-panel-hover glass-card rounded-3xl p-8 border border-blue-500/30 shadow-2xl relative overflow-hidden bg-gradient-to-br from-ui-card/95 via-[#131f38]/85 to-ui-bg/95 backdrop-blur-2xl">
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Resumen de hoy</span>
                </h2>
                <p className="text-sm font-bold text-slate-300 mt-1.5">
                  <span className="text-blue-400 font-extrabold">{eventsCount} eventos</span>
                  <span className="mx-2.5 text-slate-600">•</span>
                  <span>{pendingTasksCount} tareas</span>
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">COMPLETADO</span>
                <p className="text-3xl font-black text-white tracking-tight mt-0.5 tabular-nums">{pct}%</p>
              </div>
            </div>

            {/* Barra de progreso radiante estilo DÍA */}
            <div className="relative mt-6 h-2.5 w-full overflow-hidden rounded-full border border-white/5 bg-black/40 shadow-inner">
              <div
                className="relative h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-400 shadow-[0_0_15px_rgba(59,130,246,0.8)] transition-all duration-700"
                style={{ width: `${Math.max(5, pct)}%` }}
              >
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/40 to-transparent" />
              </div>
            </div>
          </div>

          {/* Línea de tiempo: siempre visible. Los bloques sin eventos muestran su placeholder. */}
          <div className="flex flex-col gap-8 pl-1 sm:pl-2">
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-4 py-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">MAÑANA</span>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-800 via-slate-800/50 to-transparent" />
                </div>
                {renderSectionItems(morningItems, nowMin, isMorningNow, actions)}
              </section>

              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-4 py-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">TARDE</span>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-800 via-slate-800/50 to-transparent" />
                </div>
                {renderSectionItems(afternoonItems, nowMin, isAfternoonNow, actions)}
              </section>

              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-4 py-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">NOCHE</span>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-800 via-slate-800/50 to-transparent" />
                </div>
                {renderSectionItems(nightItems, nowMin, isNightNow, actions)}
              </section>
          </div>
        </div>
      </div>
    </>
  )
}
