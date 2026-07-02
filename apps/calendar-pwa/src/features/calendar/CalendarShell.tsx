import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { PRIORITY_LABELS } from '../../lib/domain/types'
import { useCalendarSidebar } from '../../app/CalendarSidebarContext'
import { BottomNavBar } from '../../components/BottomNavBar'
import { FormModal } from '../../components/FormModal'
import { addDays, addMonths, todayKey, weekKeys } from '../../lib/dates/dateUtils'
import { EventForm } from '../events/EventForm'
import type { CalendarEvent, EventFormValues } from '../events/types'
import { TaskForm } from '../tasks/TaskForm'
import type { Task, TaskFormValues } from '../tasks/types'
import type { CalendarItemActions } from './CalendarItemCard'
import type { CalendarItem, CalendarViewId, ItemFilter } from './calendarTypes'
import { buildItems } from './calendarUtils'
import { DayTimeline } from './DayTimeline'
import { MonthView } from './MonthView'
import { TimeGrid } from './TimeGrid'
import { TodayView } from './TodayView'

interface CalendarShellProps {
  events: CalendarEvent[]
  tasks: Task[]
  onCreateEvent: (values: EventFormValues) => Promise<void>
  onUpdateEvent: (id: string, values: EventFormValues) => Promise<void>
  onCreateTask: (values: TaskFormValues) => Promise<void>
  onUpdateTask: (id: string, values: TaskFormValues) => Promise<void>
  onCompleteTask: (task: Task) => void
  onPostponeTask: (task: Task) => void
  onDeleteEvent: (event: CalendarEvent) => void
  onDeleteTask: (task: Task) => void
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

function getHeaderTitle(view: CalendarViewId, anchorKey: string) {
  const d = new Date(`${anchorKey}T12:00:00Z`)
  if (view === 'hoy' || view === 'dia') {
    const s = new Intl.DateTimeFormat('es-CO', {
      timeZone: 'UTC',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d)
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  if (view === 'mes') {
    const s = new Intl.DateTimeFormat('es-CO', {
      timeZone: 'UTC',
      month: 'long',
      year: 'numeric',
    }).format(d)
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  const week = weekKeys(anchorKey)
  const d1 = new Date(`${week[0]}T12:00:00Z`)
  const d2 = new Date(`${week[6]}T12:00:00Z`)
  const f1 = new Intl.DateTimeFormat('es-CO', { timeZone: 'UTC', day: 'numeric', month: 'short' }).format(d1)
  const f2 = new Intl.DateTimeFormat('es-CO', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' }).format(d2)
  return `${f1} - ${f2}`
}

export function CalendarShell(props: CalendarShellProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState<CalendarViewId>('hoy')
  const [anchorKey, setAnchorKey] = useState(todayKey)
  const filter: ItemFilter = 'todos'
  const [panel, setPanel] = useState<FormPanel>(null)
  // Valores prellenados al crear desde un hueco (fecha + hora).
  const [createPrefill, setCreatePrefill] = useState<{ date: string; time?: string } | null>(null)
  const [selectedItemDetail, setSelectedItemDetail] = useState<CalendarItem | null>(null)
  // Confirmación de borrado dentro del panel de detalle (dos pasos, apto para táctil).
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { events, tasks } = props
  const items = useMemo(() => buildItems(events, tasks), [events, tasks])

  // Publica datos a la barra lateral (widgets Próximos/Pendientes/Estadísticas).
  const { setData } = useCalendarSidebar()
  const openItem = useCallback((item: CalendarItem) => {
    setConfirmDelete(false)
    setSelectedItemDetail(item)
  }, [])
  const onCompleteRef = useRef(props.onCompleteTask)
  onCompleteRef.current = props.onCompleteTask
  const stableComplete = useCallback((task: Task) => onCompleteRef.current(task), [])

  useEffect(() => {
    setData({ items, tasks, onOpen: openItem, onCompleteTask: stableComplete })
  }, [items, tasks, openItem, stableComplete, setData])

  useEffect(() => () => setData(null), [setData])

  // Crear o editar vía URL params (/app?create=evento o /app?edit=evento&id=...)
  useEffect(() => {
    const create = searchParams.get('create')
    const edit = searchParams.get('edit')
    const id = searchParams.get('id')

    if (create === 'evento') {
      queueMicrotask(() => {
        setPanel({ type: 'event', editing: null })
        setSearchParams({}, { replace: true })
      })
      return
    }
    if (create === 'tarea') {
      queueMicrotask(() => {
        setPanel({ type: 'task', editing: null })
        setSearchParams({}, { replace: true })
      })
      return
    }

    if (!edit || !id) return
    const event = edit === 'evento' ? props.events.find((e) => e.id === id) : undefined
    const task = edit === 'tarea' ? props.tasks.find((t) => t.id === id) : undefined
    queueMicrotask(() => {
      if (event) setPanel({ type: 'event', editing: event })
      else if (task) setPanel({ type: 'task', editing: task })
      setSearchParams({}, { replace: true })
    })
  }, [searchParams, props.events, props.tasks, setSearchParams])

  function changeView(next: CalendarViewId) {
    setView(next)
  }

  function navigateDate(direction: -1 | 1) {
    if (view === 'dia') setAnchorKey((k) => addDays(k, direction))
    else if (view === 'semana') setAnchorKey((k) => addDays(k, direction * 7))
    else if (view === 'mes') setAnchorKey((k) => addMonths(k, direction))
  }

  function goToDay(dayKey: string) {
    setAnchorKey(dayKey)
    setView('dia')
  }

  function closePanel() {
    setPanel(null)
    setCreatePrefill(null)
  }

  // Crear: abre el modal (evento por defecto; se cambia a tarea con las pestañas).
  function openCreate(prefill?: { date: string; time?: string }) {
    setCreatePrefill(prefill ?? null)
    setPanel({ type: 'event', editing: null })
  }
  const openCreateAt = (dayKey: string, time: string) => openCreate({ date: dayKey, time })

  async function handleEventSubmit(values: EventFormValues) {
    if (panel?.type === 'event' && panel.editing) {
      await props.onUpdateEvent(panel.editing.id, values)
    } else {
      await props.onCreateEvent(values)
    }
    closePanel()
  }

  async function handleTaskSubmit(values: TaskFormValues) {
    if (panel?.type === 'task' && panel.editing) {
      await props.onUpdateTask(panel.editing.id, values)
    } else {
      await props.onCreateTask(values)
    }
    closePanel()
  }

  const actions: CalendarItemActions = {
    onOpen: openItem,
    onCompleteTask: props.onCompleteTask,
    onPostponeTask: props.onPostponeTask,
  }

  // Contenido de la cabecera de escritorio (fecha + selector de vistas + navegación).
  // Calcado del mockup: fecha y pastilla de cristal agrupadas a la izquierda;
  // la navegación de fecha (esquina derecha) solo aparece fuera de "Hoy".
  const headerInner = (
    <>
      <div className="flex min-w-0 items-center gap-5 lg:gap-8">
        <h1 className="truncate text-lg lg:text-xl font-bold tracking-tight text-white first-letter:uppercase drop-shadow-md">
          {getHeaderTitle(view, anchorKey)}
        </h1>

        <nav className="glass-panel-hover glass-card flex shrink-0 items-center gap-1 rounded-xl p-1 shadow-lg">
          {VIEWS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => changeView(id)}
              className={`rounded-lg px-4 lg:px-5 py-2 text-xs font-semibold transition-all duration-200 ${
                view === id
                  ? 'border border-blue-400/30 bg-blue-600/90 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {view !== 'hoy' && (
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => navigateDate(-1)}
              title="Anterior"
              className="glass-panel-hover glass-card flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => navigateDate(1)}
              title="Siguiente"
              className="glass-panel-hover glass-card flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setAnchorKey(todayKey())}
            title="Ir a hoy"
            className="flex h-9 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-bold tracking-wide text-white transition-colors hover:bg-white/20 press"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-400">calendar_today</span>
            HOY
          </button>
        </div>
      )}
    </>
  )

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-transparent">
      {/* Barra de fecha móvil (Día/Semana/Mes): título + navegación. El cambio de
          vista vive en la BottomNavBar; aquí solo navegamos fechas. */}
      {view !== 'hoy' && (
        <div className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-ui-line/50 bg-ui-panel/85 px-4 py-3 backdrop-blur-2xl md:hidden">
          <h2 className="min-w-0 truncate text-base font-bold tracking-tight text-white first-letter:uppercase">
            {getHeaderTitle(view, anchorKey)}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => navigateDate(-1)}
              title="Anterior"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#c3c6d7] transition-colors hover:bg-white/10 hover:text-white press"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => navigateDate(1)}
              title="Siguiente"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#c3c6d7] transition-colors hover:bg-white/10 hover:text-white press"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
            <button
              type="button"
              onClick={() => setAnchorKey(todayKey())}
              title="Ir a hoy (en esta vista)"
              className="flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-bold tracking-wide text-white transition-colors hover:bg-white/10 press"
            >
              <span className="material-symbols-outlined text-[16px] text-[#60a5fa]">calendar_today</span>
              HOY
            </button>
          </div>
        </div>
      )}

      {view === 'hoy' ? (
        /* Hoy: la cabecera (fecha + vistas) es sticky con fondo opaco y el contenido
           se desliza por detrás (scroll en <main>), desapareciendo limpio. */
        <>
          <header className="hidden shrink-0 items-center justify-between gap-4 bg-transparent px-6 lg:px-10 py-5 lg:py-6 select-none md:flex">
            {headerInner}
          </header>
          <div className="animate-fade-in">
            <TodayView
              items={items}
              tasks={tasks}
              filter={filter}
              actions={actions}
              onSlotClick={openCreateAt}
            />
          </div>
        </>
      ) : (
        <>
          <header className="hidden shrink-0 items-center justify-between gap-4 bg-transparent px-6 lg:px-10 py-5 lg:py-6 select-none md:flex">
            {headerInner}
          </header>
          <div
            key={`${view}-${anchorKey}`}
            className="relative z-10 min-h-0 flex-1 overflow-y-auto animate-fade-in"
          >
            {view === 'dia' && (
              <DayTimeline
                items={items}
                dayKey={anchorKey}
                onItemClick={openItem}
                onSlotClick={openCreateAt}
              />
            )}
            {view === 'semana' && (
              <TimeGrid
                items={items}
                days={weekKeys(anchorKey)}
                filter={filter}
                onItemClick={openItem}
                onSelectDay={goToDay}
                onSlotClick={openCreateAt}
              />
            )}
            {view === 'mes' && (
              <MonthView items={items} anchorKey={anchorKey} filter={filter} onSelectDay={goToDay} onItemClick={openItem} />
            )}
          </div>
        </>
      )}

      {/* FAB: abre el modal de creación directamente (las pestañas cambian Evento/Tarea) */}
      <button
        type="button"
        onClick={() => openCreate()}
        aria-label="Crear evento o tarea"
        className="press fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] right-4 z-40 grid h-14 w-14 place-items-center rounded-full border border-blue-400/30 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_10px_25px_rgba(59,130,246,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] transition hover:scale-105 hover:from-blue-400 hover:to-indigo-500 md:bottom-8 md:right-8"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>

      <BottomNavBar view={view} onChange={changeView} />

      {/* Modal premium de creación/edición con pestañas Evento/Tarea */}
      <FormModal
        open={panel?.type === 'event' || panel?.type === 'task'}
        title={
          panel?.editing
            ? panel.type === 'event'
              ? 'Editar evento'
              : 'Editar tarea'
            : panel?.type === 'task'
              ? 'Nueva tarea'
              : 'Nuevo evento'
        }
        accent={panel?.type === 'task' ? 'teal' : 'blue'}
        tabs={
          panel && !panel.editing
            ? {
                active: panel.type,
                onSelect: (kind) =>
                  setPanel(kind === 'event' ? { type: 'event', editing: null } : { type: 'task', editing: null }),
              }
            : null
        }
        onClose={closePanel}
      >
        {panel?.type === 'event' && (
          <EventForm
            key={panel.editing?.id ?? 'new-event'}
            initial={panel.editing}
            defaultDate={createPrefill?.date ?? (view === 'hoy' ? todayKey() : anchorKey)}
            defaultTime={createPrefill?.time}
            onSubmit={handleEventSubmit}
            onCancel={closePanel}
          />
        )}
        {panel?.type === 'task' && (
          <TaskForm
            key={panel.editing?.id ?? 'new-task'}
            initial={panel.editing}
            defaultDate={createPrefill?.date ?? (view === 'hoy' ? todayKey() : anchorKey)}
            defaultTime={createPrefill?.time}
            onSubmit={handleTaskSubmit}
            onCancel={closePanel}
          />
        )}
      </FormModal>

      {/* Panel de detalle (calcado del mockup). Clic fuera del panel = cerrar. */}
      {selectedItemDetail &&
        (() => {
          const it = selectedItemDetail
          const isCall = it.location ? /zoom|meet|teams|video|llamada|call/i.test(it.location) : false
          const callUrl = it.location && /^https?:\/\//i.test(it.location) ? it.location : null
          const kindLabel = it.kind === 'evento' ? 'Evento' : 'Tarea'
          const detailDate = new Date(`${it.dayKey}T12:00:00`)
          const dateLabel =
            it.dayKey === todayKey()
              ? `Hoy, ${detailDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`
              : detailDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
          const primaryIsJoin = it.kind === 'evento' && isCall
          // Tema del panel según prioridad: todo el detalle adopta el color.
          const prioThemes: Record<
            string,
            { chip: string; from: string; via: string; orb: string; icon: string; btn: string }
          > = {
            critica: {
              chip: 'border-rose-400/40 bg-rose-500/25 text-rose-100',
              from: 'from-rose-700/55',
              via: 'via-rose-900/40',
              orb: 'bg-rose-500/30',
              icon: 'text-rose-300',
              btn: 'from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500',
            },
            alta: {
              chip: 'border-amber-400/40 bg-amber-500/25 text-amber-100',
              from: 'from-amber-700/45',
              via: 'via-amber-900/35',
              orb: 'bg-amber-500/25',
              icon: 'text-amber-300',
              btn: 'from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500',
            },
            media: {
              chip: 'border-blue-400/40 bg-blue-500/25 text-blue-100',
              from: 'from-blue-700/50',
              via: 'via-indigo-800/40',
              orb: 'bg-blue-500/30',
              icon: 'text-blue-300',
              btn: 'from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500',
            },
            baja: {
              chip: 'border-slate-400/40 bg-slate-500/25 text-slate-100',
              from: 'from-slate-700/50',
              via: 'via-slate-800/40',
              orb: 'bg-slate-500/25',
              icon: 'text-slate-300',
              btn: 'from-slate-500 to-slate-700 hover:from-slate-400 hover:to-slate-600',
            },
          }
          const theme = prioThemes[it.priority] ?? prioThemes.media

          const close = () => {
            setSelectedItemDetail(null)
            setConfirmDelete(false)
          }
          const openEdit = () => {
            close()
            if (it.event) setPanel({ type: 'event', editing: it.event })
            else if (it.task) setPanel({ type: 'task', editing: it.task })
          }
          const removeItem = () => {
            if (it.event) props.onDeleteEvent(it.event)
            else if (it.task) props.onDeleteTask(it.task)
            close()
          }

          return createPortal(
            <div
              className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in"
              onClick={close}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex h-full w-full max-w-md flex-col overflow-hidden border-l border-white/10 bg-ui-panel/95 text-left shadow-2xl backdrop-blur-3xl animate-slide-left select-none md:max-w-lg"
              >
                {/* Cabecera con degradado de aurora */}
                <div className="relative h-44 w-full shrink-0 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${theme.from} ${theme.via} to-ui-panel`} />
                  <div className={`absolute -right-10 -top-10 h-48 w-48 rounded-full blur-3xl ${theme.orb}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-ui-panel via-ui-panel/30 to-transparent" />

                  <button
                    type="button"
                    onClick={close}
                    title="Cerrar"
                    className="absolute right-5 top-5 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 press"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>

                  <div className="absolute inset-x-6 bottom-5 z-10">
                    <div className="mb-2.5 flex items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${theme.chip}`}>
                        {PRIORITY_LABELS[it.priority]}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                        {kindLabel}
                      </span>
                      <span className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                        <span className="material-symbols-outlined text-[12px]">timer</span>
                        {it.durationMin ?? 60} MIN
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-md">
                      {it.title}
                    </h2>
                  </div>
                </div>

                {/* Contenido */}
                <div className="scroll-dark flex-1 space-y-7 overflow-y-auto px-6 py-8">
                  {/* Horario + Ubicación */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Horario</span>
                      <div className="flex items-center gap-3">
                        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 ${theme.icon}`}>
                          <span className="material-symbols-outlined text-[20px]">schedule</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">
                            {it.time ? `${it.time}${it.endTime ? ` - ${it.endTime}` : ''}` : 'Todo el día'}
                          </p>
                          <p className="truncate text-xs text-slate-400 first-letter:uppercase">{dateLabel}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ubicación</span>
                      <div className="flex items-center gap-3">
                        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 ${theme.icon}`}>
                          <span className="material-symbols-outlined text-[20px]">{isCall ? 'videocam' : 'location_on'}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{it.location ?? 'Sin ubicación'}</p>
                          <p className="text-xs text-slate-400">
                            {it.location ? (isCall ? 'Videollamada' : 'Lugar') : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Descripción (notas o placeholder) */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Descripción</span>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className={`text-sm leading-relaxed ${it.notes ? 'text-slate-200' : 'italic text-slate-500'}`}>
                        {it.notes || 'Sin descripción.'}
                      </p>
                    </div>
                  </div>

                  {/* Estado de sincronización real (los ids "local-…" aún no llegan al servidor) */}
                  {(it.event?.id ?? it.task?.id ?? '').startsWith('local-') ? (
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Pendiente de sincronizar
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sincronizado</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div
                  className="flex shrink-0 items-center gap-3 border-t border-white/10 bg-ui-bg/60 px-6 py-5"
                  style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
                >
                  {confirmDelete ? (
                    <>
                      <p className="min-w-0 flex-1 text-sm font-semibold leading-snug text-rose-200">
                        ¿Eliminar {kindLabel.toLowerCase()}? No se puede deshacer.
                      </p>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="flex h-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white press"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={removeItem}
                        className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 text-sm font-bold text-white transition-colors hover:from-rose-400 hover:to-red-500 press"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Eliminar
                      </button>
                    </>
                  ) : (
                    <>
                      {primaryIsJoin && (
                        <button
                          type="button"
                          onClick={openEdit}
                          title="Editar"
                          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white press"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        title="Eliminar"
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 transition-colors hover:bg-rose-500/15 press"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>

                      {primaryIsJoin ? (
                        <button
                          type="button"
                          onClick={() => callUrl && window.open(callUrl, '_blank')}
                          className={`glow-button flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r text-sm font-bold text-white transition-colors press ${theme.btn}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">videocam</span>
                          Unirse a la llamada
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={openEdit}
                          className={`glow-button flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r text-sm font-bold text-white transition-colors press ${theme.btn}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                          Editar {kindLabel.toLowerCase()}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        })()}

    </div>
  )
}
