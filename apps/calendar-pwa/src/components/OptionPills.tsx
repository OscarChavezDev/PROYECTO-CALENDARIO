export interface PillOption<T extends string> {
  value: T
  label: string
  /** Clases para el estado activo (color por opción). */
  activeClassName: string
  icon?: string
}

/** Selector interactivo de una opción mediante pills (reemplaza a un <select>). */
export function OptionPills<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: PillOption<T>[]
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400/80">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = value === o.value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`press inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                active
                  ? o.activeClassName
                  : 'border-slate-800/80 bg-[#111827]/70 text-slate-400 hover:bg-slate-800 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              {o.icon && <i className={`fi ${o.icon} align-middle text-xs`}></i>}
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
