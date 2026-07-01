export const DEFAULT_TIMEZONE = 'America/Bogota'

/** Convierte el valor de un input datetime-local ("YYYY-MM-DDTHH:mm") a ISO UTC. */
export function localInputToIso(value: string): string {
  return new Date(value).toISOString()
}

/** Convierte un timestamp ISO al formato de input datetime-local en hora local. */
export function isoToLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const dateTimeFormatter = new Intl.DateTimeFormat('es-CO', {
  timeZone: DEFAULT_TIMEZONE,
  day: '2-digit',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  timeZone: DEFAULT_TIMEZONE,
  weekday: 'short',
  day: '2-digit',
  month: 'short',
})

/** Formatea ISO como fecha y hora legible en la zona horaria del producto. */
export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

/** Formatea ISO como fecha legible (sin hora). */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}
