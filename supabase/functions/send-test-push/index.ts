// Edge Function: send-test-push
// Envía una notificación Web Push de prueba a todas las suscripciones del usuario.
//
// Secrets requeridos (Supabase → Edge Functions → Secrets), NUNCA en el frontend:
//   VAPID_PUBLIC_KEY   = clave pública VAPID
//   VAPID_PRIVATE_KEY  = clave privada VAPID
//   VAPID_EMAIL        = mailto:oscarchavez@gmail.com
//   SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY se inyectan automáticamente.
//
// Desplegar:  supabase functions deploy send-test-push
// Probar:     se invoca desde el frontend con supabase.functions.invoke('send-test-push', ...)

import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PushRow {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, title, body } = await req.json()
    if (!userId) {
      return json({ error: 'Falta userId' }, 400)
    }

    const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY')
    const vapidEmail = Deno.env.get('VAPID_EMAIL') ?? 'mailto:admin@example.com'
    if (!vapidPublic || !vapidPrivate) {
      return json({ error: 'Faltan VAPID keys en los secrets de la función' }, 500)
    }
    webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', userId)
      .is('revoked_at', null)
    if (error) return json({ error: error.message }, 500)
    if (!subs || subs.length === 0) {
      return json({ error: 'No hay suscripciones para este usuario' }, 404)
    }

    const payload = JSON.stringify({
      title: title ?? 'Recordatorio',
      body: body ?? 'Notificación de prueba del Organizador de calendario.',
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
        // 404/410 → endpoint muerto: marcar como revocado
        const statusCode = (err as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .update({ revoked_at: new Date().toISOString() })
            .eq('id', sub.id)
        }
      }
    }

    return json({ sent, failed, total: subs.length })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500)
  }
})

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
