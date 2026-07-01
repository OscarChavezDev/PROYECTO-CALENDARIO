/** Helpers del dashboard "Hoy" (saludo, nombre y tiempo relativo). */

/** Saludo según la hora local. */
export function greetingFor(hour: number) {
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

/** Primer nombre capitalizado a partir del nombre completo o el email. */
export function firstNameOf(user: { user_metadata?: { full_name?: string }; email?: string } | null) {
  const raw = user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  const first = raw.split(/[\s._-]+/)[0] ?? ''
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : ''
}

/** "en 25 min" / "en 1 h 30 min" / "ahora" para minutos hasta un evento. */
export function untilLabel(mins: number) {
  if (mins <= 0) return 'ahora'
  if (mins < 60) return `en ${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `en ${h} h ${m} min` : `en ${h} h`
}
