import { minutesFromIso, todayKey } from '../../lib/dates/dateUtils'
import { useAuth } from '../auth/useAuth'
import type { CalendarItemActions } from './CalendarItemCard'
import type { CalendarItem } from './calendarTypes'
import { OPEN_TASK_STATUSES } from './calendarUtils'
import { firstNameOf, greetingFor, untilLabel } from './todayUtils'

const CARD = 'rounded-2xl border border-ui-line/40 bg-ui-card/60 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)]'

/** Convierte minutos desde medianoche a { hm: "01:00", ap: "PM" }.
    (item.time es una etiqueta tipo "4 p.m.", no parseable; sortMinutes sí es numérico.) */
function to12(item: CalendarItem) {
  if (item.time === null) return { hm: 'Día', ap: '' }
  const h = Math.floor(item.sortMinutes / 60)
  const m = item.sortMinutes % 60
  const ap = h >= 12 ? 'PM' : 'AM'
  const h12 = ((h + 11) % 12) + 1
  return { hm: `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}`, ap }
}

/** Icono según el tipo/título del evento. */
function iconFor(item: CalendarItem) {
  if (item.kind === 'tarea') return 'task_alt'
  const t = `${item.title} ${item.location ?? ''}`.toLowerCase()
  if (/reuni|equipo|meet|junta|stand/.test(t)) return 'groups'
  if (/almuerzo|cena|comida|desayuno|restaur|café|cafe/.test(t)) return 'restaurant'
  if (/zoom|meet|video|llamada|call/.test(t)) return 'videocam'
  if (/médic|medic|cita|dentista|salud/.test(t)) return 'medical_services'
  return 'event'
}

