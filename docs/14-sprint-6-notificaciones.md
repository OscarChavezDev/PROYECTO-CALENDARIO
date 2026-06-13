---
tags:
  - proyecto-personal
  - sprint-6
  - notificaciones
  - web-push
  - reminders
estado: implementado-pendiente-config
fecha_creacion: 2026-06-13
ultima_revision: 2026-06-13
proyecto: "Organizador de calendario inteligente"
sprint: 6
---

# Sprint 6 — Notificaciones

> Nota: el número 13 ya lo ocupa `13-despliegue-vercel.md`, por eso este doc es el 14.

## Qué se implementó

### Parte 1 — Selector de tiempos de notificación

- `src/features/notifications/reminderConstants.ts` — las 6 opciones: al inicio exacto (0),
  10, 15, 20, 30 y 60 minutos antes.
- `src/features/notifications/ReminderPicker.tsx` — checkboxes (1 columna en móvil, 2 en sm+).
- `src/features/notifications/reminderService.ts`:
  - `createReminders` (remind_at = anchor − offset; offsets=[] no inserta nada),
  - `listReminderOffsets` (reconstruye offsets desde la BD para precargar al editar),
  - `deleteReminders`, `replaceReminders`.
  - Helpers puros `remindAtFor` / `offsetsFromReminders` (testeados).
- `EventForm` y `TaskForm` incluyen el `<ReminderPicker>` y precargan los tiempos al editar.
- `CalendarPage` crea/reemplaza los reminders tras guardar (solo en línea; ver limitaciones).

Cálculo: para eventos el ancla es `starts_at`; para tareas, `due_at` (si la tarea no tiene
`due_at` no se crean reminders). Canal por defecto `push`.

### Parte 2 — Web Push

- Migración `supabase/migrations/202606130001_push_subscriptions.sql` (tabla + RLS por usuario
  + índice único user_id/endpoint).
- `src/features/notifications/pushService.ts`: `isPushSupported`, `getNotificationPermission`,
  `requestAndSubscribe`, `savePushSubscription` (upsert), `getCurrentSubscription`.
- `public/sw.js`: handlers `push` (muestra la notificación) y `notificationclick` (enfoca/abre `/app`).
- Edge Function `supabase/functions/send-test-push/index.ts` (Deno + `npm:web-push`): envía push
  a las suscripciones del usuario; marca como revocadas las que devuelven 404/410.
- `src/features/notifications/NotificationSettings.tsx` en la ruta protegida **`/ajustes`**
  (enlace "Ajustes" en la barra superior): detecta soporte, muestra el permiso, botón para
  activar y botón para enviar una prueba.

### Parte 3 — Correo de respaldo (preparación)

No se activó ningún servicio de correo. Ver sección "Correo de respaldo (futuro)" abajo.
Hay un `// TODO: email backup` en `reminderService.ts`.

## 1. Generar las VAPID keys

```bash
npx web-push generate-vapid-keys
```

Ya se generó un par para este proyecto. La **pública** está en `apps/calendar-pwa/.env.local`
como `VITE_VAPID_PUBLIC_KEY`. La **privada** NO está en el repo: se guarda en los secrets de
Supabase (ver abajo).

## 2. Variables de entorno

**Frontend** (`apps/calendar-pwa/.env.local` y también en Vercel → Settings → Environment Variables):
```
VITE_VAPID_PUBLIC_KEY=<clave pública VAPID>
```

**Supabase Edge Functions** (Dashboard → Edge Functions → Secrets, o `supabase secrets set`):
```
VAPID_PUBLIC_KEY=<clave pública VAPID>
VAPID_PRIVATE_KEY=<clave privada VAPID>   # NUNCA en el frontend
VAPID_EMAIL=mailto:jhhm999@gmail.com
```
(`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` se inyectan solos en las Edge Functions.)

## 3. Aplicar la migración y desplegar la Edge Function

1. **Migración**: SQL Editor → pegar `202606130001_push_subscriptions.sql` → Run.
2. **Edge Function** (requiere [Supabase CLI](https://supabase.com/docs/guides/cli)):
   ```bash
   supabase functions deploy send-test-push --project-ref <ref-del-proyecto>
   supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_EMAIL=mailto:jhhm999@gmail.com
   ```
   Si aún no instalas la CLI, la app igual funciona: el botón "Activar notificaciones" y el
   guardado de la suscripción no dependen de la función; solo el botón "Enviar prueba" la necesita.

## 4. Probar en navegador de escritorio

1. App desplegada en HTTPS (Vercel) o `npm run preview` en local.
2. Login → **Ajustes** → "Activar notificaciones" → aceptar el permiso del navegador.
3. "Enviar notificación de prueba" → debe llegar una notificación del sistema en segundos.
4. Crear un evento con hora cercana y marcar "10 minutos antes" → se crea el reminder
   (el envío programado real lo hará un cron/scheduler en un sprint posterior; ver limitaciones).

## 5. Probar en iPhone real

1. La PWA **debe estar instalada** en la pantalla de inicio (Safari → Compartir → Agregar a
   pantalla de inicio) y abrirse desde ahí. Web Push en iOS **no** funciona desde Safari normal.
2. Abrir la PWA instalada → Ajustes → Activar notificaciones → aceptar.
3. Enviar prueba desde el botón.

## 6. Limitaciones conocidas

- **iOS ≥ 16.4** es requisito para Web Push, y solo con la PWA instalada (no en Safari).
- **El envío programado de los reminders** (que el push llegue exactamente "10 min antes")
  necesita un proceso que recorra la tabla `reminders` y dispare la Edge Function en el momento
  `remind_at`. Eso es un **cron/Scheduled Function** que se deja para el Sprint 7 / Etapa 2.
  Por ahora los reminders se **guardan** correctamente y el push **de prueba** funciona manual.
- Los reminders solo se gestionan **con conexión** (necesitan el id real del servidor); crear un
  evento offline no crea sus reminders hasta re-editarlo en línea.
- Safari puede revocar permisos/cachés de PWAs sin uso prolongado.

## 7. Tiempos disponibles y cálculo de remind_at

| Opción | minutos | remind_at |
|---|---|---|
| Al inicio exacto | 0 | anchor |
| 10 minutos antes | 10 | anchor − 10 min |
| 15 minutos antes | 15 | anchor − 15 min |
| 20 minutos antes | 20 | anchor − 20 min |
| 30 minutos antes | 30 | anchor − 30 min |
| 1 hora antes | 60 | anchor − 60 min |

`anchor` = `starts_at` (evento) o `due_at` (tarea). Se pueden elegir varios a la vez.

## 8. Correo de respaldo (futuro)

Para recordatorios por correo cuando el push falle:
1. Supabase → **Authentication → Emails / SMTP Settings**: configurar un SMTP propio
   (p. ej. un free tier de Resend/Brevo/SES). **No activar pagos sin autorización de Oscar.**
2. Extender la Edge Function (o una nueva) para que, si un reminder tiene `channel in ('email','both')`,
   envíe el correo además del push. El `// TODO: email backup` en `reminderService.ts` marca el punto.

## Verificación ejecutada

- ✅ `npm run build` · ✅ `npm run lint` · ✅ `npm run test` (81/81, 22 archivos) · ✅ `npm run test:e2e` (3/3)
