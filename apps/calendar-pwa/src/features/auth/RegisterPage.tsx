import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured } from '../../lib/config/env'
import { SupabaseStatusBanner } from '../../components/SupabaseStatusBanner'
import { signUpWithEmail } from './authService'
import { useAuth } from './useAuth'

export function RegisterPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)

  if (!loading && session) {
    return <Navigate to="/app" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setSubmitting(true)
    try {
      const data = await signUpWithEmail(email, password)
      if (data.session) {
        // Confirmación de email desactivada en Supabase: sesión directa
        navigate('/app')
      } else {
        setNeedsVerification(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado al registrarse.')
    } finally {
      setSubmitting(false)
    }
  }

  if (needsVerification) {
    return (
      <section className="mx-auto w-full max-w-sm">
        <div className="rounded-lg border border-green-300 bg-green-50 p-6 text-green-800">
          <h1 className="text-lg font-bold">Revisa tu correo 📬</h1>
          <p className="mt-2 text-sm">
            Te enviamos un enlace de verificación a <strong>{email}</strong>. Ábrelo para
            activar tu cuenta y luego inicia sesión.
          </p>
          <Link
            to="/login"
            className="mt-4 inline-block font-medium text-indigo-600 hover:underline"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">Crear cuenta</h1>

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
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Confirmar contraseña
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
          disabled={submitting}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </section>
  )
}
