---
tags:
  - proyecto-personal
  - prompt
  - desarrollo
  - sprint-6
  - notificaciones
  - web-push
  - reminders
estado: actualizado
fecha_creacion: 2026-06-12
ultima_revision: 2026-06-12
proyecto: "[[Proyectos personales/Organizador de calendario inteligente/Organizador de calendario inteligente|Organizador de calendario inteligente]]"
sprint: 6
---

# Prompt Sprint 6 — Notificaciones

Proyecto: [[Proyectos personales/Organizador de calendario inteligente/Organizador de calendario inteligente|Organizador de calendario inteligente]]
Backlog: [[Proyectos personales/Organizador de calendario inteligente/04 Backlog/Backlog técnico etapa 1|Backlog técnico etapa 1]]
Ruta desarrollo: `C:\Users\Oscar\Documents\Proyecto-Personal`

## Cambios respecto al prompt original

- **Nuevo:** selector de tiempos de notificación en `EventForm` y `TaskForm`.
- **Nuevo:** `reminderService.ts` para crear/editar/borrar reminders al guardar eventos y tareas.
- **Nuevo:** el SW maneja el evento `push` y muestra la notificación con título y hora.
- Se mantiene: Web Push, `push_subscriptions`, Edge Function de prueba, VAPID keys, correo de respaldo.

## Uso

Copiar el bloque **PROMPT DIRECTO** completo y pegarlo en el agente/desarrollador.

---

## PROMPT DIRECTO

