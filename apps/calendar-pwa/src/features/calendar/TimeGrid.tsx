import { useEffect, useMemo, useRef } from 'react'
import { formatDayShort, minutesFromIso, todayKey } from '../../lib/dates/dateUtils'
import type { CalendarItem, ItemFilter } from './calendarTypes'
import { applyFilter } from './calendarUtils'

const HOUR_H = 48 // px por hora
const DAY_MIN = 24 * 60

const kindBg: Record<CalendarItem['kind'], string> = {
  evento: 'bg-indigo-600',
  tarea: 'bg-teal-600',
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

interface Positioned {
  item: CalendarItem
  start: number
  end: number
  lane: number
  lanes: number
}

/** Asigna columnas (lanes) a eventos que se solapan, estilo Google Calendar. */
function layout(items: CalendarItem[]): Positioned[] {
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
}: {
  items: CalendarItem[]
  days: string[]
  filter: ItemFilter
  onItemClick: (item: CalendarItem) => void
  onSelectDay: (dayKey: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const today = todayKey()
  const filtered = useMemo(() => applyFilter(items, filter), [items, filter])

  const timedByDay = new Map<string, CalendarItem[]>()
  const allDayByDay = new Map<string, CalendarItem[]>()
  for (const it of filtered) {
    const map = it.time === null ? allDayByDay : timedByDay
    const arr = map.get(it.dayKey) ?? []
    arr.push(it)
    map.set(it.dayKey, arr)
  }
  const hasAllDay = [...allDayByDay.values()].some((a) => a.length > 0)

  // Posicionar el scroll cerca de la mañana al montar
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 7 * HOUR_H
  }, [])

  const nowMin = minutesFromIso(new Date().toISOString())
  const cols = `3rem repeat(${days.length}, minmax(0, 1fr))`

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {/* Encabezado de días */}
      <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: cols }}>
        <div />
        {days.map((d) => {
          const isToday = d === today
          return (
            <button
              key={d}
              onClick={() => onSelectDay(d)}
              className={`py-2 text-center text-xs font-semibold capitalize transition hover:bg-slate-50 ${
                isToday ? 'text-indigo-700' : 'text-slate-600'
              }`}
            >
              {formatDayShort(d)}
            </button>
          )
        })}
      </div>

      {/* Franja "todo el día" / sin hora */}
      {hasAllDay && (
        <div className="grid border-b border-slate-100" style={{ gridTemplateColumns: cols }}>
          <div className="py-1 pr-1 text-right text-[10px] leading-tight text-slate-400">
            todo el día
          </div>
          {days.map((d) => (
            <div key={d} className="flex flex-col gap-0.5 border-l border-slate-100 p-1">
              {(allDayByDay.get(d) ?? []).map((it) => (
                <button
                  key={`${it.kind}-${it.id}`}
                  onClick={() => onItemClick(it)}
                  className={`truncate rounded px-1 py-0.5 text-left text-[11px] text-white ${kindBg[it.kind]}`}
                >
                  {it.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Grilla horaria */}
      <div ref={scrollRef} className="relative max-h-[65vh] overflow-y-auto">
        <div className="grid" style={{ gridTemplateColumns: cols, height: (DAY_MIN / 60) * HOUR_H }}>
          {/* Columna de horas */}
          <div className="relative">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} style={{ height: HOUR_H }} className="relative">
                <span className="absolute right-1 top-0 -translate-y-1/2 text-[10px] text-slate-400">
                  {h === 0 ? '' : `${h}:00`}
                </span>
              </div>
            ))}
          </div>

          {/* Columnas de días */}
          {days.map((d) => {
            const positioned = layout(timedByDay.get(d) ?? [])
            const isToday = d === today
            return (
              <div key={d} className="relative border-l border-slate-100">
                {Array.from({ length: 24 }, (_, h) => (
                  <div
                    key={h}
                    style={{ top: h * HOUR_H }}
                    className="absolute inset-x-0 border-t border-slate-100"
                  />
                ))}

                {isToday && (
                  <div
                    style={{ top: (nowMin / 60) * HOUR_H }}
                    className="absolute inset-x-0 z-10 border-t-2 border-red-500"
                  >
                    <span className="absolute -left-1 -top-[5px] h-2 w-2 rounded-full bg-red-500" />
                  </div>
                )}

                {positioned.map(({ item, start, end, lane, lanes }) => {
                  const top = (start / 60) * HOUR_H
                  const height = Math.max(((end - start) / 60) * HOUR_H, 18)
                  const widthPct = 100 / lanes
                  const completed = item.task?.status === 'completada'
                  return (
                    <button
                      key={`${item.kind}-${item.id}`}
                      onClick={() => onItemClick(item)}
                      style={{ top, height, left: `${lane * widthPct}%`, width: `${widthPct}%` }}
                      className={`absolute overflow-hidden rounded-sm border border-white/40 px-1 py-0.5 text-left leading-tight text-white ${kindBg[item.kind]} ${
                        completed ? 'opacity-50 line-through' : ''
                      }`}
                    >
                      <span className="block text-[10px] font-semibold tabular-nums">
                        {item.time}
                      </span>
                      <span className="block truncate text-[11px]">{item.title}</span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
