import { useEffect, useMemo, useRef, useState } from 'react'
import { formatHourLabel, formatTimeLabel, minutesFromIso, todayKey } from '../../lib/dates/dateUtils'
import type { CalendarItem, ItemFilter } from './calendarTypes'
import { applyFilter } from './calendarUtils'

const HOUR_H = 64 // px por hora
const DAY_MIN = 24 * 60

/** Minutos (snap a 30) desde una coordenada Y dentro de la columna del día. */
function snapMinutes(y: number): number {
  return Math.max(0, Math.min(DAY_MIN - 30, Math.round((y / HOUR_H) * 2) * 30))
}

function toHM(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}

const kindCardStyle: Record<CalendarItem['kind'], string> = {
  evento: 'bg-blue-600/25 text-blue-100 border-l-4 border-blue-500 backdrop-blur-md hover:bg-blue-600/35 ring-1 ring-blue-400/20',
  tarea: 'bg-teal-600/25 text-teal-100 border-l-4 border-teal-500 backdrop-blur-md hover:bg-teal-600/35 ring-1 ring-teal-400/20',
}

/** Minutos de inicio/fin (en la zona del producto) de un ítem con hora. */
function bounds(it: CalendarItem): { start: number; end: number } {
  if (it.kind === 'evento' && it.event) {
    const start = minutesFromIso(it.event.starts_at)
    let end = minutesFromIso(it.event.ends_at)
    if (end <= start) end = Math.min(start + 30, DAY_MIN) // cruza medianoche o muy corto
    return { start, end }
  }
  const start = it.sortMinutes
  return { start, end: Math.min(start + 30, DAY_MIN) } // tareas: punto en el tiempo
}

export interface Positioned {
  item: CalendarItem
  start: number
  end: number
  lane: number
  lanes: number
}

/** Asigna columnas (lanes) a eventos que se solapan, estilo Google Calendar. */
export function layout(items: CalendarItem[]): Positioned[] {
  const evs = items
    .map((it) => ({ it, ...bounds(it) }))
    .sort((a, b) => a.start - b.start || a.end - b.end)

  const out: Positioned[] = []
  let cluster: typeof evs = []
  let clusterEnd = -1

  const flush = () => {
    const lanes: (typeof evs)[] = []
    const laneOf = new Map<(typeof evs)[number], number>()
    for (const e of cluster) {
      let placed = false
      for (let i = 0; i < lanes.length; i++) {
        if (lanes[i][lanes[i].length - 1].end <= e.start) {
          lanes[i].push(e)
          laneOf.set(e, i)
          placed = true
          break
        }
      }
      if (!placed) {
        laneOf.set(e, lanes.length)
        lanes.push([e])
      }
    }
    for (const e of cluster) {
      out.push({ item: e.it, start: e.start, end: e.end, lane: laneOf.get(e)!, lanes: lanes.length })
    }
    cluster = []
    clusterEnd = -1
  }

  for (const e of evs) {
    if (cluster.length && e.start >= clusterEnd) flush()
    cluster.push(e)
    clusterEnd = Math.max(clusterEnd, e.end)
  }
  if (cluster.length) flush()
  return out
}

