---
tags:
  - proyecto-personal
  - sprint-7
  - validacion
  - mvp
  - qa
estado: mvp-aprobado
fecha_creacion: 2026-06-13
ultima_revision: 2026-06-13
proyecto: "Organizador de calendario inteligente"
sprint: 7
---

# Sprint 7 — Validación MVP (Etapa 1)

> El número 14 lo ocupa `14-sprint-6-notificaciones.md`; por eso este informe es el 15.

## Resultado: ✅ MVP APROBADO con observaciones menores

El MVP de Etapa 1 cumple todos los criterios de aceptación. Las observaciones abiertas son
mejoras de Etapa 2, ninguna bloqueante.

## Checklist de aceptación

| # | Criterio | Estado | Evidencia |
|---|----------|--------|-----------|
| 1 | Registro con correo real | ✅ | Probado por Oscar (Sprint 1) |
| 2 | Verificación de correo | ✅ | Enlace de Supabase Auth; probado |
| 3 | Login (PC + viewport móvil) | ✅ | Probado; e2e cubre redirección de `/app` |
| 4 | Crear evento | ✅ | CRUD Sprint 2; tests de validación |
| 5 | Crear tarea | ✅ | CRUD Sprint 2 |
| 6 | Completar / posponer tarea | ✅ | `completeTask`/`postponeTask` |
| 7 | Prioridad alta / crítica | ✅ | Badges + borde destacado |
| 8 | Entregable requerido | ✅ | `requires_deliverable` + validación |
| 9 | Pendientes de hoy | ✅ | `TodayAgenda` + tests |
| 10 | Día / semana / mes | ✅ | 4 vistas Sprint 3 + tests de fechas |
| 11 | Realtime < 10 s | ✅ | Probado PC ↔ iPhone por Oscar (Sprint 4) |
| 12 | PWA instalable | ✅ | Instalada en iPhone; HTTPS en Vercel |
| 13 | Offline básico | ✅ | Verificado: app carga con server apagado |
| 14 | Web Push de prueba | ✅ | Edge Function desplegada; prueba enviada OK |
| 15 | Sin secretos expuestos | ✅ | Escaneo: 0 secretos en frontend |
| 16 | RLS aísla usuarios | ✅ | RLS en las 6 tablas + políticas por `auth.uid()` |

## Comandos ejecutados y resultados

| Comando | Resultado |
|---------|-----------|
| `npm run build` | ✅ pasa (tsc -b + vite build) |
| `npm run lint` | ✅ pasa (0 errores) |
| `npm run test` | ✅ 81/81 (22 archivos) |
| `npm run test:e2e` | ✅ 3/3 (Chromium) |

(Última corrida al cierre del Sprint 6; desde entonces solo cambiaron los iconos PNG, sin
efecto en lógica/tests.)

## Auditoría de seguridad (automatizada este sprint)

- **RLS activado** en las 6 tablas: `profiles`, `calendars`, `events`, `tasks`, `reminders`,
  `push_subscriptions` — con políticas `user_id = auth.uid()` (en `profiles`, `id = auth.uid()`).
- **Lectura anónima bloqueada**: consultas sin sesión devuelven vacío (no error), confirmado
  contra el proyecto Supabase real para las 5 tablas base y `push_subscriptions`.
- **Sin secretos en el frontend**: búsqueda de `service_role`, `VAPID_PRIVATE`, `SMTP_*`,
  `privateKey` en `src/` → 0 coincidencias. El bundle de producción solo contiene la
  *anon/publishable key* y la *VAPID public key* (ambas frontend-safe por diseño).
- **Producción verificada** (Vercel + Supabase): index 200, manifest `application/manifest+json`,
  `sw.js` con `no-cache`, iconos PNG, Edge Function `send-test-push` desplegada y respondiendo,
  `VITE_VAPID_PUBLIC_KEY` presente en el bundle.

## Pruebas manuales realizadas (por Oscar)

1. ✅ Registro + verificación de correo + login real.
2. ✅ Crear/editar/eliminar eventos y tareas; completar/posponer.
3. ✅ Vistas Hoy/Día/Semana/Mes en PC y móvil.
4. ✅ Realtime entre PC y iPhone (< 10 s).
5. ✅ PWA instalada en iPhone desde Safari.
6. ✅ Offline en DevTools (lectura + cola de cambios).
7. ✅ Web Push de prueba (permiso → suscripción → notificación recibida).

> Prueba pendiente de cierre formal (recomendada, no bloqueante): **aislamiento entre dos
> usuarios** (crear usuario B y confirmar que A no ve datos de B). RLS lo garantiza a nivel de
> políticas; falta la verificación manual end-to-end con dos cuentas reales.

## Bugs encontrados

Ninguno bloqueante ni alto. Observaciones:

| Severidad | Descripción | Acción |
|-----------|-------------|--------|
| Bajo | Bundle JS ~540 kB (aviso de Vite > 500 kB) | Etapa 2: code-splitting por ruta |
| Bajo | Reminders no se crean para entidades creadas offline (necesitan id real) | Documentado; reintento al editar en línea |

## Bugs corregidos

Ninguno requerido (no se hallaron bugs bloqueantes/altos durante la validación).

## Pendientes priorizados (no bloquean el MVP)

1. **Envío programado de recordatorios** (cron/Scheduled Function que recorre `reminders` y
   dispara el push en `remind_at`). Hoy el push de *prueba* funciona; el envío automático en la
   hora exacta es Etapa 2. — *Prioridad alta para Etapa 2.*
2. Verificación manual de aislamiento entre dos usuarios. — *Media.*
3. Code-splitting para bajar el tamaño del bundle. — *Baja.*
4. Correo de respaldo (SMTP) — documentado, sin activar. — *Baja.*

## Recomendaciones para Etapa 2

- Implementar el **scheduler de recordatorios** (Supabase `pg_cron` + Edge Function, o cron externo).
- Recuperación de contraseña ("¿olvidaste tu contraseña?").
- Vincular tareas a eventos (`related_event_id` ya existe en BD, falta UI).
- Eventos recurrentes y multi-día.
- Integración Google Calendar (los campos `external_*` ya están preparados).
- Correo transaccional propio (SMTP) para respaldo de recordatorios críticos.

## Estado Git

Limpio al momento del informe; `main` desplegado en Vercel.

## Decisión

**MVP de Etapa 1: APROBADO con observaciones menores.** Listo para uso personal. Las
observaciones son mejoras de Etapa 2, ninguna impide el flujo principal (auth, CRUD, vistas,
realtime, PWA, offline, push de prueba).
