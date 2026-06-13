---
tags:
  - proyecto-personal
  - prompt
  - etapa-2
  - sprint-e2-1
  - scheduler
  - reminders
  - web-push
estado: listo-para-usar
fecha_creacion: 2026-06-13
sprint: E2-S1
---

# Prompt E2 Sprint 1 — Scheduler de reminders

Backlog: [[Proyectos personales/Organizador de calendario inteligente/04 Backlog/Backlog técnico etapa 2|Backlog técnico etapa 2]]

---

## PROMPT DIRECTO

```text
Actúa como desarrollador senior full-stack especializado en Supabase Edge Functions, crons, Web Push y Postgres.

Vas a ejecutar SOLO el SPRINT E2-S1 — Scheduler de reminders.

RUTA DEL PROYECTO:
C:\Users\Oscar\Documents\Proyecto-Personal

APP PRINCIPAL:
C:\Users\Oscar\Documents\Proyecto-Personal\apps\calendar-pwa

REGLAS GENERALES:
- Trabaja SOLO este sprint. No avances al siguiente sin confirmación de Oscar.
- Verifica el estado real del repo antes de modificar cualquier archivo.
- No borres código existente sin justificarlo.
- No uses servicios pagos ni pidas tarjeta.
- NUNCA expongas VAPID_PRIVATE_KEY, service_role key ni SMTP secrets en el frontend.
- Mantén TypeScript estricto, mobile-first y documentación actualizada.
- Al terminar ejecuta: npm run build, npm run lint, npm run test.

CONTEXTO DEL PROYECTO:
- Etapa 1 completa: React + TypeScript + Vite + Supabase/Postgres + PWA.
- La tabla `reminders` ya existe con: id, user_id, event_id, task_id, remind_at, channel, status (pending/sent/failed/cancelled), sent_at.
- La tabla `push_subscriptions` ya existe con: id, user_id, endpoint, p256dh, auth.
- El service worker ya maneja el evento `push` y muestra notificaciones.
- VAPID keys generadas. VAPID_PUBLIC_KEY en frontend. VAPID_PRIVATE_KEY debe ir en Supabase secrets.
- Email del proyecto: jhhm999@gmail.com.

OBJETIVO:
Activar el envío automático de notificaciones push cuando llega el momento de un recordatorio. Crear una Edge Function que se ejecuta periódicamente, busca reminders pendientes y envía el push al dispositivo del usuario.

==================================================
TAREA 1 — EDGE FUNCTION: process-reminders
==================================================

ARCHIVO: `supabase/functions/process-reminders/index.ts`

LÓGICA:
1. Consultar `reminders` donde `status = 'pending'` y `remind_at <= now()`.
   - Incluir join a `events` o `tasks` para obtener el título y la hora.
   - Limitar a 50 reminders por ejecución para no superar límites.
2. Para cada reminder:
   a. Obtener `push_subscriptions` del `user_id`.
   b. Enviar Web Push a cada subscription con payload:
      ```json
      {
        "title": "Recordatorio: [título del evento/tarea]",
        "body": "[hora de inicio] — [descripción breve]",
        "tag": "reminder-[reminder.id]",
        "url": "/app"
      }
      ```
   c. Si el push llega → actualizar `reminders.status = 'sent'` y `sent_at = now()`.
   d. Si el push falla con error 410 (Gone) → marcar subscription como revocada (`revoked_at`).
   e. Si falla por otro motivo → `status = 'failed'`.
3. Devolver JSON: `{ processed: N, sent: N, failed: N }`.

VARIABLES DE ENTORNO REQUERIDAS (Supabase secrets):
- VAPID_PRIVATE_KEY
- VAPID_EMAIL (mailto:jhhm999@gmail.com)
- SUPABASE_URL (disponible automáticamente)
- SUPABASE_SERVICE_ROLE_KEY (disponible automáticamente)

LIBRERÍA WEB PUSH:
Usar `npm:web-push` compatible con Deno. Si no disponible, usar fetch directo a la Push API con firma JWT VAPID manual (documentar).

==================================================
TAREA 2 — CONFIGURAR CRON EN SUPABASE
==================================================

Supabase permite programar Edge Functions vía `pg_cron` o desde el dashboard.

Documentar en `docs/15-scheduler-reminders.md`:
1. Cómo invocar `process-reminders` cada 5 minutos desde el dashboard de Supabase.
2. Alternativa: usar `pg_cron` con `select net.http_post(...)` para llamar a la función.
3. Cómo verificar que el cron está corriendo.
4. Variables de entorno a configurar en Supabase → Settings → Edge Functions → Secrets.

Si es posible, crear `supabase/functions/process-reminders/README.md` con instrucciones de despliegue.

==================================================
TAREA 3 — MIGRACION SQL (si aplica)
==================================================

Verificar si la tabla `reminders` ya tiene índice en `(status, remind_at)`.
Si no existe:
```sql
create index if not exists reminders_status_remind_idx
  on public.reminders (status, remind_at)
  where status = 'pending';
```

==================================================
DOCUMENTACIÓN OBLIGATORIA
==================================================

Crear `docs/15-scheduler-reminders.md`:
1. Cómo funciona el scheduler.
2. Cómo configurar el cron en Supabase.
3. Variables de entorno necesarias.
4. Cómo probar manualmente (crear reminder con remind_at = now() + 1 minuto, esperar push).
5. Limitaciones del free tier de Supabase (Edge Function invocations, pg_cron).
6. Cómo depurar si no llegan notificaciones.

==================================================
CRITERIOS DE ACEPTACIÓN
==================================================

- [ ] Edge Function `process-reminders` existe y compila sin errores.
- [ ] La función consulta reminders pendientes y envía Web Push.
- [ ] Actualiza `status` a `sent` o `failed` correctamente.
- [ ] Subscriptions revocadas (410) se marcan como `revoked_at`.
- [ ] Documentación de cron y variables de entorno clara.
- [ ] npm run build pasa.
- [ ] npm run test pasa (sin regresiones).

FORMATO FINAL:
1. Sprint ejecutado
2. Archivos creados/modificados
3. Comandos ejecutados y resultados
4. Cómo probar manualmente
5. Configuración pendiente de Oscar (secrets, cron)
6. Pendientes para E2-S2
7. Pregunta: "¿Confirmas que avance al Sprint E2-S2?"
```
