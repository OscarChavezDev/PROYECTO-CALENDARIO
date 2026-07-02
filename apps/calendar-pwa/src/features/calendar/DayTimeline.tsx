import { useEffect, useRef, useState } from 'react'
import { formatTimeLabel, minutesFromIso, todayKey } from '../../lib/dates/dateUtils'
import type { CalendarItem } from './calendarTypes'
import { layout } from './TimeGrid'

const HOUR_H = 96 // px por hora
const DAY_MIN = 24 * 60

/** Minutos (snap a 30) desde una coordenada Y dentro del timeline. */
function snapMinutes(y: number): number {
  return Math.max(0, Math.min(DAY_MIN - 30, Math.round((y / HOUR_H) * 2) * 30))
}

function toHM(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}

function hourLabel(h: number) {
  const ap = h < 12 ? 'AM' : 'PM'
  const h12 = ((h + 11) % 12) + 1
  return `${String(h12).padStart(2, '0')}:00 ${ap}`
}

function durLabel(min: number) {
  return `${min} MIN`
}

function iconFor(item: CalendarItem) {
  const t = `${item.title} ${item.location ?? ''}`.toLowerCase()
  if (/zoom|meet|video|llamada|call/.test(t)) return 'videocam'
  return 'location_on'
}

/**
 * Vista de "Día": timeline vertical con espina horaria, eventos posicionados
 * por hora y duración, e indicador de la hora actual. Calcado del mockup.
 */
