---
tags:
  - proyecto-personal
  - sprint-2
  - eventos
  - tareas
  - crud
estado: implementado
fecha_creacion: 2026-06-12
ultima_revision: 2026-06-12
proyecto: "Organizador de calendario inteligente"
sprint: 2
---

# Sprint 2 — Eventos y tareas

## Qué se implementó

### Dominio y utilidades

- `src/lib/domain/types.ts` — `Priority` (`baja|media|alta|critica`) y etiquetas compartidas entre eventos y tareas.
- `src/lib/dates/timezone.ts` — conversión input `datetime-local` ↔ ISO y formato legible en `America/Bogota`.
- `src/lib/supabase/requireClient.ts` — helper compartido (refactor: `authService` lo reutiliza).

### Eventos (`src/features/events/`)

- `types.ts` — `CalendarEvent` (fila de BD) y `EventFormValues` (formulario).
- `eventValidation.ts` — validación pura: título requerido, fechas requeridas, **fin > inicio**, prioridad/estado válidos, entregable con descripción.
- `eventService.ts` — `listEvents` (filtra `deleted_at is null`, ordena por inicio), `createEvent`, `updateEvent`, `deleteEvent` (**soft delete**: marca `deleted_at`).
- `EventForm.tsx` — crear/editar: título, descripción, inicio/fin, todo-el-día, prioridad, estado, lugar, entregable.
- `EventList.tsx` — lista con badges de prioridad/estado, fechas formateadas, editar/eliminar.
- `EventsSection.tsx` — orquesta secciones "Crear evento" y "Eventos".

### Tareas (`src/features/tasks/`)

- `types.ts` — `Task` y `TaskFormValues`; estados `pendiente|en_proceso|completada|pospuesta|cancelada`.
- `taskValidation.ts` — título requerido, prioridad válida, entregable con descripción; fecha límite opcional.
- `taskService.ts` — `listTasks`, `createTask`, `updateTask`, **`completeTask`** (status `completada` + `completed_at`), **`postponeTask`** (status `pospuesta`), `deleteTask` (soft delete).
- `TaskForm.tsx`, `TaskList.tsx` (botones Completar/Posponer/Editar/Eliminar; tachado al completar), `TasksSection.tsx`.

### Integración

- `CalendarPage.tsx` (`/app`) — muestra las 4 secciones exigidas (Crear evento / Eventos / Crear tarea / Tareas) en grid responsive (1 columna en móvil, 2 en desktop). Usa el calendario default del usuario para los inserts; si no existe muestra: "No existe calendario default; revisar Sprint 1".
- Eliminación con `window.confirm` antes de borrar.
- `user_id` siempre derivado de la sesión (`useAuth().user.id`); RLS lo garantiza del lado servidor.

## Cómo probar eventos

1. `cd apps/calendar-pwa && npm run dev` → `http://localhost:5173` → login.
2. En "Crear evento": título, inicio y fin (el formulario rechaza fin ≤ inicio), prioridad, estado, lugar opcional, entregable opcional → **Crear evento**.
3. El evento aparece en "Eventos" con badges. Probar **Editar** (el formulario se precarga) y **Eliminar** (pide confirmación; es soft delete, la fila queda en BD con `deleted_at`).

## Cómo probar tareas

1. En "Crear tarea": título (obligatorio), fecha límite opcional, prioridad, entregable opcional → **Crear tarea**.
2. En "Tareas": **Completar** (queda tachada, status Completada), **Posponer** (status Pospuesta), **Editar**, **Eliminar** (confirmación + soft delete).

## Limitaciones

- La lista es un listado plano ordenado por fecha; las vistas diaria/semanal/mensual son del Sprint 3.
- Sin Realtime: cambios desde otro dispositivo requieren recargar (Sprint 4).
- `due_date` (solo fecha) no se captura en el formulario; se usa `due_at` con hora. El campo existe en BD para uso futuro.
- Las tareas no se vinculan aún a eventos (`related_event_id` existe en BD, sin UI).
- Bundle JS ~515 kB minificado (aviso de Vite); pendiente code-splitting si crece más.

## Pendientes para Sprint 3

- Vistas diaria/semanal/mensual y "pendientes de hoy".
- Orden por hora y prioridad combinados.
- Navegación entre fechas.
- Etiquetas visuales evento/tarea en las vistas.

## Verificación ejecutada

- ✅ `npm run build` · ✅ `npm run lint` · ✅ `npm run test` (23/23) · ✅ `npm run test:e2e` (3/3)
