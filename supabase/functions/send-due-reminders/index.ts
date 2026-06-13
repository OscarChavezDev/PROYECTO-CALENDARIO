// Edge Function: send-due-reminders
// Recorre los recordatorios vencidos (reminders.status='pending' y remind_at <= now)
// y envía un Web Push por cada uno. Pensada para ejecutarse cada minuto desde pg_cron.
//
// Seguridad: NO usa JWT de usuario (es un job de sistema). Se protege con un secreto
// compartido en el header `x-cron-secret`. Despliega esta función con "Verify JWT" = OFF.
//
// Secrets requeridos (Supabase → Edge Functions → Secrets):
//   CRON_SECRET        = secreto aleatorio (mismo valor en el header del cron)
//   VAPID_PUBLIC_KEY   = clave pública VAPID
//   VAPID_PRIVATE_KEY  = clave privada VAPID
//   VAPID_EMAIL        = mailto:tu-correo@ejemplo.com
//   SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY se inyectan automáticamente.
//
// Desplegar:  supabase functions deploy send-due-reminders --no-verify-jwt
// Programar:  ver supabase/functions/send-due-reminders/cron.sql

import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const TZ = 'America/Bogota'
const timeFmt = new Intl.DateTimeFormat('es-CO', {
  timeZone: TZ,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

interface Reminder {
  id: string
  user_id: string
  event_id: string | null
  task_id: string | null
  remind_at: string
}
interface PushRow {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  // --- Autenticación por secreto compartido ---
  const secret = Deno.env.get('CRON_SECRET')
  if (!secret || req.headers.get('x-cron-secret') !== secret) {
    return json({ error: 'No autorizado' }, 401)
  }

  const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY')
  const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY')
  const vapidEmail = Deno.env.get('VAPID_EMAIL') ?? 'mailto:admin@example.com'
  if (!vapidPublic || !vapidPrivate) {
    return json({ error: 'Faltan VAPID keys en los secrets' }, 500)
  }
  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // --- Recordatorios vencidos pendientes ---
  const { data: due, error } = await supabase
    .from('reminders')
    .select('id, user_id, event_id, task_id, remind_at')
    .eq('status', 'pending')
    .lte('remind_at', new Date().toISOString())
    .order('remind_at', { ascending: true })
    .limit(100)
  if (error) return json({ error: error.message }, 500)
  if (!due || due.length === 0) return json({ processed: 0, sent: 0, skipped: 0, failed: 0 })

  const reminders = due as Reminder[]

  // --- Cargar entidades (eventos/tareas) en lote para título/hora ---
  const eventIds = [...new Set(reminders.filter((r) => r.event_id).map((r) => r.event_id!))]
  const taskIds = [...new Set(reminders.filter((r) => r.task_id).map((r) => r.task_id!))]
  const events = new Map<string, Record<string, unknown>>()
  const tasks = new Map<string, Record<string, unknown>>()

  if (eventIds.length) {
    const { data } = await supabase
      .from('events')
      .select('id, title, starts_at, all_day, status, deleted_at')
      .in('id', eventIds)
    for (const e of data ?? []) events.set(e.id as string, e)
  }
  if (taskIds.length) {
    const { data } = await supabase
      .from('tasks')
      .select('id, title, due_at, status, deleted_at')
      .in('id', taskIds)
    for (const t of data ?? []) tasks.set(t.id as string, t)
  }

  // --- Suscripciones por usuario (cacheadas) ---
  const subsCache = new Map<string, PushRow[]>()
  async function getSubs(userId: string): Promise<PushRow[]> {
    const cached = subsCache.get(userId)
    if (cached) return cached
    const { data } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', userId)
      .is('revoked_at', null)
    const rows = (data ?? []) as PushRow[]
    subsCache.set(userId, rows)
    return rows
  }

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const r of reminders) {
    let title = 'Recordatorio'
    let body = ''
    let url = '/app'
    let cancel = false

    if (r.event_id) {
      const e = events.get(r.event_id)
      if (!e || e.deleted_at || e.status === 'cancelado') {
        cancel = true
      } else {
        title = e.title as string
        body = e.all_day
          ? 'Evento · todo el día'
          : `Evento · comienza a las ${timeFmt.format(new Date(e.starts_at as string))}`
        url = `/evento/${r.event_id}`
      }
    } else if (r.task_id) {
      const t = tasks.get(r.task_id)
      if (!t || t.deleted_at || t.status === 'completada' || t.status === 'cancelada') {
        cancel = true
      } else {
        title = t.title as string
        body = t.due_at
          ? `Tarea · vence a las ${timeFmt.format(new Date(t.due_at as string))}`
          : 'Tarea pendiente'
        url = `/tarea/${r.task_id}`
      }
    }

    // El evento/tarea fue borrado, cancelado o completado: no notificar
    if (cancel) {
      await supabase.from('reminders').update({ status: 'cancelled' }).eq('id', r.id)
      skipped++
      continue
    }

    const subs = await getSubs(r.user_id)
    if (subs.length === 0) {
      await supabase
        .from('reminders')
        .update({ status: 'failed', sent_at: new Date().toISOString() })
        .eq('id', r.id)
      failed++
      continue
    }

    const payload = JSON.stringify({ title, body, url, tag: `reminder-${r.id}` })
    let ok = 0
    for (const s of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        )
        ok++
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .update({ revoked_at: new Date().toISOString() })
            .eq('id', s.id)
          subsCache.delete(r.user_id)
        }
      }
    }

    await supabase
      .from('reminders')
      .update({ status: ok > 0 ? 'sent' : 'failed', sent_at: new Date().toISOString() })
      .eq('id', r.id)
    if (ok > 0) sent++
    else failed++
  }

  return json({ processed: reminders.length, sent, skipped, failed })
})
