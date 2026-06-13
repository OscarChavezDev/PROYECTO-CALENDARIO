export interface ReminderOffsetOption {
  label: string
  minutes: number
}

/** Tiempos de notificación disponibles, en el orden exacto de la UI. */
export const REMINDER_OFFSETS: ReminderOffsetOption[] = [
  { label: 'Al inicio exacto', minutes: 0 },
  { label: '10 minutos antes', minutes: 10 },
  { label: '15 minutos antes', minutes: 15 },
  { label: '20 minutos antes', minutes: 20 },
  { label: '30 minutos antes', minutes: 30 },
  { label: '1 hora antes', minutes: 60 },
]

/** Minutos válidos (para descartar reminders con offsets fuera de la lista). */
export const VALID_OFFSET_MINUTES = REMINDER_OFFSETS.map((o) => o.minutes)
