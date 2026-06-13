import { REMINDER_OFFSETS } from './reminderConstants'

interface ReminderPickerProps {
  value: number[]
  onChange: (offsets: number[]) => void
  disabled?: boolean
}

/** Checkboxes para elegir cuándo notificar (uno o varios tiempos). */
export function ReminderPicker({ value, onChange, disabled = false }: ReminderPickerProps) {
  function toggle(minutes: number, checked: boolean) {
    if (checked) {
      onChange([...value, minutes].sort((a, b) => a - b))
    } else {
      onChange(value.filter((m) => m !== minutes))
    }
  }

  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="text-sm font-medium text-slate-700">Recordatorios (Web Push)</legend>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {REMINDER_OFFSETS.map(({ label, minutes }) => (
          <label key={minutes} className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={value.includes(minutes)}
              onChange={(e) => toggle(minutes, e.target.checked)}
            />
            {label}
          </label>
        ))}
      </div>
      <p className="text-xs text-slate-400">
        Sin selección no se crea ningún recordatorio.
      </p>
    </fieldset>
  )
}
