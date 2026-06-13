---
tags:
  - proyecto-personal
  - prompt
  - desarrollo
  - sprint-3
  - calendario
  - vistas
  - ux
estado: listo-para-usar
fecha_creacion: 2026-06-12
ultima_revision: 2026-06-12
proyecto: "Organizador de calendario inteligente"
sprint: 3
---

# Prompt Sprint 3 ? Vistas de calendario

Proyecto: Organizador de calendario inteligente
Backlog: Backlog t?cnico etapa 1
Requisitos: Requisitos finales etapa 1
Modelo: Modelo de datos inicial
Ruta desarrollo: `C:\Users\Oscar\Documents\Proyecto-Personal`

## Uso

Prompt espec?fico para implementar **solo Sprint 3**. Requiere Sprint 2 funcional con eventos/tareas.

---

## PROMPT DIRECTO

```text
Act?a como desarrollador senior frontend especializado en UX mobile-first, calendarios, React y TypeScript.

Vas a ejecutar SOLO el SPRINT 3 ? Vistas de calendario.

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
- Sprint 1 completo: Auth + DB + RLS.
- Sprint 2 completo: CRUD de eventos y tareas.
- Si no hay eventos/tareas funcionales, detente y reporta que Sprint 2 debe completarse antes.

OBJETIVO DEL SPRINT 3:
Crear vistas ?tiles para visualizar eventos y tareas: diaria, semanal, mensual y pendientes de hoy. Debe ser mobile-first para iPhone.

ALCANCE INCLUIDO:
1. Layout principal de /app mejorado.
2. Vista diaria.
3. Vista semanal.
4. Vista mensual.
5. Lista de pendientes de hoy.
6. Navegaci?n entre fechas.
7. Filtros b?sicos por tipo: eventos/tareas/todos.
8. Orden por hora y prioridad.
9. Badges visuales por prioridad, estado y tipo.
10. Estados vac?os legibles.
11. Tests de utilidades de fecha y render b?sico.
12. Documentaci?n Sprint 3.

FUERA DE ESTE SPRINT:
- Realtime.
- Offline.
- Web Push.
- Drag & drop.
- Repetici?n de eventos.
- Integraci?n Google.

ARCHIVOS/CARPETAS SUGERIDAS:
- src/features/calendar/CalendarPage.tsx
- src/features/calendar/CalendarShell.tsx
- src/features/calendar/DayView.tsx
- src/features/calendar/WeekView.tsx
- src/features/calendar/MonthView.tsx
- src/features/calendar/TodayAgenda.tsx
- src/features/calendar/calendarUtils.ts
- src/features/calendar/calendarTypes.ts
- src/features/calendar/CalendarItemCard.tsx
- src/lib/dates/dateUtils.ts
- src/lib/dates/timezone.ts
- docs/10-sprint-3-vistas-calendario.md

REGLAS DE VISUALIZACI?N:
- Vista diaria: mostrar eventos del d?a y tareas con due_at/due_date del d?a.
- Vista semanal: 7 d?as visibles; en m?vil puede ser lista agrupada por d?a.
- Vista mensual: grilla simple o lista mensual mobile-first si grilla no es c?moda.
- Pendientes de hoy: tareas pendientes/en_proceso/pospuestas del d?a, m?s eventos del d?a.
- Orden principal: hora ascendente.
- Si no hay hora, ordenar despu?s de elementos con hora.
- Prioridad cr?tica/alta debe destacarse.

ZONA HORARIA:
- Usar America/Bogota como default.
- Evitar comparar fechas solo con string UTC sin considerar d?a local.
- Crear utilidades claras para inicio/fin de d?a local.

UI/UX:
- Mobile-first.
- Navegaci?n con botones: Hoy, anterior, siguiente.
- Selector simple de vista: D?a / Semana / Mes / Hoy.
- Cards compactas para iPhone.
- Estados vac?os: ?No tienes eventos/tareas para este d?a?.
- CTA para crear evento/tarea si ya existe formulario del Sprint 2.

TESTS M?NIMOS:
- calendarUtils filtra eventos por d?a.
- calendarUtils agrupa por semana/mes si aplica.
- TodayAgenda muestra tareas/eventos dados.
- Vista vac?a muestra mensaje correcto.

COMANDOS OBLIGATORIOS:
Desde apps/calendar-pwa:
- npm run build
- npm run lint
- npm run test
- npm run test:e2e

DOCUMENTACI?N:
Crear docs/10-sprint-3-vistas-calendario.md con:
- Vistas implementadas.
- C?mo probar d?a/semana/mes.
- Reglas de orden.
- Limitaciones.
- Pendientes para Sprint 4.

CRITERIOS DE ACEPTACI?N:
- Usuario puede alternar d?a/semana/mes/hoy.
- Eventos aparecen en fechas correctas.
- Tareas aparecen en fechas correctas.
- Pendientes de hoy funciona.
- Dise?o usable en viewport m?vil.
- Build/lint/test/e2e pasan o bloqueo real documentado.
- No se implementa Realtime.

FORMATO FINAL:
1. Sprint ejecutado
2. Resumen
3. Archivos modificados
4. C?mo probar manualmente
5. Comandos ejecutados y resultados
6. Riesgos/bloqueos
7. Pendientes para Sprint 4
8. Estado Git
9. Pregunta: ??Confirmas que avance al Sprint 4??

EMPIEZA con Sprint 3. No implementes Sprint 4.
```
