import { useEffect, useRef, useState } from 'react'

/** Lista de horas cada 15 min ("HH:mm"). */
const TIMES: string[] = (() => {
  const out: string[] = []
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 15, 30, 45]) {
      out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return out
})()

/**
 * Selector de hora propio (sin el dropdown nativo): un campo de solo lectura que
 * abre un popover con la lista de horas, estilizado con la paleta de la app.
 */
export function TimePicker({
  value,
  onChange,
  ariaLabel,
  disabled = false,
}: {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Al abrir, centra la hora seleccionada.
  useEffect(() => {
    if (!open || !listRef.current) return
    const sel = listRef.current.querySelector('[data-selected="true"]') as HTMLElement | null
    sel?.scrollIntoView({ block: 'center' })
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        readOnly
        disabled={disabled}
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={() => !disabled && setOpen((o) => !o)}
        placeholder="--:--"
        className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm tabular-nums text-white placeholder:text-white/30 outline-none transition-all hover:bg-white/[0.05] focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-40"
      />
      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-blue-300/70">
        schedule
      </span>

      {open && (
        <div
          ref={listRef}
          className="scroll-dark absolute z-30 mt-1.5 max-h-56 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#0e1320] p-1 shadow-2xl backdrop-blur-xl"
        >
          {TIMES.map((t) => {
            const selected = t === value
            return (
              <button
                key={t}
                type="button"
                data-selected={selected}
                onClick={() => {
                  onChange(t)
                  setOpen(false)
                }}
                className={`flex w-full items-center rounded-lg px-3 py-1.5 text-sm tabular-nums transition-colors ${
                  selected
                    ? 'bg-blue-600 font-semibold text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {t}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
