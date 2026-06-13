---
tags:
  - proyecto-personal
  - notificaciones
  - web-push
  - reminders
  - cron
estado: implementado-pendiente-config
fecha_creacion: 2026-06-13
ultima_revision: 2026-06-13
proyecto: "Organizador de calendario inteligente"
---

# Recordatorios programados (Web Push automático)

Cierra la pieza que faltaba del Sprint 6: que el recordatorio que configuras en un evento
o tarea ("15 min antes", "al inicio", etc.) **llegue solo** como notificación a su hora, sin
tener que pulsar nada.

## Cómo funciona

1. Al crear/editar un evento o tarea, la app guarda filas en `reminders` con su `remind_at`
   (ya implementado en el Sprint 6).
2. Un **cron** en Supabase ejecuta cada minuto la Edge Function **`send-due-reminders`**.
3. La función busca los `reminders` con `status = 'pending'` y `remind_at <= ahora`, arma el
   título/hora desde el evento o tarea, envía el Web Push a las suscripciones del usuario y
   marca el reminder como `sent` (o `cancelled` si el evento/tarea fue borrado/cancelado/completado).

## Configuración (una sola vez)

### 1. Secrets de la función

En Supabase → Edge Functions → Secrets, agrega (las VAPID ya están del Sprint 6):

```
CRON_SECRET = <el secreto que te pasé por el chat>
```

### 2. Desplegar la función con Verify JWT OFF

Es un job de sistema (no lleva sesión de usuario); se protege con `CRON_SECRET`, así que su
"Verify JWT" debe estar **desactivado**.

- **Dashboard**: Edge Functions → *Deploy a new function* → nombre `send-due-reminders` →
  pegar el contenido de `supabase/functions/send-due-reminders/index.ts` → en la configuración
  de la función, **desactivar "Verify JWT"** → Deploy.
- **CLI**: `supabase functions deploy send-due-reminders --no-verify-jwt`

### 3. Habilitar extensiones y programar el cron

1. Database → Extensions: habilitar **`pg_cron`** y **`pg_net`**.
2. Abrir `supabase/functions/send-due-reminders/cron.sql`, reemplazar `<PROJECT_REF>` y
   `<CRON_SECRET>` por tus valores y ejecutarlo en SQL Editor.

> `<PROJECT_REF>` es la parte de tu URL de Supabase: en `https://xxxx.supabase.co`, el ref es `xxxx`.

## Cómo probar (sin esperar al minuto)

1. Asegúrate de tener notificaciones **activadas** (Ajustes → Activar notificaciones).
2. Crea un evento que empiece en ~2 minutos y marca el recordatorio **"al inicio exacto"** (y/o
   "10 minutos antes" con un evento dentro de 10 min).
3. Espera a que pase el `remind_at`. En el siguiente tic del cron (máximo ~1 min después) debe
   llegarte la notificación con el título del evento y su hora.

Prueba manual inmediata (forzar una corrida): en SQL Editor,
`select net.http_post(...)` con los mismos `url`/`headers` del cron, o invoca la función con
el header `x-cron-secret`. Procesará cualquier reminder ya vencido.

## Estados de un reminder

- `pending` → aún no enviado (es lo que busca el cron).
- `sent` → push enviado correctamente (`sent_at` con la hora).
- `failed` → no había suscripciones o todos los envíos fallaron.
- `cancelled` → el evento/tarea fue borrado, cancelado o completado antes de la hora.

## Limitaciones

- La precisión es de ~1 minuto (la granularidad del cron). Para "15 min antes" llega entre el
  minuto exacto y ~1 min después: suficiente para recordatorios.
- iOS solo recibe push con la **PWA instalada** (igual que el push de prueba).
- Si el dispositivo está sin conexión cuando se envía, el push puede no entregarse (es Web Push,
  no garantizado). El correo de respaldo (futuro) cubriría los casos críticos.
- Canal: hoy se envía siempre por push. El soporte de `channel='email'/'both'` queda para cuando
  se active el correo de respaldo.

## Seguridad

- La función exige `x-cron-secret` correcto → un tercero no puede dispararla.
- Usa `service_role` solo del lado servidor (nunca en el frontend).
- No expone VAPID privada ni el secreto del cron al cliente.