function durationLabel(min?: number) {
  if (!min) return ''
  if (min < 60) return `${min}m`
  const h = min / 60
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`
}

/**
 * Dashboard "Hoy" para móvil: Resumen del Día (stats + progreso),
 * Agenda (timeline con indicador de hora actual) y Tareas Rápidas.
 */
export function TodayMobile({
  items,
  actions,
}: {
  items: CalendarItem[]
  actions: CalendarItemActions
}) {
  const { user } = useAuth()
  const firstName = firstNameOf(user)
  const greeting = greetingFor(new Date().getHours())

  const today = todayKey()
  const todays = items.filter((i) => i.dayKey === today)

  const taskItems = todays.filter((i) => i.kind === 'tarea' && i.task)
  const completed = taskItems.filter((i) => i.task?.status === 'completada').length
  const pending = taskItems.filter((i) => i.task && OPEN_TASK_STATUSES.includes(i.task.status)).length
  const total = completed + pending
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  const nowMin = minutesFromIso(new Date().toISOString())
  const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Agenda: eventos y tareas con hora, ordenados.
  const agenda = todays
    .filter((i) => i.time !== null)
    .sort((a, b) => a.sortMinutes - b.sortMinutes)
  const firstFutureIdx = agenda.findIndex((i) => i.sortMinutes >= nowMin)
  const nextUp = agenda.find(
    (i) => i.sortMinutes >= nowMin && !(i.kind === 'tarea' && i.task?.status === 'completada'),
  )

  // Tareas rápidas: tareas de hoy (o, si no hay, todas las abiertas/cerradas más recientes).
  const quickTasks = (taskItems.length > 0 ? taskItems : items.filter((i) => i.kind === 'tarea' && i.task)).slice(0, 6)

  return (
    <div className="flex flex-col gap-8 px-4 pb-28 pt-4 md:hidden animate-fade-in">
      {/* ===== Saludo ===== */}
      <header className="flex flex-col gap-0.5 pt-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          {greeting}{firstName ? <span className="text-blue-400">, {firstName}</span> : null}
        </h1>
        {nextUp ? (
          <p className="text-sm font-medium text-slate-400">
            Lo siguiente <span className="font-bold text-slate-200">{untilLabel(nextUp.sortMinutes - nowMin)}</span>
          </p>
        ) : (
          <p className="text-sm font-medium text-slate-400">
            {agenda.length === 0 ? 'Día despejado, sin eventos.' : 'Sin nada pendiente por ahora.'}
          </p>
        )}
      </header>

      {/* ===== Resumen del Día ===== */}
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-bold text-white">Resumen del Día</h2>
          <span className="rounded-full bg-blue-500/15 px-2 py-1 text-xs font-medium text-blue-400">
            {pct}% completado
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`${CARD} relative flex flex-col gap-2 overflow-hidden p-4`}>
            <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-blue-500/10" />
            <div className="z-10 mb-2 grid h-8 w-8 place-items-center rounded-full bg-blue-500/15">
              <span className="material-symbols-outlined text-sm text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <div className="z-10">
              <p className="text-3xl font-extrabold tracking-tight text-white tabular-nums">{completed}</p>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">Completadas</p>
            </div>
          </div>

          <div className={`${CARD} relative flex flex-col gap-2 overflow-hidden p-4`}>
            <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-sky-500/10" />
            <div className="z-10 mb-2 grid h-8 w-8 place-items-center rounded-full bg-sky-500/20">
              <span className="material-symbols-outlined text-sm text-sky-400">schedule</span>
            </div>
            <div className="z-10">
              <p className="text-3xl font-extrabold tracking-tight text-white tabular-nums">{pending}</p>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">Pendientes</p>
            </div>
          </div>
        </div>

        <div className="mt-1 h-2 w-full overflow-hidden rounded-full border border-white/5 bg-ui-chip shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-700"
            style={{ width: `${Math.max(4, pct)}%` }}
          />
        </div>
      </section>

      {/* ===== Agenda ===== */}
      <section className="flex flex-col gap-5">
        <h2 className="text-lg font-bold text-white">Agenda</h2>

        {agenda.length === 0 ? (
          <div className={`${CARD} flex flex-col items-center gap-3 p-8 text-center`}>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-400">
              <span className="material-symbols-outlined">event_available</span>
            </span>
            <p className="text-sm font-semibold text-white">Sin eventos con hora hoy</p>
            <p className="text-xs text-slate-400">Toca el botón + para agendar algo.</p>
          </div>
        ) : (
          <div className="relative ml-2 flex flex-col gap-6">
            {/* Línea vertical del timeline (entre la hora y la tarjeta, sin pisar el texto) */}
            <div className="absolute bottom-2 left-[69px] top-2 -z-10 w-[2px] bg-ui-line" />

            {agenda.map((item, idx) => {
              // Pasado = ya terminó (no tachar un evento que está en curso).
              const past = item.sortMinutes + (item.durationMin ?? 60) <= nowMin
              const active = idx === firstFutureIdx
              const { hm, ap } = to12(item)
              return (
                <div key={`m-agenda-${item.id}`} className="flex flex-col gap-6">
                  {/* Indicador de hora actual, antes del primer evento futuro */}
                  {active && (
                    <div className="relative z-10 flex w-full items-center gap-2 px-2">
                      <div className="shrink-0 whitespace-nowrap rounded-md bg-blue-500 px-2 py-1 text-[0.65rem] font-bold text-white shadow-sm">
                        {nowLabel}
                      </div>
                      <div className="relative h-[2px] flex-1 bg-blue-500">
                        <div className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                      </div>
                      <span className="shrink-0 text-[0.65rem] font-bold uppercase tracking-widest text-blue-400">Ahora</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => actions.onOpen(item)}
                    className={`press relative flex gap-4 text-left ${past ? 'opacity-60' : ''}`}
                  >
                    <div className="flex w-16 shrink-0 flex-col items-center pr-2 text-right">
                      <span className={`text-xs font-bold ${past ? 'text-slate-400' : 'text-white'}`}>{hm}</span>
                      <span className="text-[0.6rem] font-medium text-slate-400">{ap}</span>
                    </div>

                    {/* Punto en la línea */}
                    <div
                      className={`absolute top-1.5 h-[10px] w-[10px] rounded-full border-2 ${
                        active
                          ? 'left-[65px] border-blue-500 bg-ui-card ring-4 ring-blue-500/15'
                          : past
                            ? 'left-[66px] border-ui-bg bg-slate-500'
                            : 'left-[66px] border-ui-bg bg-blue-500'
                      }`}
                    />

                    <div
                      className={`${CARD} ml-2 flex flex-1 items-center gap-3 p-4 ${
                        active ? 'border-l-4 border-l-blue-500 shadow-lg shadow-blue-500/10' : ''
                      }`}
                    >
                      <div
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                          active ? 'bg-blue-500/15' : 'bg-ui-chip'
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined ${active ? 'text-blue-400' : 'text-slate-400'}`}
                          style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                          {iconFor(item)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-bold ${past ? 'text-slate-400 line-through decoration-1' : 'text-white'}`}>
                          {item.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-400">
                          {item.location && <span className="material-symbols-outlined text-[10px]">location_on</span>}
                          <span className="truncate">
                            {[item.location, durationLabel(item.durationMin)].filter(Boolean).join(' · ')}
                          </span>
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ===== Tareas Rápidas ===== */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-white">Tareas Rápidas</h2>
        {quickTasks.length === 0 ? (
          <div className={`${CARD} flex flex-col items-center gap-3 p-8 text-center`}>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
            </span>
            <p className="text-sm font-semibold text-white">Todo al día</p>
            <p className="text-xs text-slate-400">No tienes tareas pendientes.</p>
          </div>
        ) : (
          <div className={`${CARD} flex flex-col divide-y divide-ui-line p-2`}>
            {quickTasks.map((item) => {
              const done = item.task?.status === 'completada'
              return (
                <label
                  key={`m-task-${item.id}`}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors hover:bg-ui-chip/50 ${
                    done ? 'opacity-60' : ''
                  }`}
                >
                  <span className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => item.task && actions.onCompleteTask(item.task)}
                      className={`h-5 w-5 appearance-none rounded border-2 transition-all ${
                        done ? 'border-slate-500 bg-slate-500' : 'border-ui-line bg-transparent'
                      }`}
                    />
                    {done && (
                      <span
                        className="material-symbols-outlined pointer-events-none absolute text-sm text-ui-bg"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check
                      </span>
                    )}
                  </span>
                  <span className={`text-sm font-medium ${done ? 'text-slate-400 line-through' : 'text-white'}`}>
                    {item.title}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
