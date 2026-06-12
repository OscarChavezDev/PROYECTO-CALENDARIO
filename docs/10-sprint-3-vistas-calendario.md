---
tags:
  - proyecto-personal
  - sprint-3
  - calendario
  - vistas
  - ux
estado: implementado
fecha_creacion: 2026-06-12
ultima_revision: 2026-06-12
proyecto: "Organizador de calendario inteligente"
sprint: 3
---

# Sprint 3 — Vistas de calendario

## Vistas implementadas

`/app` ahora es un calendario con 4 vistas conmutables (selector **Hoy / Día / Semana / Mes**):

- **Hoy (TodayAgenda)** — pendientes de hoy: eventos del día (no cancelados) + tareas del día en estado pendiente/en_proceso/pospuesta. Grupo extra "Tareas sin fecha" con las tareas abiertas sin due_at/due_date (antes invisibles en vistas por día).
- **Día (DayView)** — todos los ítems del día seleccionado.
- **Semana (WeekView)** — lista agrupada por día (lunes a domingo), mobile-first; el día de hoy se resalta; tocar el encabezado de un día abre su vista diaria.
- **Mes (MonthView)** — grilla 7×N con número de día, puntos de colores por prioridad (máx. 3 + contador) y resaltado de hoy; tocar un día abre su vista diaria.

Complementos:

- **Navegación**: botones ← / Hoy / → (avanza 1 día, 7 días o 1 mes según la vista) con etiqueta del rango visible.
- **Filtro por tipo**: Todos / Eventos / Tareas.
- **CTA crear**: botones "➕ Evento" y "➕ Tarea" abren el formulario del Sprint 2 en un panel; "Editar" en cualquier tarjeta abre el mismo panel precargado.
- **CalendarItemCard**: tarjeta compacta con hora, título, badges de tipo (Evento/Tarea), prioridad y estado, más acciones (completar/posponer/editar/eliminar). Borde izquierdo de color según prioridad: crítica (rojo) y alta (ámbar) destacan.
- **Estados vacíos**: "No tienes eventos ni tareas para este día", "Sin elementos" por día en semana, "No tienes eventos ni tareas pendientes para hoy 🎉".

## Reglas de orden

1. Hora ascendente (minutos desde medianoche en America/Bogota).
2. Ítems **sin hora** (eventos todo-el-día, tareas con solo fecha) van **después** de los que tienen hora.
3. Empate de hora → prioridad: crítica > alta > media > baja.
4. Último desempate: título alfabético.

## Zona horaria

Toda la lógica de "a qué día pertenece" usa **day keys** (`YYYY-MM-DD`) calculados en `America/Bogota` (`src/lib/dates/dateUtils.ts`), nunca el día UTC del string. Ejemplo cubierto por tests: un evento a las 03:00 UTC del 16 de junio es del **15** de junio en Bogotá.

## Cómo probar día/semana/mes

1. `npm run dev` → login → `/app` (la vista inicial es **Hoy**).
2. Crear un evento de hoy y una tarea con fecha límite mañana ("➕ Evento" / "➕ Tarea").
3. **Hoy**: debe verse el evento; la tarea de mañana no.
4. **Día**: navegar con → a mañana; debe aparecer la tarea.
5. **Semana**: ambos ítems agrupados bajo su día; hoy resaltado en índigo.
6. **Mes**: puntos en los días con ítems; tocar un día abre su detalle.
7. Filtro "Tareas": los eventos desaparecen de la vista.
8. Probar en viewport móvil (DevTools → iPhone): tarjetas compactas y grilla mensual usable.

## Cambios de estructura

- `CalendarPage` ahora centraliza datos (calendario default + eventos + tareas en un solo `Promise.all`) y pasa handlers a `CalendarShell`.
- Se eliminaron `EventsSection`/`EventList` y `TasksSection`/`TaskList` del Sprint 2: sus funciones (listar, editar, acciones) viven ahora en las vistas y `CalendarItemCard`. Los formularios (`EventForm`/`TaskForm`) y servicios se reutilizan sin cambios.

## Limitaciones

- Eventos multi-día se muestran solo en su día de inicio.
- La vista mensual no muestra títulos (solo densidad por puntos); el detalle está a un toque.
- Sin drag & drop ni repetición de eventos (fuera del MVP).
- Cambios desde otro dispositivo requieren recargar (Realtime es Sprint 4).

## Pendientes para Sprint 4

- Supabase Realtime en `events` y `tasks` (INSERT/UPDATE/DELETE → actualizar UI).
- Fallback de refetch si se pierde la conexión realtime.
- Criterio de sync < 10 s y prueba PC ↔ iPhone.

## Verificación ejecutada

- ✅ `npm run build` · ✅ `npm run lint` · ✅ `npm run test` (48/48, 14 archivos) · ✅ `npm run test:e2e` (3/3)