```text
Actúa como desarrollador senior full-stack especializado en Web Push, Supabase, recordatorios y UX mobile-first.

Vas a ejecutar SOLO el SPRINT 6 — Notificaciones.

RUTA DEL PROYECTO:
C:\Users\Oscar\Documents\Proyecto-Personal

APP PRINCIPAL:
C:\Users\Oscar\Documents\Proyecto-Personal\apps\calendar-pwa

REGLAS GENERALES:
- Trabaja SOLO este sprint. No avances al siguiente sin confirmación de Oscar.
- Verifica el estado real del repo antes de modificar cualquier archivo.
- No borres código existente sin justificarlo.
- No uses servicios pagos ni pidas tarjeta de crédito.
- NUNCA expongas VAPID_PRIVATE_KEY, service_role key, ni SMTP secrets en el frontend.
- Mantén TypeScript estricto, mobile-first y documentación actualizada.
- Al terminar ejecuta: npm run build, npm run lint, npm run test, npm run test:e2e.
- Si un comando falla, corrígelo o documenta el bloqueo real.

PRECONDICIONES VERIFICADAS:
- Sprint 1 completo: Auth + DB + RLS. La tabla `reminders` ya existe con: id, user_id, event_id, task_id, remind_at, channel, status, sent_at.
- Sprint 2 completo: EventForm y TaskForm funcionales (sin selector de reminders todavía).
- Sprint 5 completo: PWA, service worker (public/sw.js), IndexedDB, cola offline.

OBJETIVO PRINCIPAL:
Implementar el flujo completo de notificaciones: el usuario selecciona cuándo quiere ser notificado al crear o editar un evento/tarea, se guardan los reminders en Supabase, y el sistema envía Web Push en el momento indicado.

==================================================
PARTE 1 — SELECTOR DE TIEMPOS EN FORMULARIOS
==================================================

CONTEXTO:
La tabla `reminders` ya existe (Sprint 1). Tiene `remind_at timestamptz` y `channel (push|email|both)`.
Lo que falta es que el usuario pueda seleccionar desde la UI cuándo quiere ser notificado.

OPCIONES DE TIEMPO (obligatorias, en este orden exacto):
- Al inicio exacto (0 minutos antes)
- 10 minutos antes
- 15 minutos antes
- 20 minutos antes
- 30 minutos antes
- 1 hora antes (60 minutos)

COMPORTAMIENTO:
- El usuario puede seleccionar UNA o VARIAS opciones simultáneamente (checkboxes).
- Si no selecciona ninguna, no se crea ningún reminder.
- Para eventos: remind_at = starts_at - offset_minutes.
- Para tareas: remind_at = due_at - offset_minutes. Si due_at es null, no crear reminders para esa opción.
- Canal por defecto: "push".

ARCHIVOS A CREAR/MODIFICAR:

1. `src/features/notifications/reminderService.ts`
   Funciones:
   - `createReminders(params: { entityId: string, entityType: 'event'|'task', userId: string, anchorAt: string, offsets: number[] }): Promise<void>`
     - Calcula remind_at = anchorAt - offset minutos para cada offset.
     - Inserta filas en tabla `reminders`.
     - offsets=[] no hace nada.
   - `listReminderOffsets(entityType: 'event'|'task', entityId: string): Promise<number[]>`
     - Lee reminders del evento/tarea.
     - Devuelve lista de offsets en minutos (calcula diferencia entre anchorAt y remind_at).
   - `deleteReminders(entityType: 'event'|'task', entityId: string): Promise<void>`
     - Borra todos los reminders del evento o tarea.
   - `replaceReminders(params: { entityId, entityType, userId, anchorAt, offsets }): Promise<void>`
     - deleteReminders + createReminders (para edición).

2. `src/features/notifications/reminderConstants.ts`
   Exportar:
   ```ts
   export const REMINDER_OFFSETS: { label: string; minutes: number }[] = [
     { label: 'Al inicio exacto', minutes: 0 },
     { label: '10 minutos antes', minutes: 10 },
     { label: '15 minutos antes', minutes: 15 },
     { label: '20 minutos antes', minutes: 20 },
     { label: '30 minutos antes', minutes: 30 },
     { label: '1 hora antes', minutes: 60 },
   ]
   ```

3. `src/features/notifications/ReminderPicker.tsx`
   Componente reutilizable de checkboxes para seleccionar tiempos.
   Props: `value: number[]`, `onChange: (offsets: number[]) => void`, `disabled?: boolean`.
   Muestra los 6 checkboxes del listado anterior.
   Mobile-first: columna en móvil, puede ser 2 columnas en pantallas sm+.

4. Modificar `src/features/events/EventForm.tsx`:
   - Agregar estado: `const [reminderOffsets, setReminderOffsets] = useState<number[]>([])`.
   - Si `initial` existe, precargar offsets desde `listReminderOffsets('event', initial.id)`.
   - Añadir `<ReminderPicker value={reminderOffsets} onChange={setReminderOffsets} />` en el formulario, debajo del campo de ubicación.
   - Pasar `reminderOffsets` en `EventFormValues`.

5. Modificar `src/features/tasks/TaskForm.tsx`:
   - Mismo patrón que EventForm.
   - Si `initial` existe, precargar offsets desde `listReminderOffsets('task', initial.id)`.
   - Añadir `<ReminderPicker .../>`.
   - Pasar `reminderOffsets` en `TaskFormValues`.

6. Modificar `src/features/calendar/CalendarPage.tsx`:
   - `onCreateEvent`: tras crear el evento, llamar `createReminders({ entityId: created.id, entityType: 'event', userId: user.id, anchorAt: created.starts_at, offsets: values.reminderOffsets })`.
   - `onUpdateEvent`: tras actualizar, llamar `replaceReminders(...)`.
   - `onCreateTask`: tras crear tarea, llamar `createReminders` si `due_at` existe.
   - `onUpdateTask`: tras actualizar, llamar `replaceReminders` si `due_at` existe.

TESTS MÍNIMOS:
- `src/features/notifications/reminderService.test.ts`: probar cálculo de remind_at a partir de anchorAt y offset. Probar que offsets=[] no genera inserts.
- `src/features/notifications/ReminderPicker.test.tsx`: probar que checkboxes seleccionan/deseleccionan correctamente.

==================================================
PARTE 2 — WEB PUSH
==================================================

MIGRACIÓN SQL:
Crear `supabase/migrations/*_push_subscriptions.sql`:

```sql
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

alter table public.push_subscriptions enable row level security;

create policy "push_subs_select_own" on public.push_subscriptions
  for select using (user_id = (select auth.uid()));

create policy "push_subs_insert_own" on public.push_subscriptions
  for insert with check (user_id = (select auth.uid()));

create policy "push_subs_delete_own" on public.push_subscriptions
  for delete using (user_id = (select auth.uid()));
```

VARIABLES DE ENTORNO REQUERIDAS:
Frontend (.env.local):
- VITE_VAPID_PUBLIC_KEY=<tu VAPID public key>

Backend / Supabase Edge Functions (secretos, NUNCA en frontend):
- VAPID_PRIVATE_KEY=<tu VAPID private key>
- VAPID_EMAIL=mailto:jhhm999@gmail.com
- SUPABASE_SERVICE_ROLE_KEY (disponible automáticamente en Edge Functions)

Comando para generar VAPID keys:
```bash
npx web-push generate-vapid-keys
```

ARCHIVO: `src/features/notifications/pushService.ts`
Funciones:
- `isPushSupported(): boolean` — verifica Notification + serviceWorker + PushManager.
- `getNotificationPermission(): NotificationPermission` — estado actual.
- `requestAndSubscribe(vapidPublicKey: string): Promise<PushSubscription | null>` — pide permiso y suscribe.
- `savePushSubscription(sub: PushSubscription, userId: string): Promise<void>` — guarda endpoint/p256dh/auth en Supabase.
- `getCurrentSubscription(): Promise<PushSubscription | null>` — subscription activa del SW.

ACTUALIZAR `public/sw.js` — agregar handler de push al final:
```js
self.addEventListener('push', (event) => {
  if (!event.data) return
  let data = {}
  try { data = event.data.json() } catch { data = { title: 'Recordatorio', body: event.data.text() } }
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Recordatorio', {
      body: data.body ?? '',
      icon: '/pwa-192.png',
      badge: '/pwa-192.png',
      tag: data.tag ?? 'reminder',
      data: { url: data.url ?? '/app' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((list) => {
      const url = event.notification.data?.url ?? '/app'
      const existing = list.find((c) => c.url.includes(url) && 'focus' in c)
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
})
```

EDGE FUNCTION: `supabase/functions/send-test-push/index.ts`
- Recibe: `{ userId: string, title: string, body: string }`.
- Busca push subscriptions del userId en Supabase.
- Envía Web Push usando librería `web-push` (Deno compatible).
- Retorna JSON con resultado.
- VAPID keys y service_role desde variables de entorno de Supabase (secrets, nunca hardcoded).

ARCHIVO: `src/features/notifications/NotificationSettings.tsx`
UI:
- Sección "Notificaciones".
- Detectar soporte (no soportado / soportado).
- Mostrar estado del permiso: no solicitado / permitido / denegado.
- Botón "Activar notificaciones" — llama requestAndSubscribe y guarda subscription.
- Botón "Enviar notificación de prueba" — llama Edge Function send-test-push.
- Mensaje específico para iPhone: "Para recibir notificaciones en iPhone, instala la app en tu pantalla de inicio desde Safari (botón Compartir → Agregar a pantalla de inicio)".
- Si Notification API no disponible: mostrar mensaje claro de no soporte.

INTEGRACIÓN EN LA APP:
- Agregar ruta o sección accesible desde el menú principal o desde CalendarPage.
- No bloquear la app si el usuario rechaza permisos.

TESTS MÍNIMOS:
- `src/features/notifications/pushService.test.ts`: probar `isPushSupported` en entorno sin APIs.
- `src/features/notifications/NotificationSettings.test.tsx`: probar estados básicos de UI (no soportado, permiso denegado, permiso permitido).

==================================================
PARTE 3 — CORREO DE RESPALDO (PREPARACIÓN)
==================================================

- NO activar ni pagar ningún servicio de email.
- Documentar en `docs/13-sprint-6-notificaciones.md` cómo configurar SMTP en Supabase Auth para correos de recordatorio futuros.
- Dejar comentario `// TODO: email backup` en reminderService donde corresponde.

==================================================
DOCUMENTACIÓN OBLIGATORIA
==================================================

Crear `docs/13-sprint-6-notificaciones.md` con:
1. Cómo generar VAPID keys.
2. Variables de entorno a configurar (frontend y Supabase).
3. Cómo desplegar Edge Function send-test-push.
4. Cómo probar notificaciones en navegador de escritorio.
5. Cómo probar en iPhone real con PWA instalada.
6. Limitaciones conocidas de Web Push en iOS.
7. Tiempos de notificación disponibles y cómo funciona el cálculo de remind_at.
8. Configuración futura de correo de respaldo.

==================================================
CRITERIOS DE ACEPTACIÓN
==================================================

- [ ] Al crear un evento, el usuario puede seleccionar uno o más tiempos de notificación.
- [ ] Al crear una tarea con fecha límite, el usuario puede seleccionar tiempos de notificación.
- [ ] Al editar un evento/tarea, los tiempos previamente seleccionados aparecen precargados.
- [ ] Los reminders se guardan en la tabla `reminders` de Supabase con el `remind_at` correcto.
- [ ] `push_subscriptions` existe con RLS.
- [ ] El frontend puede solicitar permiso, suscribirse y guardar subscription.
- [ ] El SW muestra la notificación al recibir un push con título y cuerpo.
- [ ] La Edge Function send-test-push existe o queda documentada con instrucciones si faltan secrets.
- [ ] VAPID_PRIVATE_KEY y service_role nunca están en el frontend.
- [ ] npm run build pasa.
- [ ] npm run lint pasa.
- [ ] npm run test pasa (18+ tests).

==================================================
FORMATO FINAL OBLIGATORIO
==================================================

Al terminar, entregar en este orden:
1. Sprint ejecutado
2. Resumen de implementación (qué se hizo en Parte 1, 2 y 3)
3. Archivos creados/modificados con descripción breve
4. Comandos ejecutados y resultados
5. Tiempos de notificación: confirmar que los 6 funcionan correctamente
6. Pruebas manuales sugeridas para Oscar (PC + iPhone)
7. Riesgos o bloqueos
8. Pendientes para Sprint 7
9. Estado Git
10. Pregunta final: "¿Confirmas que avance al Sprint 7?"

No avances al Sprint 7 sin confirmación de Oscar.
```
