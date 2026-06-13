---
tags:
  - proyecto-personal
  - seguridad
  - auditoria
  - hardening
estado: corregido
fecha_creacion: 2026-06-13
ultima_revision: 2026-06-13
proyecto: "Organizador de calendario inteligente"
---

# Correcciones de la auditoría de seguridad

Remediación de los hallazgos de `security_audit.md`. Todos los aplicables quedaron
corregidos. Build, lint, 81 tests unitarios y 3 e2e pasan tras los cambios.

## Estado por hallazgo

| ID | Severidad | Estado | Corrección |
|----|-----------|--------|------------|
| V-01 | 🔴 Crítica | ✅ Corregido | La Edge Function exige JWT de usuario válido y solo permite enviar push a uno mismo (`user.id === userId`). |
| V-02 | 🟠 Alta | ✅ Corregido | CORS restringido a una allowlist (`ALLOWED_ORIGINS`, default Vercel + localhost). |
| V-03 | 🟠 Alta | ✅ Corregido | Email removido del comentario del código (placeholder genérico). |
| V-04 | 🟠 Alta | ✅ Corregido | `title`/`body` limitados (100 / 300 chars) y validados como string. |
| V-05 | 🟡 Media | ✅ Corregido | Migración `202606130002` agrega policy RLS de UPDATE en `push_subscriptions`. |
| V-06 | 🟡 Media | ✅ Corregido | `vercel.json`: CSP + `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. |
| V-07 | 🟡 Media | ✅ Corregido | `eventService`/`taskService` usan listas de columnas explícitas en vez de `select('*')`. |
| V-08 | 🟡 Media | ✅ Corregido | El SW solo cachea respuestas `response.type === 'basic'` (mismo origen). |
| V-09 | 🔵 Baja | ✅ Corregido | Cooldown progresivo en el login (2 s por intento, máx 30 s). |
| V-10 | 🔵 Baja | ➖ No aplica | Se usa `localStorage` (no cookies); sin atributos de cookie que endurecer. |
| V-11 | 🔵 Baja | ✅ Mitigado | Cache `v2` + `registration.update()` al volver a primer plano. Los assets ya los hashea Vite y la navegación es network-first, así que la versión efectiva es automática. |

## Detalle de cambios

### Edge Function `send-test-push` (V-01, V-02, V-03, V-04)

- **Autenticación**: lee `Authorization: Bearer <jwt>`, valida con `auth.getUser(token)`;
  sin token o token inválido → 401. El frontend (`supabase.functions.invoke`) ya envía el
  JWT de la sesión automáticamente, así que no requirió cambios en la app.
- **Autorización**: si `user.id !== userId` → 403. Las suscripciones se consultan por
  `user.id` (no por el `userId` del body).
- **CORS**: `Access-Control-Allow-Origin` se resuelve contra `ALLOWED_ORIGINS`.
- **Input**: `title`/`body` recortados a 100/300 caracteres.
- ⚠️ **Requiere re-desplegar la función** (Dashboard → Edge Functions → editar `send-test-push`
  → pegar el nuevo código → Deploy). Opcional: secret `ALLOWED_ORIGINS` con tus orígenes.

### Migración `202606130002_push_subscriptions_update_policy.sql` (V-05)

Aplicar en SQL Editor. Agrega `push_subs_update_own` (UPDATE con `using` + `with check`
por `auth.uid()`).

### `vercel.json` (V-06)

CSP que permite: self, estilos inline (Tailwind) + `cdn-uicons.flaticon.com`, fuentes de
flaticon, `connect-src` a `*.supabase.co` (REST + `wss` realtime), imágenes self/data/blob.
Se aplica al redeploy. Si algún recurso se bloquea, revisar la consola del navegador y
ajustar la directiva correspondiente.

### Servicios de datos (V-07)

`EVENT_COLUMNS` / `TASK_COLUMNS` con las columnas reales; usadas en list, insert y update.

### Service worker (V-08, V-11)

`response.type === 'basic'` antes de cachear; `CACHE_NAME = 'calendar-pwa-v2'`;
`registration.update()` en `visibilitychange`.

### Login (V-09)

Cooldown progresivo con cuenta regresiva en el botón tras intentos fallidos.

## Pasos manuales para que las correcciones surtan efecto

1. **Re-desplegar** la Edge Function `send-test-push` con el nuevo código (Dashboard).
2. **Aplicar** la migración `202606130002_push_subscriptions_update_policy.sql` (SQL Editor).
3. **Redeploy** en Vercel (automático al hacer push de este commit) para los headers/CSP.
4. Re-probar el push de prueba desde **Ajustes** (debe seguir funcionando para tu propio usuario;
   ahora un tercero sin tu sesión recibe 401/403).

## Verificación

- ✅ `npm run build` · ✅ `npm run lint` · ✅ `npm run test` (81/81) · ✅ `npm run test:e2e` (3/3)
