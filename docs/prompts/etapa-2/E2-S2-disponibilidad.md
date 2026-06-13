---
tags:
  - proyecto-personal
  - prompt
  - etapa-2
  - sprint-e2-2
  - disponibilidad
estado: listo-para-usar
fecha_creacion: 2026-06-13
sprint: E2-S2
---

# Prompt E2 Sprint 2 — Configuración de disponibilidad

Backlog: [[Proyectos personales/Organizador de calendario inteligente/04 Backlog/Backlog técnico etapa 2|Backlog técnico etapa 2]]

---

## PROMPT DIRECTO

```text
Actúa como desarrollador senior full-stack especializado en calendarios, disponibilidad, slots y Supabase/Postgres.

Vas a ejecutar SOLO el SPRINT E2-S2 — Configuración de disponibilidad.

RUTA DEL PROYECTO:
C:\Users\Oscar\Documents\Proyecto-Personal

APP PRINCIPAL:
C:\Users\Oscar\Documents\Proyecto-Personal\apps\calendar-pwa

REGLAS GENERALES:
- Trabaja SOLO este sprint. No avances al siguiente sin confirmación de Oscar.
- Verifica el estado real del repo antes de modificar.
- No borres código existente sin justificarlo.
- No uses servicios pagos.
- Mantén TypeScript estricto, mobile-first, documentación actualizada.
- Al terminar: npm run build, npm run lint, npm run test.

CONTEXTO:
- Etapa 1 completa. La tabla `calendars` y `events` existen con RLS.
- Zona horaria del perfil: `America/Bogota` por defecto (tabla `profiles.timezone`).
- El usuario es Oscar. Su `user_id` es el de la sesión de Supabase.

OBJETIVO:
Permitir que Oscar configure cuándo está disponible para recibir citas: días de la semana, horario de inicio y fin, duración mínima de un slot, buffer entre reuniones y bloqueos especiales (vacaciones, pausas).

==================================================
TAREA 1 — MIGRACIÓN SQL
==================================================

ARCHIVO: `supabase/migrations/*_availability.sql`

```sql
-- Configuración general de disponibilidad por usuario
create table if not exists public.availability_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Días laborales (array de: 'mon','tue','wed','thu','fri','sat','sun')
  working_days text[] not null default array['mon','tue','wed','thu','fri'],
  -- Hora de inicio y fin en formato HH:MM (ej. '09:00', '18:00')
  working_start time not null default '09:00',
  working_end time not null default '18:00',
  -- Duración mínima de un slot en minutos
  slot_duration_minutes int not null default 60,
  -- Buffer entre reuniones en minutos
  buffer_minutes int not null default 15,
  -- Horas de anticipación mínima para reservar (ej: 24 horas)
  advance_notice_hours int not null default 24,
  -- Semanas hacia adelante que se muestran como disponibles
  booking_window_weeks int not null default 4,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.availability_settings enable row level security;

create policy "avail_settings_select_own"
  on public.availability_settings for select
  using (user_id = (select auth.uid()));

create policy "avail_settings_insert_own"
  on public.availability_settings for insert
  with check (user_id = (select auth.uid()));

create policy "avail_settings_update_own"
  on public.availability_settings for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Política pública para lectura (necesaria para la página de reservas)
create policy "avail_settings_select_public"
  on public.availability_settings for select
  using (true);

-- Bloqueos especiales (vacaciones, pausas, días sin disponibilidad)
create table if not exists public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint avail_block_ends_after_starts check (ends_at > starts_at)
);

create index if not exists avail_blocks_user_time_idx
  on public.availability_blocks (user_id, starts_at, ends_at);

alter table public.availability_blocks enable row level security;

create policy "avail_blocks_select_own"
  on public.availability_blocks for select
  using (user_id = (select auth.uid()));

create policy "avail_blocks_insert_own"
  on public.availability_blocks for insert
  with check (user_id = (select auth.uid()));

create policy "avail_blocks_update_own"
  on public.availability_blocks for update
  using (user_id = (select auth.uid()));

create policy "avail_blocks_delete_own"
  on public.availability_blocks for delete
  using (user_id = (select auth.uid()));

-- Política pública para lectura de bloqueos (necesaria para página de reservas)
create policy "avail_blocks_select_public"
  on public.availability_blocks for select
  using (true);
```

==================================================
TAREA 2 — SERVICIO DE DISPONIBILIDAD
==================================================

ARCHIVO: `src/features/availability/availabilityService.ts`

Funciones:
- `getAvailabilitySettings(userId): Promise<AvailabilitySettings | null>`
- `upsertAvailabilitySettings(settings): Promise<AvailabilitySettings>`
- `listAvailabilityBlocks(userId, from, to): Promise<AvailabilityBlock[]>`
- `createAvailabilityBlock(block): Promise<AvailabilityBlock>`
- `deleteAvailabilityBlock(id): Promise<void>`

ARCHIVO: `src/features/availability/slotsEngine.ts`

Función principal:
```ts
computeAvailableSlots(params: {
  settings: AvailabilitySettings
  events: CalendarEvent[]          // eventos existentes del usuario
  blocks: AvailabilityBlock[]      // bloqueos especiales
  from: Date
  to: Date
  timezone: string
}): TimeSlot[]
```

Lógica:
1. Para cada día en [from, to]:
   - Si el día no está en `working_days`, saltarlo.
   - Generar slots de `slot_duration_minutes` entre `working_start` y `working_end`.
   - Excluir slots que solapen con eventos existentes (+ buffer_minutes).
   - Excluir slots cubiertos por `availability_blocks`.
   - Excluir slots antes de `now() + advance_notice_hours`.
2. Devolver array de `{ starts_at, ends_at }`.

ARCHIVO: `src/features/availability/types.ts`
Definir: `AvailabilitySettings`, `AvailabilityBlock`, `TimeSlot`.

==================================================
TAREA 3 — UI DE CONFIGURACIÓN
==================================================

ARCHIVO: `src/features/availability/AvailabilitySettings.tsx`
- Formulario: días laborales (checkboxes), horario inicio/fin, duración slot, buffer, anticipación, semanas disponibles.
- Botón guardar.
- Sección de bloqueos: lista de bloqueos activos + botón agregar + botón eliminar.

RUTA: Accesible desde `/app/settings` o desde un tab en `CalendarPage`.

==================================================
TAREA 4 — TESTS
==================================================

ARCHIVO: `src/features/availability/slotsEngine.test.ts`
Casos mínimos:
- Sin eventos: devuelve slots completos del día laboral.
- Con evento que cubre un slot: ese slot no aparece.
- Con buffer: el slot adyacente al evento tampoco aparece.
- Con bloqueo especial: slots en ese rango no aparecen.
- Fin de semana: no genera slots si no está en working_days.
- Anticipación: slots en las próximas 23h no aparecen si advance_notice = 24h.

==================================================
CRITERIOS DE ACEPTACIÓN
==================================================

- [ ] Tablas `availability_settings` y `availability_blocks` con RLS.
- [ ] `slotsEngine.ts` computa slots correctamente.
- [ ] UI de configuración funcional.
- [ ] Tests de slotsEngine pasando.
- [ ] npm run build, lint, test pasan.

FORMATO FINAL:
1. Sprint ejecutado
2. Archivos creados/modificados
3. Comandos ejecutados
4. Cómo probar manualmente
5. Pendientes para E2-S3
6. Pregunta: "¿Confirmas que avance al Sprint E2-S3?"
```
