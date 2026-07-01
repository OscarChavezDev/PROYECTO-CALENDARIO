import { REMINDER_OFFSETS } from './reminderConstants'

interface ReminderPickerProps {
  value: number[]
  onChange: (offsets: number[]) => void
  disabled?: boolean
}

/** Chips seleccionables para elegir cuándo notificar (uno o varios tiempos). */
export function ReminderPicker({ value, onChange, disabled = false }: ReminderPickerProps) {
  function toggle(minutes: number) {
    if (value.includes(minutes)) {
      onChange(value.filter((m) => m !== minutes))
    } else {
      onChange([...value, minutes].sort((a, b) => a - b))
    }
  }

  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="mb-1 flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-400/90">
        <i className="fi fi-rr-bell align-middle text-blue-400"></i>
        Recordatorios (Web Push)
      </legend>
      <div className="flex flex-wrap gap-2">
        {REMINDER_OFFSETS.map(({ label, minutes }) => {
          const active = value.includes(minutes)
          return (
            <button
              key={minutes}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(minutes)}
              className={`press inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? 'border-blue-500/80 bg-blue-600 text-white shadow-sm shadow-blue-950/50'
                  : 'border-slate-800/80 bg-[#111827]/70 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              <i
                className={`fi ${active ? 'fi-rr-check' : 'fi-rr-clock'} align-middle text-xs ${
                  active ? 'text-white' : 'text-slate-500'
                }`}
              ></i>
              {label}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-slate-500">
        {value.length === 0
          ? 'Sin selección no se crea ningún recordatorio.'
          : `${value.length} recordatorio${value.length > 1 ? 's' : ''} seleccionado${value.length > 1 ? 's' : ''}.`}
      </p>
    </fieldset>
  )
}
