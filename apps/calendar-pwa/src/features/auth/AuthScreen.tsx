import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured } from '../../lib/config/env'
import { SupabaseStatusBanner } from '../../components/SupabaseStatusBanner'
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from './authService'
import { useAuth } from './useAuth'
import {
  AuthError,
  AuthLogo,
  BrandBlock,
  GoogleButton,
  IconInput,
  OrDivider,
  PasswordInput,
  StrengthMeter,
  scorePassword,
} from './authShared'

// Cooldown progresivo tras intentos fallidos (defensa anti fuerza-bruta en cliente).
const COOLDOWN_STEP_MS = 2000
const COOLDOWN_MAX_MS = 30000

type Mode = 'signin' | 'signup'

export function AuthScreen({ initialMode }: { initialMode: Mode }) {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>(initialMode)

  // Sign in
  const [siEmail, setSiEmail] = useState('')
  const [siPass, setSiPass] = useState('')
  const [siError, setSiError] = useState<string | null>(null)
  const [siBusy, setSiBusy] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  // Sign up
  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPass, setSuPass] = useState('')
  const [suError, setSuError] = useState<string | null>(null)
  const [suBusy, setSuBusy] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)

  const score = useMemo(() => scorePassword(suPass), [suPass])

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return
    const id = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(id)
  }, [cooldownUntil])

  const remainingMs = Math.max(0, cooldownUntil - now)
  const inCooldown = remainingMs > 0

  if (!loading && session) {
    return <Navigate to="/app" replace />
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault()
    if (inCooldown) return
    setSiError(null)
    setSiBusy(true)
    try {
      await signInWithEmail(siEmail, siPass)
      navigate('/app')
    } catch (err) {
      const next = attempts + 1
      setAttempts(next)
      setNow(Date.now())
      setCooldownUntil(Date.now() + Math.min(next * COOLDOWN_STEP_MS, COOLDOWN_MAX_MS))
      setSiError(err instanceof Error ? err.message : 'Error inesperado al iniciar sesión.')
    } finally {
      setSiBusy(false)
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault()
    setSuError(null)
    setSuBusy(true)
    try {
      const data = await signUpWithEmail(suEmail, suPass, suName.trim() || undefined)
      if (data.session) {
        navigate('/app')
      } else {
        setNeedsVerification(true)
      }
    } catch (err) {
      setSuError(err instanceof Error ? err.message : 'Error inesperado al registrarse.')
    } finally {
      setSuBusy(false)
    }
  }

  async function handleGoogle(setErr: (m: string) => void) {
    try {
      await signInWithGoogle()
    } catch (err) {
      setErr(err instanceof Error ? err.message : 'No se pudo continuar con Google.')
    }
  }

  if (needsVerification) {
    return (
      <div className="auth-shell">
        <div className="as-mesh" />
        <div className="as-noise" />
        <div className="as-mobile relative z-10 max-w-md p-8 text-center animate-scale-in">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 animate-bounce">
            <span className="material-symbols-outlined text-3xl">mark_email_unread</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">¡Revisa tu bandeja!</h1>
          <p className="mt-3 text-sm leading-relaxed text-aurora-text-muted">
            Hemos enviado un enlace de confirmación a{' '}
            <strong className="font-semibold text-aurora-emerald">{suEmail}</strong>. Haz clic en él
            para activar tu cuenta.
          </p>
          <button
            type="button"
            onClick={() => {
              setNeedsVerification(false)
              setMode('signin')
            }}
            className="as-btn-primary mt-6"
          >
            Ir a Iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  // ---- Grupos de campos reutilizables (desktop + mobile comparten estado) ----
  const signInFields = (idp: string, showLabels: boolean) => (
    <>
      <IconInput
        id={`${idp}-email`}
        icon="mail"
        label="Correo electrónico"
        showLabel={showLabels}
        type="email"
        required
        autoComplete="email"
        placeholder={showLabels ? 'tu@email.com' : 'Correo electrónico'}
        value={siEmail}
        onChange={(e) => setSiEmail(e.target.value)}
      />
      <PasswordInput
        id={`${idp}-pass`}
        showLabel={showLabels}
        required
        autoComplete="current-password"
        placeholder={showLabels ? '••••••••' : 'Contraseña'}
        value={siPass}
        onChange={(e) => setSiPass(e.target.value)}
      />
      <div className="flex items-center justify-between text-xs">
        <label className="flex cursor-pointer items-center gap-2 text-aurora-text-muted">
          <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/5 accent-aurora-primary" />
          <span>Recordarme</span>
        </label>
        <button type="button" className="font-medium text-aurora-primary-bright hover:text-white transition-colors">
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    </>
  )

  const signUpFields = (idp: string, showLabels: boolean) => (
    <>
      <IconInput
        id={`${idp}-name`}
        icon="person"
        label="Nombre completo"
        showLabel={showLabels}
        type="text"
        autoComplete="name"
        placeholder={showLabels ? 'Juan Pérez' : 'Nombre completo'}
        value={suName}
        onChange={(e) => setSuName(e.target.value)}
      />
      <IconInput
        id={`${idp}-email`}
        icon="mail"
        label="Correo electrónico"
        showLabel={showLabels}
        type="email"
        required
        autoComplete="email"
        placeholder={showLabels ? 'tu@email.com' : 'Correo electrónico'}
        value={suEmail}
        onChange={(e) => setSuEmail(e.target.value)}
      />
      <PasswordInput
        id={`${idp}-pass`}
        showLabel={showLabels}
        required
        minLength={6}
        autoComplete="new-password"
        placeholder={showLabels ? 'Mínimo 6 caracteres' : 'Contraseña'}
        value={suPass}
        onChange={(e) => setSuPass(e.target.value)}
      >
        <StrengthMeter score={score} />
      </PasswordInput>
    </>
  )

  return (
    <div className="auth-shell">
      <div className="as-mesh" />
      <div className="as-noise" />

      {/* ===================== Desktop (panel deslizante) ===================== */}
      <div className={`as-container as-sheen hidden md:flex ${mode === 'signup' ? 'as-active' : ''}`}>
        {/* Formulario Iniciar sesión */}
        <div className="as-form as-signin">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-white">Bienvenido de nuevo</h2>
            <p className="mt-1 text-sm text-aurora-text-muted">
              Introduce tus credenciales para acceder a tu panel.
            </p>
          </div>
          {!isSupabaseConfigured && (
            <div className="mb-4">
              <SupabaseStatusBanner configured={false} />
            </div>
          )}
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            {signInFields('d-si', false)}
            {siError && <AuthError message={siError} />}
            <button type="submit" disabled={siBusy || inCooldown} className="as-btn-primary mt-1">
              {siBusy ? 'Iniciando sesión…' : inCooldown ? `Espera ${Math.ceil(remainingMs / 1000)} s` : 'Iniciar sesión'}
            </button>
            <OrDivider />
            <GoogleButton onClick={() => handleGoogle(setSiError)} disabled={siBusy} />
          </form>
          <p className="mt-6 text-center text-xs text-aurora-text-muted">
            ¿No tienes cuenta?{' '}
            <button type="button" onClick={() => setMode('signup')} className="font-bold text-aurora-primary-bright hover:underline">
              Regístrate ahora
            </button>
          </p>
        </div>

        {/* Formulario Crear cuenta */}
        <div className="as-form as-signup">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">Crea tu cuenta</h2>
            <p className="mt-1 text-sm text-aurora-text-muted">
              Únete a nosotros y empieza a organizar tu tiempo.
            </p>
          </div>
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            {signUpFields('d-su', false)}
            {suError && <AuthError message={suError} />}
            <button type="submit" disabled={suBusy} className="as-btn-primary mt-1">
              {suBusy ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
            <OrDivider />
            <GoogleButton onClick={() => handleGoogle(setSuError)} disabled={suBusy} />
          </form>
          <p className="mt-6 text-center text-xs text-aurora-text-muted">
            ¿Ya tienes cuenta?{' '}
            <button type="button" onClick={() => setMode('signin')} className="font-bold text-aurora-primary-bright hover:underline">
              Inicia sesión
            </button>
          </p>
        </div>

        {/* Overlay deslizante con la marca */}
        <div className="as-overlay-container">
          <div className="as-overlay">
            <div className="as-overlay-panel as-overlay-left">
              <BrandBlock cta="Ya tengo cuenta • Iniciar sesión" onCta={() => setMode('signin')} />
            </div>
            <div className="as-overlay-panel as-overlay-right">
              <BrandBlock cta="Crear una cuenta" onCta={() => setMode('signup')} />
            </div>
          </div>
        </div>
      </div>

      {/* ===================== Mobile (panel con pestañas) ===================== */}
      <div className="as-mobile md:hidden">
        <div className="mb-6 flex justify-center">
          <AuthLogo className="h-16 w-16" />
        </div>
        <div className="mb-2 text-center">
          <h1 className="text-2xl font-bold text-white">Acceso Maestro</h1>
          <p className="mt-1 text-sm text-aurora-text-muted">Tu espacio central de productividad</p>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex w-full border-b border-white/10">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`as-tab ${mode === 'signin' ? 'as-tab-active' : ''}`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`as-tab ${mode === 'signup' ? 'as-tab-active' : ''}`}
          >
            Crear cuenta
          </button>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4">
            <SupabaseStatusBanner configured={false} />
          </div>
        )}

        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="as-fade flex flex-col gap-4">
            {signInFields('m-si', true)}
            {siError && <AuthError message={siError} />}
            <button type="submit" disabled={siBusy || inCooldown} className="as-btn-primary mt-1 flex items-center justify-center gap-2">
              <span>{siBusy ? 'Entrando…' : inCooldown ? `Espera ${Math.ceil(remainingMs / 1000)} s` : 'Entrar'}</span>
              {!siBusy && !inCooldown && <span className="material-symbols-outlined text-xl">arrow_forward</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="as-fade flex flex-col gap-4">
            {signUpFields('m-su', true)}
            {suError && <AuthError message={suError} />}
            <button type="submit" disabled={suBusy} className="as-btn-primary mt-1 flex items-center justify-center gap-2">
              <span>{suBusy ? 'Creando…' : 'Registrarse'}</span>
              {!suBusy && <span className="material-symbols-outlined text-xl">person_add</span>}
            </button>
          </form>
        )}

        <div className="my-4">
          <OrDivider />
        </div>
        <GoogleButton onClick={() => handleGoogle(mode === 'signin' ? setSiError : setSuError)} />

        <p className="mt-6 px-4 text-center text-xs text-aurora-text-muted">
          Al continuar, aceptas nuestros{' '}
          <a href="#" className="text-aurora-primary-bright underline">Términos de Servicio</a> y{' '}
          <a href="#" className="text-aurora-primary-bright underline">Política de Privacidad</a>.
        </p>
      </div>
    </div>
  )
}
