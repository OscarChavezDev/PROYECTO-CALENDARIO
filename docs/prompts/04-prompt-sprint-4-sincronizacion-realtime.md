---
tags:
  - proyecto-personal
  - prompt
  - desarrollo
  - sprint-4
  - realtime
  - supabase
  - sincronizacion
estado: listo-para-usar
fecha_creacion: 2026-06-12
ultima_revision: 2026-06-12
proyecto: "Organizador de calendario inteligente"
sprint: 4
---

# Prompt Sprint 4 ? Sincronizaci?n Realtime

Proyecto: Organizador de calendario inteligente
Backlog: Backlog t?cnico etapa 1
Requisitos: Requisitos finales etapa 1
Modelo: Modelo de datos inicial
Ruta desarrollo: `C:\Users\Oscar\Documents\Proyecto-Personal`

## Uso

Copiar el bloque **PROMPT DIRECTO** y pegarlo en el agente/desarrollador. Este prompt es solo para el sprint indicado.

---

## PROMPT DIRECTO

```text
Act?a como desarrollador senior full-stack especializado en Supabase Realtime, React state management y sincronizaci?n de datos.

Vas a ejecutar SOLO el SPRINT 4 ? Sincronizaci?n Realtime.

RUTA DEL PROYECTO:
C:\Users\Oscar\Documents\Proyecto-Personal

APP PRINCIPAL:
C:\Users\Oscar\Documents\Proyecto-Personal\apps\calendar-pwa

REGLAS GENERALES:
- Trabaja SOLO este sprint. No avances al siguiente sin confirmaci?n de Oscar.
- Verifica el estado real del repo antes de modificar.
- No borres documentaci?n ni c?digo existente sin justificar.
- No uses servicios pagos ni pidas tarjeta.
- No expongas service role key, VAPID private key, SMTP secrets ni otros secretos en frontend.
- Mant?n TypeScript, mobile-first y documentaci?n actualizada.
- Al terminar ejecuta: npm run build, npm run lint, npm run test, npm run test:e2e.
- Si un comando falla, corrige o documenta bloqueo real.

PRECONDICIONES:
- Sprint 1 completo: Auth + DB + RLS.
- Sprint 2 completo: CRUD eventos/tareas.
- Sprint 3 completo: vistas calendario.
- Si CRUD o vistas no existen, detente y reporta dependencia faltante.

OBJETIVO:
Implementar sincronizaci?n en tiempo casi real entre sesiones/dispositivos para `events` y `tasks` usando Supabase Realtime, con fallback de refetch si la suscripci?n falla.

CRITERIO DE PRODUCTO:
Un cambio creado en PC debe verse en iPhone/otra sesi?n en menos de 10 segundos en conexi?n normal.

ALCANCE:
1. Suscripciones Realtime a `events`.
2. Suscripciones Realtime a `tasks`.
3. Actualizar UI ante INSERT/UPDATE/DELETE o soft delete.
4. Evitar duplicados en estado local.
5. Cleanup correcto de channels al desmontar/cambiar usuario.
6. Refetch manual/autom?tico si falla Realtime.
7. Indicador simple: conectado/desconectado/sincronizando.
8. Documentar configuraci?n necesaria de Realtime en Supabase.

FUERA DE ALCANCE:
- Offline queue.
- Web Push.
- Notificaciones.
- Integraci?n Google.

ARCHIVOS SUGERIDOS:
- src/lib/supabase/realtime.ts
- src/features/calendar/useCalendarRealtime.ts
- src/components/SyncStatusBadge.tsx
- src/features/events/eventService.ts
- src/features/tasks/taskService.ts
- src/features/calendar/CalendarPage.tsx
- docs/11-sprint-4-sincronizacion-realtime.md

REGLAS T?CNICAS:
- Suscribirse solo con usuario autenticado.
- Filtrar por user_id si es viable; si no, descartar en cliente y confiar en RLS para consultas.
- No crear m?ltiples suscripciones por render.
- Si `deleted_at` no es null, remover item de UI.
- Si Realtime falla, mostrar indicador y permitir refetch.

TESTS M?NIMOS:
- Merge evita duplicados.
- Update reemplaza item existente.
- Soft delete remueve item.
- Hook/utilidad se testea si es viable; si no, documentar prueba manual.

PRUEBA MANUAL:
- Abrir dos sesiones/navegadores.
- Crear evento en una sesi?n y verlo aparecer en otra.
- Editar tarea y ver cambio en otra.
- Probar refetch si se pierde conexi?n.

DOCUMENTACI?N:
Crear `docs/11-sprint-4-sincronizacion-realtime.md` con configuraci?n, prueba PC?iPhone y limitaciones.

CRITERIOS DE ACEPTACI?N:
- Events y tasks sincronizan entre sesiones.
- Hay fallback/refetch.
- No hay fugas evidentes de suscripciones.
- Build/lint/test/e2e pasan o bloqueo real documentado.


FORMATO FINAL OBLIGATORIO:
1. Sprint ejecutado
2. Resumen de implementaci?n
3. Archivos creados/modificados
4. Comandos ejecutados y resultados
5. Pruebas manuales sugeridas para Oscar
6. Riesgos/bloqueos
7. Pendientes para Sprint 5
8. Estado Git
9. Pregunta final: ??Confirmas que avance al Sprint 5??

No avances al Sprint 5 sin confirmaci?n.
```
