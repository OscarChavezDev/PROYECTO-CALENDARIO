---
tags:
  - proyecto-personal
  - sprint-4
  - realtime
  - supabase
  - sincronizacion
estado: implementado-pendiente-migracion
fecha_creacion: 2026-06-12
ultima_revision: 2026-06-12
proyecto: "Organizador de calendario inteligente"
sprint: 4
---

# Sprint 4 — Sincronización Realtime

## Qué se implementó

- `src/lib/supabase/realtime.ts` — helpers puros para aplicar cambios al estado local:
  `upsertById` (evita duplicados), `removeById`, `applyChange` (INSERT/UPDATE → upsert;
  UPDATE con `deleted_at` → remover de UI; DELETE físico → remover por id). 8 tests unitarios.
- `src/features/calendar/useCalendarRealtime.ts` — hook que abre **un solo canal** por
  usuario (`calendar-sync-<userId>`) con dos suscripciones `postgres_changes` (events y
  tasks), filtradas por `user_id=eq.<id>` (además RLS aplica del lado servidor). Usa refs
  para no re-suscribirse en cada render y remueve el canal al desmontar o cambiar de
  usuario. Devuelve el estado: `conectando | conectado | desconectado`. Al **reconectar**
  tras una caída dispara un refetch de reconciliación (cambios perdidos durante la caída).
- `src/components/SyncStatusBadge.tsx` — indicador en el header de `/app`:
  🟢 Sincronizado · 🟡 Conectando… · 🔴 Sin tiempo real (con botón **Actualizar** para
  refetch manual).
- `CalendarPage` — la carga inicial se extrajo a `loadData()` reutilizable (carga inicial,
  refetch manual y reconciliación post-reconexión). Los cambios Realtime se aplican con
  `applyChange` sobre el estado de eventos y tareas.
- `supabase/migrations/202606120002_enable_realtime.sql` — agrega `events` y `tasks` a la
  publicación `supabase_realtime` (idempotente).

## Configuración necesaria en Supabase (paso manual)

**Aplicar la migración** `202606120002_enable_realtime.sql` en SQL Editor (igual que la
del Sprint 1: copiar → pegar → Run). Alternativa por UI: Dashboard → Database →
Publications → `supabase_realtime` → activar `events` y `tasks`.

Sin esta migración la app sigue funcionando, pero el badge quedará en
"Sincronizado" sin recibir cambios de otras sesiones (la publicación no emite esas tablas).

## Cómo se evitan duplicados

Al crear un evento/tarea propio, el estado se actualiza dos veces: por la respuesta del
insert y por el eco del canal Realtime. `applyChange` hace upsert por `id`, así que la
segunda llegada solo reemplaza la fila (sin duplicar).

## Prueba manual PC ↔ PC (dos navegadores)

1. `npm run dev` y abrir `http://localhost:5173/app` en dos navegadores distintos
   (ej. Chrome y Edge) con la misma cuenta.
2. Verificar badge 🟢 "Sincronizado" en ambos.
3. Crear un evento en uno → debe aparecer en el otro **sin recargar** (< 10 s, típicamente < 2 s).
4. Completar una tarea en uno → el estado cambia en el otro.
5. Eliminar un evento en uno → desaparece en el otro (soft delete vía UPDATE de `deleted_at`).

## Prueba manual PC ↔ iPhone

1. `npm run dev -- --host` y abrir `http://<IP-del-PC>:5173/app` en Safari del iPhone
   (misma red Wi-Fi; la IP aparece en la salida de Vite).
2. Repetir los pasos anteriores entre PC y iPhone.
3. Criterio de producto: el cambio debe verse en menos de **10 segundos** en conexión normal.

## Prueba del fallback

1. En DevTools → Network → "Offline" (o desconectar Wi-Fi) unos segundos.
2. El badge pasa a 🔴 "Sin tiempo real" con botón **Actualizar** (refetch manual).
3. Al volver la conexión, el canal se re-suscribe solo y dispara un refetch automático
   de reconciliación; el badge vuelve a 🟢.

## Limitaciones

- La reconexión depende del retry interno de supabase-js; en cortes muy largos puede
  tardar en volver. El botón Actualizar cubre el caso mientras tanto.
- `calendars` no está suscrito (cambia poco); un cambio de nombre/color del calendario
  requiere recargar.
- Sin cola offline: crear/editar sin conexión falla con error visible (Sprint 5).

## Pendientes para Sprint 5

- Manifest PWA + service worker + cache de assets.
- IndexedDB para lectura offline y cola local de mutaciones.
- Indicadores online/offline y regla de conflicto por `updated_at`.

## Verificación ejecutada

- ✅ `npm run build` · ✅ `npm run lint` · ✅ `npm run test` (56/56, 15 archivos) · ✅ `npm run test:e2e` (3/3)
