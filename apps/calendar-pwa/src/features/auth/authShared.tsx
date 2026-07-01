import { useState } from 'react'

/* ============================================================
   Helpers de contraseña
   ============================================================ */

export const STRENGTH = [
  { label: '', color: '' },
  { label: 'Débil', color: '#ef4444' },
  { label: 'Media', color: '#facc15' },
  { label: 'Buena', color: '#4d8eff' },
  { label: 'Fuerte', color: '#34d399' },
] as const

export function scorePassword(pw: string): number {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

/* ============================================================
   Logo
   ============================================================ */

export function AuthLogo({ className = 'h-16 w-16' }: { className?: string }) {
  return (
    <img
      src="/logo.svg"
      alt="Mi Calendario"
      className={`${className} select-none drop-shadow-[0_8px_30px_rgba(77,142,255,0.45)]`}
      draggable={false}
    />
  )
}

/* ============================================================
   Google
   ============================================================ */

export function GoogleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function GoogleButton({
  onClick,
  disabled,
}: {
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="as-btn-ghost flex items-center justify-center gap-3"
    >
      <GoogleIcon />
      <span>Continuar con Google</span>
    </button>
  )
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-white/10" />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-aurora-text-dim">o</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  )
}

/* ============================================================
   Campos de formulario
   ============================================================ */

type FieldExtra = { id: string; icon: string; label: string; showLabel?: boolean }

export function IconInput({
  id,
  icon,
  label,
  showLabel = false,
  ...props
}: FieldExtra & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className={showLabel ? 'text-xs font-medium text-aurora-text-muted' : 'sr-only'}>
        {label}
      </label>
      <div className="as-field relative">
        <span className="material-symbols-outlined as-field-icon">{icon}</span>
        <input id={id} className="as-input" {...props} />
      </div>
    </div>
  )
}

export function PasswordInput({
  id,
  label = 'Contraseña',
  showLabel = false,
  children,
  ...props
}: {
  id: string
  label?: string
  showLabel?: boolean
  children?: React.ReactNode
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className={showLabel ? 'text-xs font-medium text-aurora-text-muted' : 'sr-only'}>
        {label}
      </label>
      <div className="as-field relative">
        <span className="material-symbols-outlined as-field-icon">lock</span>
        <input id={id} type={show ? 'text' : 'password'} className="as-input" {...props} />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="as-eye"
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={show}
          tabIndex={-1}
        >
          <span className="material-symbols-outlined text-[20px]">
            {show ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
      {children}
    </div>
  )
}

export function StrengthMeter({ score }: { score: number }) {
  if (score <= 0) return null
  const { label, color } = STRENGTH[score]
  return (
    <div className="mt-1 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-aurora-text-dim">
          Seguridad
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((seg) => (
          <span
            key={seg}
            className="as-strength-seg"
            style={
              seg <= score
                ? { backgroundColor: color, boxShadow: `0 0 8px ${color}80` }
                : undefined
            }
          />
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   Bloque de marca (logo + claim) reutilizable
   ============================================================ */

export function BrandBlock({
  cta,
  onCta,
  logoSize = 'h-24 w-24',
}: {
  cta: string
  onCta: () => void
  logoSize?: string
}) {
  return (
    <>
      <AuthLogo className={`${logoSize} mb-6`} />
      <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white lg:text-[2.5rem]">
        Tu día,
        <br />
        perfectamente
        <br />
        <span className="bg-gradient-to-r from-aurora-primary-bright to-aurora-emerald bg-clip-text text-transparent">
          organizado.
        </span>
      </h1>
      <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-aurora-text-muted">
        Accede a tu panel de control, sincroniza tu equipo y domina tu tiempo.
      </p>
      <button type="button" onClick={onCta} className="as-btn-outline mt-6">
        {cta}
      </button>
    </>
  )
}

/* Error inline reutilizable */
export function AuthError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-medium text-red-300 animate-shake"
    >
      <span className="material-symbols-outlined text-xl shrink-0">error</span>
      <span>{message}</span>
    </div>
  )
}
