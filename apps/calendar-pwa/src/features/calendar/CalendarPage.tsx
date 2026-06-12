import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSupabaseConfigured } from '../../lib/config/env'
import { getSupabaseClient } from '../../lib/supabase/client'
import { signOut } from '../auth/authService'
import { useAuth } from '../auth/useAuth'

interface DefaultCalendar {
  id: string
  name: string
  color: string | null
  is_default: boolean
}

export function CalendarPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [calendar, setCalendar] = useState<DefaultCalendar | null>(null)
  const [calendarError, setCalendarError] = useState<string | null>(
    isSupabaseConfigured ? null : 'Supabase no está configurado.',
  )
  const [loadingCalendar, setLoadingCalendar] = useState(isSupabaseConfigured)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return
    }

    supabase
      .from('calendars')
      .select('id, name, color, is_default')
      .eq('is_default', true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setCalendarError(
            'No se pudo cargar el calendario. ¿Ya aplicaste la migración SQL en Supabase? ' +
              `(${error.message})`,
          )
        } else if (data) {
          setCalendar(data)
        } else {
          setCalendarError(
            'No existe calendario por defecto. Si la migración se aplicó después de crear tu cuenta, regístrate con un usuario nuevo o crea el calendario manualmente.',
          )
        }
        setLoadingCalendar(false)
      })
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      navigate('/login')
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-slate-900">Mi calendario</h1>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
        >
          {signingOut ? 'Saliendo…' : 'Cerrar sesión'}
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Sesión
        </h2>
        <p className="mt-1 text-slate-900">{user?.email}</p>
        <p className="mt-1 text-xs text-slate-500">
          {user?.email_confirmed_at ? 'Correo verificado ✓' : 'Correo pendiente de verificación'}
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Calendario por defecto
        </h2>
        {loadingCalendar ? (
          <p className="mt-2 text-sm text-slate-500">Cargando…</p>
        ) : calendar ? (
          <div className="mt-2 flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-4 w-4 rounded-full"
              style={{ backgroundColor: calendar.color ?? '#2563eb' }}
            />
            <span className="font-medium text-slate-900">{calendar.name}</span>
          </div>
        ) : (
          <p className="mt-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            {calendarError}
          </p>
        )}
      </div>

      <p className="text-sm text-slate-500">
        Los eventos y tareas llegan en el Sprint 2; las vistas diaria/semanal/mensual en el
        Sprint 3.
      </p>
    </section>
  )
}
