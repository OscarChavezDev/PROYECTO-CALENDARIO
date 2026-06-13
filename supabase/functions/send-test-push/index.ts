// Edge Function: send-test-push
// Envía una notificación Web Push de prueba a las suscripciones del USUARIO AUTENTICADO.
//
// Seguridad:
// - Requiere un JWT de usuario válido (Authorization: Bearer <token>).
// - Solo permite enviar push a uno mismo (user.id === userId del body).
// - CORS restringido a una lista de orígenes permitidos.
//
// Secrets requeridos (Supabase → Edge Functions → Secrets), NUNCA en el frontend:
//   VAPID_PUBLIC_KEY   = clave pública VAPID
//   VAPID_PRIVATE_KEY  = clave privada VAPID
//   VAPID_EMAIL        = mailto:tu-correo@ejemplo.com
//   ALLOWED_ORIGINS    = (opcional) orígenes separados por coma
//   SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY se inyectan automáticamente.
//
// Desplegar:  supabase functions deploy send-test-push
// Probar:     se invoca desde el frontend con supabase.functions.invoke('send-test-push', ...)

import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const DEFAULT_ORIGINS = [
  'https://proyecto-calendario-five.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
]

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? DEFAULT_ORIGINS.join(','))
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

const MAX_TITLE = 100
const MAX_BODY = 300

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

interface PushRow {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  const cors = corsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // --- Autenticación: exigir un JWT de usuario válido ---
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'No autorizado' }, 401, cors)
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)
    if (authError || !user) return json({ error: 'Token inválido' }, 401, cors)

    const { userId, title, body } = await req.json()
    if (!userId) return json({ error: 'Falta userId' }, 400, cors)

    // --- Autorización: solo puedes enviarte push a ti mismo ---
    if (user.id !== userId) {
      return json({ error: 'No autorizado para este usuario' }, 403, cors)
    }

    const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY')
    const vapidEmail = Deno.env.get('VAPID_EMAIL') ?? 'mailto:admin@example.com'
    if (!vapidPublic || !vapidPrivate) {
      return json({ error: 'Faltan VAPID keys en los secrets de la función' }, 500, cors)
    }
    webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate)

    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', user.id)
      .is('revoked_at', null)
    if (error) return json({ error: error.message }, 500, cors)
    if (!subs || subs.length === 0) {
      return json({ error: 'No hay suscripciones para este usuario' }, 404, cors)
    }

    // Sanitizar/limitar el contenido de la notificación
    const safeTitle = typeof title === 'string' ? title.slice(0, MAX_TITLE) : 'Recordatorio'
    const safeBody =
      typeof body === 'string'
        ? body.slice(0, MAX_BODY)
        : 'Notificación de prueba del Organizador de calendario.'

    const payload = JSON.stringify({
      title: safeTitle,
      body: safeBody,
      url: '/app',
      tag: 'test-push',
    })

    let sent = 0
    let failed = 0
    for (const sub of subs as PushRow[]) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        )
        sent++
      } catch (err) {
        failed++
        const statusCode = (err as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .update({ revoked_at: new Date().toISOString() })
            .eq('id', sub.id)
        }
      }
    }

    return json({ sent, failed, total: subs.length }, 200, cors)
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500, cors)
  }
})

function json(payload: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
