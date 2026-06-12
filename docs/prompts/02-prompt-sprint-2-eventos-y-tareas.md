---
tags:
  - proyecto-personal
  - prompt
  - desarrollo
  - sprint-2
  - eventos
  - tareas
  - crud
estado: listo-para-usar
fecha_creacion: 2026-06-12
ultima_revision: 2026-06-12
proyecto: "Organizador de calendario inteligente"
sprint: 2
---

# Prompt Sprint 2 ? Eventos y tareas

Proyecto: Organizador de calendario inteligente
Backlog: Backlog t?cnico etapa 1
Requisitos: Requisitos finales etapa 1
Modelo: Modelo de datos inicial
Ruta desarrollo: `C:\Users\Oscar\Documents\Proyecto-Personal`

## Uso

Prompt espec?fico para implementar **solo Sprint 2**. Requiere que Sprint 1 est? completo o, como m?nimo, que existan Auth, ruta protegida `/app`, tablas y RLS.

---

## PROMPT DIRECTO

```text
Act?a como desarrollador senior full-stack especializado en React, TypeScript, Supabase/Postgres y formularios robustos.

Vas a ejecutar SOLO el SPRINT 2 ? Eventos y tareas.

RUTA DEL PROYECTO:
C:\Users\Oscar\Documents\Proyecto-Personal

APP PRINCIPAL:
C:\Users\Oscar\Documents\Proyecto-Personal\apps\calendar-pwa

CONTEXTO GENERAL:
- Producto: Organizador de calendario inteligente.
- Plataforma: PWA responsive mobile-first.
- Frontend: React + TypeScript + Vite + Tailwind CSS.
- Rutas: React Router.
- Backend principal: Supabase/Postgres.
- Auth: Supabase Auth con correo + contrase?a y verificaci?n de email.
- Seguridad: Row Level Security por usuario.
- Calendario: calendario propio, no Google Calendar en MVP.
- Zona horaria inicial: America/Bogota.
- No exponer service role key en frontend.
- No implementar servicios pagos ni pedir tarjeta.
- Trabaja solo el sprint indicado. No avances al sprint siguiente sin confirmaci?n de Oscar.

REGLAS DE TRABAJO:
- Verifica el estado real del repo antes de tocar archivos.
- No borres documentaci?n ni archivos existentes sin justificar.
- Mant?n TypeScript estricto y componentes mobile-first.
- Si falta credencial externa, deja fallback/mock/documentaci?n y contin?a con lo local.
- Al finalizar, ejecuta build, lint, tests unitarios y e2e si aplica.
- Si un comando falla, corrige o documenta bloqueo real.
- Actualiza README/docs del sprint.


PRECONDICIONES:
- Sprint 1 debe estar implementado: Auth real, ruta protegida /app, migraciones con profiles/calendars/events/tasks/reminders y RLS.
- Si Sprint 1 no est? completo, detente y reporta qu? falta. No implementes Sprint 2 sobre placeholders inseguros.

OBJETIVO DEL SPRINT 2:
Implementar CRUD funcional de eventos y tareas para el usuario autenticado, usando Supabase y respetando RLS. Al final, el usuario debe poder crear, listar, editar, eliminar eventos y crear/listar/editar/completar/posponer/eliminar tareas desde /app.

ALCANCE INCLUIDO:
1. Tipos TypeScript para Event, Task, Reminder, Priority y estados.
2. Servicios/repositorios Supabase para events y tasks.
3. Validaciones de formularios.
4. Formulario de evento.
5. Formulario de tarea.
6. Listado b?sico de eventos y tareas del usuario.
7. Editar y eliminar eventos.
8. Editar, completar, posponer y eliminar tareas.
9. Prioridades: baja, media, alta, critica.
10. Entregable simple: requires_deliverable + deliverable_description.
11. Manejo de loading/error/success.
12. Tests unitarios m?nimos de validaciones y componentes principales.
13. Documentaci?n del Sprint 2.

FUERA DE ESTE SPRINT:
- Vista diaria/semanal/mensual avanzada.
- Realtime.
- Offline.
- Web Push.
- Correos.
- Integraci?n Google.

ARCHIVOS/CARPETAS SUGERIDAS:
- src/features/events/types.ts
- src/features/events/eventService.ts
- src/features/events/EventForm.tsx
- src/features/events/EventList.tsx
- src/features/events/eventValidation.ts
- src/features/tasks/types.ts
- src/features/tasks/taskService.ts
- src/features/tasks/TaskForm.tsx
- src/features/tasks/TaskList.tsx
- src/features/tasks/taskValidation.ts
- src/features/calendar/CalendarPage.tsx
- src/lib/dates/timezone.ts
- src/lib/supabase/database.types.ts si decides crear tipos manuales temporales
- docs/09-sprint-2-eventos-y-tareas.md

MODELO EVENTO:
- id
- user_id
- calendar_id
- title
- description
- starts_at
- ends_at
- all_day
- priority: baja | media | alta | critica
- status: programado | completado | cancelado | pospuesto
- requires_deliverable
- deliverable_description
- location
- sync_status
- created_at
- updated_at
- deleted_at

VALIDACI?N EVENTO:
- title requerido.
- starts_at requerido.
- ends_at requerido.
- ends_at debe ser mayor que starts_at.
- priority v?lida.
- status v?lido.
- Si requires_deliverable es true, deliverable_description debe poder capturarse.

MODELO TAREA:
- id
- user_id
- calendar_id nullable
- related_event_id nullable
- title
- description
- due_at nullable
- due_date nullable
- priority
- status: pendiente | en_proceso | completada | pospuesta | cancelada
- requires_deliverable
- deliverable_description
- completed_at
- sync_status
- created_at
- updated_at
- deleted_at

VALIDACI?N TAREA:
- title requerido.
- priority v?lida.
- status v?lido.
- due_at o due_date pueden ser null.
- completar tarea debe setear status = completada y completed_at.
- posponer tarea debe setear status = pospuesta.

REGLAS SUPABASE:
- Nunca env?es user_id arbitrario si puedes derivarlo de sesi?n; si se env?a, debe ser auth.user.id.
- Todas las consultas deben filtrar por deleted_at is null.
- Soft delete preferido: set deleted_at en vez de delete f?sico, salvo que el dise?o existente diga otra cosa.
- Para inserts, usar calendar default del usuario.
- Si no existe calendar default, mostrar error claro: ?No existe calendario default; revisar Sprint 1?.

UI/UX:
- Mobile-first.
- /app debe mostrar secciones: ?Crear evento?, ?Eventos?, ?Crear tarea?, ?Tareas?.
- Usar formularios simples pero funcionales.
- Mostrar badges de prioridad y estado.
- Confirmar antes de eliminar si es f?cil; si no, bot?n claro de eliminar.
- Los errores deben ser legibles.

TESTS M?NIMOS:
- Validaci?n evento: rechaza fecha fin antes de inicio.
- Validaci?n tarea: requiere t?tulo.
- EventForm renderiza campos m?nimos.
- TaskForm renderiza campos m?nimos.
- Servicios deben estar separados para facilitar mock futuro.

COMANDOS OBLIGATORIOS:
Desde apps/calendar-pwa:
- npm run build
- npm run lint
- npm run test
- npm run test:e2e

DOCUMENTACI?N:
Crear docs/09-sprint-2-eventos-y-tareas.md con:
- Qu? se implement?.
- C?mo probar eventos.
- C?mo probar tareas.
- Limitaciones.
- Pendientes para Sprint 3.

CRITERIOS DE ACEPTACI?N:
- Usuario autenticado puede crear evento.
- Usuario autenticado puede listar sus eventos.
- Usuario autenticado puede editar/eliminar evento.
- Usuario autenticado puede crear tarea.
- Usuario autenticado puede completar/posponer tarea.
- Prioridad y entregable se guardan.
- Build/lint/test/e2e pasan o queda bloqueo real documentado.
- No se implementa Sprint 3.

FORMATO FINAL:
1. Sprint ejecutado
2. Resumen
3. Archivos modificados
4. C?mo probar manualmente
5. Comandos ejecutados y resultados
6. Riesgos/bloqueos
7. Pendientes para Sprint 3
8. Estado Git
9. Pregunta: ??Confirmas que avance al Sprint 3??

EMPIEZA con Sprint 2. No implementes Sprint 3.
```
