import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type FormKind = 'event' | 'task'

interface FormModalProps {
  open: boolean
  title: string
  accent: 'blue' | 'teal'
  /** Si se pasa, muestra el control segmentado EVENTO/TAREA. */
  tabs?: { active: FormKind; onSelect: (kind: FormKind) => void } | null
  onClose: () => void
  children: ReactNode
}

/**
 * Modal central premium para crear/editar (Evento/Tarea), calcado del mockup:
 * vidrio con esquinas grandes, barra de acento, tabs y contenido scrollable.
 */
export function FormModal({ open, title, accent, tabs, onClose, children }: FormModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const bar =
    accent === 'blue'
      ? 'bg-gradient-to-b from-blue-400 to-indigo-500 shadow-[0_0_14px_rgba(59,130,246,0.6)]'
      : 'bg-gradient-to-b from-teal-400 to-emerald-500 shadow-[0_0_14px_rgba(20,184,166,0.6)]'

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/65 backdrop-blur-md animate-fade-in"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#0e1320]/95 shadow-2xl backdrop-blur-2xl animate-slide-up sm:max-w-2xl sm:rounded-[2rem] sm:animate-scale-in"
        style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06), 0 30px 70px -20px rgba(0,0,0,0.8)' }}
      >
        {/* Asa móvil */}
        <div className="flex justify-center pt-3 sm:hidden">
          <span className="h-1.5 w-12 rounded-full bg-white/15" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 pb-4 pt-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`h-6 w-1.5 shrink-0 rounded-full ${bar}`} />
            <h2 className="truncate text-lg font-bold tracking-tight text-white">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="press grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tabs EVENTO / TAREA */}
        {tabs && (
          <div className="px-6 pt-4">
            <div className="flex w-fit gap-1 rounded-xl border border-white/5 bg-black/25 p-1 backdrop-blur-xl">
              {(['event', 'task'] as const).map((kind) => {
                const isActive = tabs.active === kind
                const activeCls =
                  kind === 'event'
                    ? 'bg-blue-500 text-white shadow-[0_0_18px_rgba(59,130,246,0.45)]'
                    : 'bg-teal-500 text-white shadow-[0_0_18px_rgba(20,184,166,0.45)]'
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => tabs.onSelect(kind)}
                    className={`rounded-lg px-6 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-all ${
                      isActive ? activeCls : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {kind === 'event' ? 'Evento' : 'Tarea'}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Contenido */}
        <div className="custom-scrollbar overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
