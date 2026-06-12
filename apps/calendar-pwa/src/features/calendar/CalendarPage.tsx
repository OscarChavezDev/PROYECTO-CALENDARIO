import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSupabaseConfigured } from '../../lib/config/env'
import { getSupabaseClient } from '../../lib/supabase/client'
import { signOut } from '../auth/authService'
import { useAuth } from '../auth/useAuth'
import { EventsSection } from '../events/EventsSection'
import { TasksSection } from '../tasks/TasksSection'

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
            'No existe calendario default; revisar Sprint 1 (el trigger crea el calendario al registrar un usuario nuevo).',
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mi calendario</h1>
          <p className="text-sm text-slate-500">
            {user?.email}
            {calendar && (
              <>
                {' · '}
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-full align-middle"
                  style={{ backgroundColor: calendar.color ?? '#2563eb' }}
                />{' '}
                {calendar.name}
              </>
            )}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
        >
          {signingOut ? 'Saliendo…' : 'Cerrar sesión'}
        </button>
      </div>

      {loadingCalendar ? (
        <p className="text-sm text-slate-500">Cargando calendario…</p>
      ) : calendar && user ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <EventsSection userId={user.id} calendarId={calendar.id} />
          <TasksSection userId={user.id} calendarId={calendar.id} />
        </div>
      ) : (
        <p role="alert" className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          {calendarError}
        </p>
      )}
    </section>
  )
}