export function TimeGrid({
  items,
  days,
  filter,
  onItemClick,
  onSelectDay,
  onSlotClick,
  showDayHeader = true,
}: {
  items: CalendarItem[]
  days: string[]
  filter: ItemFilter
  onItemClick: (item: CalendarItem) => void
  onSelectDay: (dayKey: string) => void
  /** Click en un hueco vacío: (dayKey, "HH:mm") redondeado a 30 min. */
  onSlotClick?: (dayKey: string, time: string) => void
  /** Oculta la fila de encabezado de días (útil para la vista de un solo día). */
  showDayHeader?: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const today = todayKey()
  const filtered = useMemo(() => applyFilter(items, filter), [items, filter])
  // Hueco resaltado bajo el cursor (solo si la grilla es interactiva).
  const [hover, setHover] = useState<{ day: string; minutes: number } | null>(null)

  const timedByDay = new Map<string, CalendarItem[]>()
  const allDayByDay = new Map<string, CalendarItem[]>()
  for (const it of filtered) {
    const map = it.time === null ? allDayByDay : timedByDay
    const arr = map.get(it.dayKey) ?? []
    arr.push(it)
    map.set(it.dayKey, arr)
  }
  const hasAllDay = [...allDayByDay.values()].some((a) => a.length > 0)

  const nowMin = minutesFromIso(new Date().toISOString())
  const showsToday = days.includes(today)

  // Al montar, centrar la hora actual si hoy está visible (mejor UX que un 7am
  // fijo); si no, posicionar cerca de la mañana laboral.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (showsToday) {
      const target = (nowMin / 60) * HOUR_H - el.clientHeight / 2
      el.scrollTop = Math.max(0, target)
    } else {
      el.scrollTop = 7 * HOUR_H
    }
    // Solo al montar / cambiar de día visible.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showsToday])
  // Columna de horas vía CSS var: 3rem en móvil, 4rem en escritorio (--hourcol
  // se define en el contenedor raíz de la grilla).
  const cols = `var(--hourcol) repeat(${days.length}, minmax(0, 1fr))`
  const weekday = new Intl.DateTimeFormat('es-CO', { timeZone: 'UTC', weekday: 'short' })
  const fmtWeekday = (key: string) =>
    weekday.format(new Date(`${key}T12:00:00Z`)).replace('.', '')

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-2 pb-6 [--hourcol:3rem] md:px-8 md:[--hourcol:4rem]">
      {/* Encabezado de días */}
      {showDayHeader && (
        <div className="grid shrink-0 border-b border-white/5" style={{ gridTemplateColumns: cols }}>
          <div />
          {days.map((d) => {
            const isToday = d === today
            return (
              <button
                key={d}
                onClick={() => onSelectDay(d)}
                className="press relative flex flex-col items-center gap-1.5 py-3 transition hover:bg-white/[0.02]"
              >
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isToday ? 'text-blue-400' : 'text-slate-500'}`}>
                  {fmtWeekday(d)}
                </span>
                {isToday ? (
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                    {Number(d.slice(8, 10))}
                  </span>
                ) : (
                  <span className="grid h-9 w-9 place-items-center text-lg font-bold text-white">
                    {Number(d.slice(8, 10))}
                  </span>
                )}
                {isToday && (
                  <span className="absolute inset-x-[30%] bottom-0 h-1 rounded-t-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Franja "todo el día" / sin hora */}
      {hasAllDay && (
        <div className="grid shrink-0 border-b border-white/5" style={{ gridTemplateColumns: cols }}>
          <div className="py-1.5 pr-2 text-right text-[10px] leading-tight text-slate-500">
            todo el día
          </div>
          {days.map((d) => (
            <div key={d} className="flex flex-col gap-1 border-l border-white/5 p-1.5">
              {(allDayByDay.get(d) ?? []).map((it) => (
                <button
                  key={`${it.kind}-${it.id}`}
                  onClick={() => onItemClick(it)}
                  className={`press truncate rounded-md px-2 py-1 text-left text-[11px] font-medium transition-all ${kindCardStyle[it.kind]}`}
                >
                  {it.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Grilla horaria */}
      <div ref={scrollRef} className="scroll-dark relative min-h-0 flex-1 overflow-y-auto pb-20 pt-3 md:pb-0">
        <div className="relative grid" style={{ gridTemplateColumns: cols, height: (DAY_MIN / 60) * HOUR_H }}>
          {/* Columna de horas */}
          <div className="relative">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} style={{ height: HOUR_H }} className="relative">
                <span className="absolute right-1.5 top-0 -translate-y-1/2 text-[10px] font-bold uppercase text-slate-500 md:right-3">
                  {h === 0 ? '' : formatHourLabel(h)}
                </span>
              </div>
            ))}
          </div>

          {/* Columnas de días */}
          {days.map((d) => {
            const positioned = layout(timedByDay.get(d) ?? [])
            const isToday = d === today
            return (
              <div
                key={d}
                onClick={(e) => {
                  if (!onSlotClick) return
                  const rect = e.currentTarget.getBoundingClientRect()
                  onSlotClick(d, toHM(snapMinutes(e.clientY - rect.top)))
                }}
                onMouseMove={
                  onSlotClick
                    ? (e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setHover({ day: d, minutes: snapMinutes(e.clientY - rect.top) })
                      }
                    : undefined
                }
                onMouseLeave={
                  onSlotClick ? () => setHover((h) => (h?.day === d ? null : h)) : undefined
                }
                className={`relative select-none border-l border-white/5 ${onSlotClick ? 'cursor-pointer' : ''} ${isToday ? 'bg-blue-500/[0.04]' : ''}`}
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <div
                    key={h}
                    style={{ top: h * HOUR_H }}
                    className="absolute inset-x-0 border-t border-white/5"
                  />
                ))}

                {hover?.day === d && (
                  <div
                    style={{ top: (hover.minutes / 60) * HOUR_H, height: HOUR_H / 2 }}
                    className="pointer-events-none absolute inset-x-1 z-[5] flex items-start rounded-lg bg-blue-500/20 px-2 py-0.5 ring-1 ring-inset ring-blue-400/50 backdrop-blur-sm"
                  >
                    <span className="text-[10px] font-bold tabular-nums text-blue-200">
                      {formatTimeLabel(toHM(hover.minutes))}
                    </span>
                  </div>
                )}

                {positioned.map(({ item, start, end, lane, lanes }) => {
                  const top = (start / 60) * HOUR_H
                  const height = Math.max(((end - start) / 60) * HOUR_H, 30)
                  const widthPct = 100 / lanes
                  const completed = item.task?.status === 'completada'
                  const location = item.event?.location
                  const durMin = end - start
                  const isEvent = item.kind === 'evento'
                  // Color según prioridad (no por tipo): crítica roja, alta ámbar, media azul, baja gris.
                  const prioCard: Record<string, string> = {
                    critica: 'border-rose-500 bg-rose-600/15 ring-rose-400/25',
                    alta: 'border-amber-500 bg-amber-600/15 ring-amber-400/25',
                    media: 'border-blue-500 bg-blue-600/15 ring-blue-400/25',
                    baja: 'border-slate-400 bg-slate-600/20 ring-slate-400/20',
                  }
                  const cardStyle = prioCard[item.priority] ?? prioCard.media
                  return (
                    <button
                      key={`${item.kind}-${item.id}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onItemClick(item)
                      }}
                      onMouseEnter={onSlotClick ? () => setHover(null) : undefined}
                      onMouseMove={onSlotClick ? (e) => e.stopPropagation() : undefined}
                      style={{
                        top,
                        height,
                        left: `calc(${lane * widthPct}% + 4px)`,
                        width: `calc(${widthPct}% - 8px)`,
                      }}
                      className={`group press absolute z-10 flex flex-col overflow-hidden rounded-lg border-l-4 px-1.5 py-1.5 text-left leading-tight shadow-lg ring-1 backdrop-blur-md transition-all hover:brightness-110 md:rounded-xl md:px-3 md:py-2 ${cardStyle} ${
                        completed ? 'opacity-40 line-through' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="truncate text-xs font-bold text-white">{item.title}</span>
                        {isEvent && height > 50 && (
                          <span className="shrink-0 text-[9px] font-bold text-white/60">{durMin}m</span>
                        )}
                      </div>
                      {height > 44 && (
                        <span className="mt-0.5 truncate text-[10px] tabular-nums text-slate-300/80">
                          {item.time}
                          {item.endTime ? ` - ${item.endTime}` : ''}
                        </span>
                      )}
                      {location && height > 70 && (
                        <span className="mt-1 flex items-center gap-1 truncate text-[10px] text-slate-400">
                          <span className="material-symbols-outlined text-[12px]">location_on</span>
                          {location}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}

          {/* Línea "Ahora" cruzando toda la semana, con pill en la columna de horas */}
          {showsToday && (
            <div
              className="pointer-events-none absolute inset-x-0 z-[5] flex items-center"
              style={{ top: (nowMin / 60) * HOUR_H }}
            >
              <span className="flex w-[var(--hourcol)] justify-end pr-1 md:pr-2">
                <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white shadow-[0_0_10px_rgba(37,99,235,0.6)]">
                  {toHM(nowMin)}
                </span>
              </span>
              <div className="relative h-px flex-1 bg-gradient-to-r from-blue-500 to-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full border border-white/40 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
