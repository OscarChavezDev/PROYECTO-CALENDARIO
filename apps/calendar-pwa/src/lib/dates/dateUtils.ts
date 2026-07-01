import { DEFAULT_TIMEZONE } from './timezone'

/**
 * Utilidades de calendario basadas en "day keys" (YYYY-MM-DD) calculados
 * en la zona horaria del producto (America/Bogota), para evitar errores
 * de día al comparar timestamps UTC.
 */

const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: DEFAULT_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Day key (YYYY-MM-DD) de un timestamp ISO, en la zona del producto. */
export function dayKeyFromIso(iso: string): string {
  return dayKeyFormatter.format(new Date(iso))
}

/** Day key de hoy. */
export function todayKey(): string {
  return dayKeyFormatter.format(new Date())
}

/** Convierte un day key a Date anclada al mediodía UTC (segura para aritmética de días). */
export function keyToNoonDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12))
}

function noonDateToKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

/** Suma n días (puede ser negativo) a un day key. */
export function addDays(key: string, n: number): string {
  const date = keyToNoonDate(key)
  date.setUTCDate(date.getUTCDate() + n)
  return noonDateToKey(date)
}

/** Suma n meses a un day key, ajustando el día al máximo del mes destino. */
export function addMonths(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const totalMonths = y * 12 + (m - 1) + n
  const targetYear = Math.floor(totalMonths / 12)
  const targetMonth = totalMonths - targetYear * 12 // 0-11
  const daysInTarget = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate()
  const pad = (x: number) => String(x).padStart(2, '0')
  return `${targetYear}-${pad(targetMonth + 1)}-${pad(Math.min(d, daysInTarget))}`
}

/** Day key del lunes de la semana a la que pertenece el key dado. */
export function mondayOf(key: string): string {
  const weekday = keyToNoonDate(key).getUTCDay() // 0=domingo … 6=sábado
  const offset = weekday === 0 ? -6 : 1 - weekday
  return addDays(key, offset)
}

/** Los 7 day keys (lunes a domingo) de la semana del key dado. */
export function weekKeys(key: string): string[] {
  const monday = mondayOf(key)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

/** Grilla del mes del key dado: semanas completas (lunes a domingo) que cubren el mes. */
export function monthGrid(key: string): string[][] {
  const [y, m] = key.split('-').map(Number)
  const firstKey = `${key.slice(0, 8)}01`
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const lastKey = addDays(firstKey, daysInMonth - 1)

  const weeks: string[][] = []
  let cursor = mondayOf(firstKey)
  while (cursor <= lastKey) {
    weeks.push(weekKeys(cursor))
    cursor = addDays(cursor, 7)
  }
  return weeks
}

/** ¿El day key pertenece al mismo mes que el key ancla? */
export function isSameMonth(key: string, anchorKey: string): boolean {
  return key.slice(0, 7) === anchorKey.slice(0, 7)
}

// Formateador interno 24h (en-GB → "00:00".."23:59"): base estable para parsear
// horas/minutos y derivar las etiquetas am/pm sin depender del locale.
const time24Formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: DEFAULT_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function hourMinFromIso(iso: string): [number, number] {
  const [h, m] = time24Formatter.format(new Date(iso)).split(':').map(Number)
  return [h, m]
}

/** Etiqueta 12h: (13,5)→"1:05 p.m."; (13,0)→"1 p.m."; (0,0)→"12 a.m." */
function label12(hour: number, minute: number): string {
  const period = hour < 12 ? 'a.m.' : 'p.m.'
  const h12 = hour % 12 === 0 ? 12 : hour % 12
  return minute === 0 ? `${h12} ${period}` : `${h12}:${String(minute).padStart(2, '0')} ${period}`
}

/** Hora en formato am/pm de un ISO en la zona del producto ("1:05 p.m."). */
export function timeFromIso(iso: string): string {
  const [h, m] = hourMinFromIso(iso)
  return label12(h, m)
}

/** Minutos desde medianoche (zona del producto) para ordenar y posicionar por hora. */
export function minutesFromIso(iso: string): number {
  const [h, m] = hourMinFromIso(iso)
  return h * 60 + m
}

/** Etiqueta del eje horario de la grilla (hora exacta): 13 → "1 p.m.", 0 → "12 a.m.". */
export function formatHourLabel(hour: number): string {
  return label12(hour, 0)
}

/** Convierte "HH:mm" (24h) a etiqueta am/pm: "14:30" → "2:30 p.m.". */
export function formatTimeLabel(time: string): string {
  const [h, m] = time.split(':').map(Number)
  return label12(h, m)
}

const dayHeadingFormatter = new Intl.DateTimeFormat('es-CO', {
  timeZone: 'UTC', // los keys se anclan a mediodía UTC
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const dayShortFormatter = new Intl.DateTimeFormat('es-CO', {
  timeZone: 'UTC',
  weekday: 'short',
  day: '2-digit',
  month: 'short',
})

const monthHeadingFormatter = new Intl.DateTimeFormat('es-CO', {
  timeZone: 'UTC',
  month: 'long',
  year: 'numeric',
})

/** "lunes, 15 de junio" a partir de un day key. */
export function formatDayHeading(key: string): string {
  return dayHeadingFormatter.format(keyToNoonDate(key))
}

/** "lun, 15 jun" a partir de un day key. */
export function formatDayShort(key: string): string {
  return dayShortFormatter.format(keyToNoonDate(key))
}

/** "junio de 2026" a partir de un day key. */
export function formatMonthHeading(key: string): string {
  return monthHeadingFormatter.format(keyToNoonDate(key))
}

/** Número de día del mes de un day key ("2026-06-05" → 5). */
export function dayNumber(key: string): number {
  return Number(key.slice(8, 10))
}
