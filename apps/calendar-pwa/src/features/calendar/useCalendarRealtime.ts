import { useEffect, useRef, useState } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { isSupabaseConfigured } from '../../lib/config/env'
import { getSupabaseClient } from '../../lib/supabase/client'
import type { ChangeType } from '../../lib/supabase/realtime'
import type { CalendarEvent } from '../events/types'
import type { Task } from '../tasks/types'

export type RealtimeStatus = 'conectando' | 'conectado' | 'desconectado'

type ChangeHandler<T> = (type: ChangeType, newRow: T | null, oldId: string | null) => void

interface UseCalendarRealtimeArgs {
  userId: string | null
  onEventChange: ChangeHandler<CalendarEvent>
  onTaskChange: ChangeHandler<Task>
  /** Refetch de reconciliación cuando el canal se reconecta tras una caída. */
  onReconnect: () => void
}

function extract<T extends { id: string }>(payload: RealtimePostgresChangesPayload<T>) {
  const newRecord = payload.new as Partial<T>
  const newRow = newRecord && 'id' in newRecord ? (newRecord as T) : null
  const oldId = (payload.old as Partial<{ id: string }>).id ?? null
  return { type: payload.eventType, newRow, oldId }
}

/**
 * Suscripción Realtime a events y tasks del usuario en un solo canal.
 * Se suscribe una única vez por usuario y limpia el canal al desmontar.
 */
export function useCalendarRealtime({
  userId,
  onEventChange,
  onTaskChange,
  onReconnect,
}: UseCalendarRealtimeArgs): RealtimeStatus {
  const [status, setStatus] = useState<RealtimeStatus>(() =>
    userId && isSupabaseConfigured ? 'conectando' : 'desconectado',
  )

  // Refs para no re-suscribir cuando cambian las funciones por render
  const handlersRef = useRef({ onEventChange, onTaskChange, onReconnect })
  useEffect(() => {
    handlersRef.current = { onEventChange, onTaskChange, onReconnect }
  })

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase || !userId) {
      return
    }

    let everConnected = false
    const channel = supabase
      .channel(`calendar-sync-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events', filter: `user_id=eq.${userId}` },
        (payload: RealtimePostgresChangesPayload<CalendarEvent>) => {
          const { type, newRow, oldId } = extract(payload)
          handlersRef.current.onEventChange(type, newRow, oldId)
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
        (payload: RealtimePostgresChangesPayload<Task>) => {
          const { type, newRow, oldId } = extract(payload)
          handlersRef.current.onTaskChange(type, newRow, oldId)
        },
      )
      .subscribe((subscribeStatus) => {
        if (subscribeStatus === 'SUBSCRIBED') {
          setStatus('conectado')
          if (everConnected) {
            // Reconexión: refetch para reconciliar cambios perdidos
            handlersRef.current.onReconnect()
          }
          everConnected = true
        } else if (
          subscribeStatus === 'CHANNEL_ERROR' ||
          subscribeStatus === 'TIMED_OUT' ||
          subscribeStatus === 'CLOSED'
        ) {
          setStatus('desconectado')
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [userId])

  return status
}