export function DayTimeline({
  items,
  dayKey,
  onItemClick,
  onSlotClick,
}: {
  items: CalendarItem[]
  dayKey: string
  onItemClick: (item: CalendarItem) => void
  /** Click en un hueco vacío: (dayKey, "HH:mm") redondeado a 30 min. */
  onSlotClick?: (dayKey: string, time: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const today = todayKey()
  const isToday = dayKey === today
  const nowMin = minutesFromIso(new Date().toISOString())
  const [hover, setHover] = useState<number | null>(null)

  const dayItems = items.filter((i) => i.dayKey === dayKey)
  const timed = dayItems.filter((i) => i.time !== null)
  const allDay = dayItems.filter((i) => i.time === null)
  const positioned = layout(timed)

  // Al montar, desplazar a la hora actual (si es hoy) o a la mañana laboral.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const anchor = isToday ? nowMin : positioned[0]?.start ?? 8 * 60
    el.scrollTop = Math.max(0, (anchor / 60) * HOUR_H - 120)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayKey])

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col gap-6 px-4 pb-16 pt-4 md:px-8">
      {allDay.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allDay.map((it) => (
            <button
              key={`ad-${it.id}`}
              type="button"
              onClick={() => onItemClick(it)}
              className="press rounded-lg border border-blue-500/30 bg-blue-600/15 px-3 py-1.5 text-xs font-semibold text-blue-100"
            >
              {it.title}
            </button>
          ))}
        </div>
      )}

      <div ref={scrollRef} className="scroll-dark relative min-h-0 flex-1 overflow-y-auto pb-24 pr-1 md:pb-2">
        {/* --rail: espacio reservado a la columna de horas (menor en móvil). */}
        <div
          className={`relative [--rail:3.75rem] md:[--rail:4.5rem] ${onSlotClick ? 'cursor-pointer' : ''}`}
          style={{ height: 24 * HOUR_H }}
          onClick={
            onSlotClick
              ? (e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  onSlotClick(dayKey, toHM(snapMinutes(e.clientY - rect.top)))
                }
              : undefined
          }
          onMouseMove={
            onSlotClick
              ? (e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setHover(snapMinutes(e.clientY - rect.top))
                }
              : undefined
          }
          onMouseLeave={onSlotClick ? () => setHover(null) : undefined}
        >
          {/* Indicador de hueco bajo el cursor */}
          {hover !== null && (
            <div
              className="pointer-events-none absolute left-[var(--rail)] right-2 z-[5] flex items-start rounded-xl bg-blue-500/15 px-3 py-1 ring-1 ring-inset ring-blue-400/40"
              style={{ top: (hover / 60) * HOUR_H, height: HOUR_H / 2 }}
            >
              <span className="text-[11px] font-bold tabular-nums text-blue-200">
                {formatTimeLabel(toHM(hover))}
              </span>
            </div>
          )}
          {/* Espina vertical */}
          <div className="absolute bottom-0 left-12 top-0 w-px bg-gradient-to-b from-white/5 via-white/10 to-white/5" />

          {/* Líneas y etiquetas de hora */}
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h}>
              <div className="absolute inset-x-0 h-px bg-white/5" style={{ top: h * HOUR_H }} />
              <span
                className="absolute left-0 -translate-y-1/2 text-[10px] font-bold uppercase tracking-tighter text-slate-500"
                style={{ top: h * HOUR_H }}
              >
                {hourLabel(h)}
              </span>
            </div>
          ))}

          {/* Indicador de hora actual (detrás de las tarjetas para no cruzar su texto) */}
          {isToday && (
            <div
              className="pointer-events-none absolute left-12 right-0 z-[5] flex items-center"
              style={{ top: (nowMin / 60) * HOUR_H }}
            >
              <div className="whitespace-nowrap rounded-full border border-blue-300/30 bg-blue-500 px-3 py-1 text-[10px] font-bold tabular-nums text-white shadow-[0_0_15px_rgba(59,130,246,0.8)] backdrop-blur-md">
                {`${String(Math.floor(nowMin / 60)).padStart(2, '0')}:${String(nowMin % 60).padStart(2, '0')}`}
              </div>
              <div className="ml-2 h-px flex-1 bg-gradient-to-r from-blue-500 to-transparent shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
              <div className="-ml-1.5 h-2.5 w-2.5 rounded-full border border-white/50 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,1)]" />
            </div>
          )}

          {/* Eventos / tareas */}
          {positioned.map(({ item, start, end, lane, lanes }) => {
            const top = (start / 60) * HOUR_H
            const height = Math.max(((end - start) / 60) * HOUR_H, 72)
            const widthPct = 100 / lanes
            const active = isToday && start <= nowMin && nowMin < end
            const completed = item.task?.status === 'completada'
            const isEvent = item.kind === 'evento'
            // Color del borde izquierdo según prioridad.
            const prioBorder: Record<string, string> = {
              critica: 'border-l-rose-500 shadow-[-6px_0_20px_rgba(244,63,94,0.35)]',
              alta: 'border-l-amber-500 shadow-[-6px_0_20px_rgba(245,158,11,0.35)]',
              media: 'border-l-blue-500 shadow-[-6px_0_20px_rgba(59,130,246,0.4)]',
              baja: 'border-l-slate-400 shadow-[-6px_0_20px_rgba(148,163,184,0.25)]',
            }
            return (
              <button
                key={`${item.kind}-${item.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onItemClick(item)
                }}
                onMouseEnter={onSlotClick ? () => setHover(null) : undefined}
                onMouseMove={onSlotClick ? (e) => e.stopPropagation() : undefined}
                style={{
                  top,
                  height,
                  left: `calc(var(--rail) + ${lane * widthPct}% )`,
                  width: `calc(${widthPct}% - var(--rail) - 0.5rem)`,
                }}
                className={`glass-panel-hover absolute z-10 flex items-start gap-3 overflow-hidden rounded-2xl border-l-4 p-3.5 text-left ring-1 ring-inset backdrop-blur-md md:gap-6 md:p-5 ${prioBorder[item.priority] ?? prioBorder.media} ${
                  active ? 'bg-blue-900/20 ring-blue-500/30' : 'bg-[#0f172a]/70 ring-white/10'
                } ${completed ? 'opacity-50' : ''}`}
              >
                <div className="w-12 shrink-0 md:w-24">
                  <span className={`block text-xs font-bold md:text-sm ${completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                    {item.time}
                  </span>
                  {item.endTime && <span className="mt-1 block text-[11px] font-medium text-slate-400 md:text-xs">{item.endTime}</span>}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className={`mb-1.5 truncate text-sm font-semibold md:mb-2.5 md:text-base ${completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                    {item.title}
                  </h4>
                  {isEvent ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 md:gap-4">
                      {item.location && (
                        <span className="flex min-w-0 items-center gap-1.5 rounded-md border border-white/5 bg-white/5 px-2 py-1 md:px-2.5">
                          <span className="material-symbols-outlined shrink-0 text-[14px] text-blue-400">{iconFor(item)}</span>
                          <span className="truncate">{item.location}</span>
                        </span>
                      )}
                      <div className="hidden -space-x-2 md:flex">
                        <div className="grid h-6 w-6 place-items-center rounded-full border border-[#0a101d] bg-slate-600 text-[9px] font-bold text-white">JD</div>
                        <div className="grid h-6 w-6 place-items-center rounded-full border border-[#0a101d] bg-blue-600 text-[9px] font-bold text-white">+4</div>
                      </div>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
                      <span className="material-symbols-outlined text-[16px] text-teal-400">task_alt</span>
                      Tarea
                    </span>
                  )}
                </div>

                <span className="hidden shrink-0 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300 md:block">
                  {durLabel(end - start)}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
