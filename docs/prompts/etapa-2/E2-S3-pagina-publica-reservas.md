---
tags:
  - proyecto-personal
  - prompt
  - etapa-2
  - sprint-e2-3
  - pagina-publica
  - reservas
estado: listo-para-usar
fecha_creacion: 2026-06-13
sprint: E2-S3
---

# Prompt E2 Sprint 3 — Página pública de reservas

Backlog: [[Proyectos personales/Organizador de calendario inteligente/04 Backlog/Backlog técnico etapa 2|Backlog técnico etapa 2]]

---

## PROMPT DIRECTO

```text
Actúa como desarrollador senior full-stack especializado en React, Supabase, calendarios públicos y UX mobile-first.

Vas a ejecutar SOLO el SPRINT E2-S3 — Página pública de reservas.

RUTA DEL PROYECTO:
C:\Users\Oscar\Documents\Proyecto-Personal

APP PRINCIPAL:
C:\Users\Oscar\Documents\Proyecto-Personal\apps\calendar-pwa

REGLAS GENERALES:
- Trabaja SOLO este sprint.
- No avances al siguiente sin confirmación de Oscar.
- No borres código existente sin justificarlo.
- No uses servicios pagos.
- Mantén TypeScript estricto, mobile-first, tests.
- Al terminar: npm run build, npm run lint, npm run test.

CONTEXTO:
- Etapa 1 completa + Sprint E2-S1 y E2-S2 completos.
- `availability_settings` y `availability_blocks` existen con RLS + política pública de lectura.
- `slotsEngine.ts` ya computa slots disponibles.
- La tabla `events` tiene RLS (solo el dueño puede verla). Los eventos NO deben exponerse públicamente.
- Zona horaria: `America/Bogota`.

OBJETIVO:
Crear una página pública (`/book/[userId]`) accesible sin login. El visitante ve el nombre de Oscar y los slots disponibles para reservar. Nunca ve detalles privados de eventos.

==================================================
TAREA 1 — RUTA PÚBLICA
==================================================

ARCHIVO: `src/routes/router.tsx`
- Agregar ruta pública: `/book/:userId` → `BookingPage`.
- Esta ruta NO pasa por `ProtectedRoute`.

==================================================
TAREA 2 — SERVICIO PÚBLICO DE DISPONIBILIDAD
==================================================

ARCHIVO: `src/features/booking/publicAvailabilityService.ts`

Funciones (sin auth requerida — lectura pública vía RLS):
- `getPublicProfile(userId): Promise<{ full_name, email } | null>`
  - Lee de `profiles` (solo name, sin datos sensibles).
- `getPublicAvailability(userId): Promise<AvailabilitySettings | null>`
  - Lee `availability_settings` usando la policy pública.
- `getPublicBlocks(userId, from, to): Promise<AvailabilityBlock[]>`
  - Lee `availability_blocks` usando la policy pública.
- `getOccupiedSlots(userId, from, to): Promise<{ starts_at, ends_at }[]>`
  - Lee `events` del usuario SOLO con `select starts_at, ends_at` (sin título, sin descripción).
  - IMPORTANTE: crear una policy específica en `events` para lectura pública de solo starts_at/ends_at:
    ```sql
    -- En nueva migración:
    create policy "events_select_public_times"
      on public.events for select
      using (deleted_at is null);
    -- Solo exponer columnas starts_at y ends_at en la query del frontend
    ```
  - El frontend hace `.select('starts_at, ends_at')` — nunca `select('*')`.

==================================================
TAREA 3 — MIGRACIÓN SQL
==================================================

ARCHIVO: `supabase/migrations/*_events_public_times.sql`

```sql
-- Permite leer solo las horas de los eventos (sin título ni descripción)
-- para calcular disponibilidad pública.
create policy "events_select_public_times"
  on public.events for select
  using (deleted_at is null);
```

Nota: El frontend nunca hace `select *` en esta query pública — solo `starts_at, ends_at`.

==================================================
TAREA 4 — COMPONENTE BookingPage
==================================================

ARCHIVO: `src/features/booking/BookingPage.tsx`

LAYOUT:
```
┌─────────────────────────────────────┐
│  📅 Reservar con [Nombre del usuario]│
│  [semana anterior] [semana actual] [siguiente] │
├─────────────────────────────────────┤
│  Lun 16  Mar 17  Mié 18  Jue 19 ... │
│  [10:00] [11:00] [14:00]  [libre]   │
│  [11:00]          [15:00]            │
├─────────────────────────────────────┤
│  [Slot seleccionado] → [Continuar]  │
└─────────────────────────────────────┘
```

COMPORTAMIENTO:
- Al cargar: fetch de perfil público + settings + slots de la semana actual.
- Navegación por semana: anterior / siguiente.
- Slots pasados o dentro del período de anticipación → deshabilitados.
- Clic en slot → selecciona (highlight visual) y muestra botón "Continuar".
- Continuar → navega a `/book/:userId/request?slot=ISO_DATE`.
- Si no hay disponibilidad configurada: mostrar mensaje "Este usuario aún no ha configurado su disponibilidad."
- Mobile-first: columnas de días en scroll horizontal en móvil.

ARCHIVOS ADICIONALES:
- `src/features/booking/SlotGrid.tsx` — grid de slots por día.
- `src/features/booking/types.ts` — tipos públicos de booking.

==================================================
TAREA 5 — TESTS
==================================================

- `src/features/booking/BookingPage.test.tsx`:
  - Muestra nombre del usuario.
  - Muestra mensaje cuando no hay slots disponibles.
  - Deshabilita slots pasados.
- `src/features/booking/publicAvailabilityService.test.ts`:
  - No expone título ni descripción de eventos.

==================================================
CRITERIOS DE ACEPTACIÓN
==================================================

- [ ] `/book/:userId` es accesible sin login.
- [ ] Muestra nombre del usuario (no email, no detalles privados).
- [ ] Muestra slots disponibles calculados correctamente.
- [ ] Slots ocupados por eventos no aparecen (sin revelar detalles del evento).
- [ ] Slots pasados deshabilitados.
- [ ] Navegación por semana funciona.
- [ ] En móvil el layout es usable.
- [ ] npm run build, lint, test pasan.

FORMATO FINAL:
1. Sprint ejecutado
2. Archivos creados/modificados
3. Comandos ejecutados
4. Cómo probar (abrir en incógnito, sin login)
5. Pendientes para E2-S4
6. Pregunta: "¿Confirmas que avance al Sprint E2-S4?"
```
