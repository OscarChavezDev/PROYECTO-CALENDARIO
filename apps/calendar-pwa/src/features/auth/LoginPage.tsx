import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured } from '../../lib/config/env'
import { SupabaseStatusBanner } from '../../components/SupabaseStatusBanner'
import { signInWithEmail } from './authService'
import { useAuth } from './useAuth'

// Cooldown progresivo tras intentos fallidos (defensa anti fuerza-bruta en cliente;
// Supabase ya limita por IP en el servidor). 2 s por intento, máximo 30 s.
const COOLDOWN_STEP_MS = 2000
const COOLDOWN_MAX_MS = 30000

export function LoginPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (inCooldown) return
    setError(null)
    setSubmitting(true)
    try {
      await signInWithEmail(email, password)
      navigate('/app')
    } catch (err) {
      const next = attempts + 1
      setAttempts(next)
      setNow(Date.now())
      setCooldownUntil(Date.now() + Math.min(next * COOLDOWN_STEP_MS, COOLDOWN_MAX_MS))
      setError(err instanceof Error ? err.message : 'Error inesperado al iniciar sesión.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Iniciar sesión</h1>

      {!isSupabaseConfigured && <SupabaseStatusBanner configured={false} />}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Correo
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Contraseña
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none"
          />
        </label>

        {error && (
          <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || inCooldown}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting
            ? 'Entrando…'
            : inCooldown
              ? `Espera ${Math.ceil(remainingMs / 1000)} s`
              : 'Entrar'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-medium text-indigo-600 hover:underline">
          Regístrate
        </Link>
      </p>
    </section>
  )
}
