---
tags:
  - proyecto-personal
  - prompt
  - etapa-2
  - sprint-e2-4
  - solicitudes
  - citas
estado: listo-para-usar
fecha_creacion: 2026-06-13
sprint: E2-S4
---

# Prompt E2 Sprint 4 — Solicitudes de cita

Backlog: [[Proyectos personales/Organizador de calendario inteligente/04 Backlog/Backlog técnico etapa 2|Backlog técnico etapa 2]]

---

## PROMPT DIRECTO

```text
Actúa como desarrollador senior full-stack especializado en formularios públicos, Supabase, emails transaccionales y flujos de reserva.

Vas a ejecutar SOLO el SPRINT E2-S4 — Solicitudes de cita.

RUTA DEL PROYECTO:
C:\Users\Oscar\Documents\Proyecto-Personal

APP PRINCIPAL:
C:\Users\Oscar\Documents\Proyecto-Personal\apps\calendar-pwa

REGLAS GENERALES:
- Trabaja SOLO este sprint.
- No avances al siguiente sin confirmación de Oscar.
- No borres código existente sin justificarlo.
- No uses servicios pagos. Email con Supabase Auth SMTP o Resend free tier.
- NUNCA expongas secrets en frontend.
- Mantén TypeScript estricto, mobile-first, tests.
- Al terminar: npm run build, npm run lint, npm run test.

CONTEXTO:
- E2-S3 completo: `/book/:userId` muestra slots y navega a `/book/:userId/request?slot=ISO`.
- La tabla `booking_requests` aún NO existe (crearla aquí).
- Email del proyecto: jhhm999@gmail.com.
- Zona horaria: America/Bogota.

OBJETIVO:
Permitir que un visitante (sin cuenta) complete el formulario de solicitud de cita, que se guarde en Supabase y que Oscar y el solicitante reciban emails de notificación.

==================================================
TAREA 1 — MIGRACIÓN SQL
==================================================

ARCHIVO: `supabase/migrations/*_booking_requests.sql`

```sql
create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  requester_name text not null,
  requester_email text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  message text,
  status text not null default 'pending',
  owner_message text,        -- mensaje del dueño al confirmar/rechazar
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_status_valid check (
    status in ('pending', 'confirmed', 'rejected', 'cancelled', 'rescheduled')
  )
);

create index if not exists booking_owner_status_idx
  on public.booking_requests (owner_user_id, status, starts_at);

alter table public.booking_requests enable row level security;

-- El dueño ve y edita sus solicitudes
create policy "booking_select_owner"
  on public.booking_requests for select
  using (owner_user_id = (select auth.uid()));

create policy "booking_update_owner"
  on public.booking_requests for update
  using (owner_user_id = (select auth.uid()));

-- Cualquier persona puede insertar (sin login) — clave para el flujo público
create policy "booking_insert_public"
  on public.booking_requests for insert
  with check (true);

create trigger booking_set_updated_at
  before update on public.booking_requests
  for each row execute function public.set_updated_at();
```

==================================================
TAREA 2 — FORMULARIO DE SOLICITUD
==================================================

ARCHIVO: `src/features/booking/BookingRequestPage.tsx`

Ruta: `/book/:userId/request?slot=STARTS_AT_ISO`

CAMPOS:
- Nombre completo (requerido).
- Email (requerido, validar formato).
- Motivo / mensaje (opcional, máx. 500 caracteres).
- Slot seleccionado: mostrar de forma legible (ej. "Martes 17 jun · 10:00 – 11:00") — solo lectura, viene del query param.
- Botón "Solicitar cita".

VALIDACIONES:
- Nombre no vacío.
- Email con formato válido.
- Slot válido (no en el pasado, dentro del horario de disponibilidad).

FLUJO AL ENVIAR:
1. Insert en `booking_requests`.
2. Llamar Edge Function `notify-booking` (ver Tarea 3).
3. Mostrar pantalla de confirmación: "Tu solicitud fue enviada. Recibirás un email de confirmación en [email]."

ARCHIVO: `src/features/booking/bookingService.ts`
- `createBookingRequest(params): Promise<BookingRequest>`
- `getBookingRequest(id): Promise<BookingRequest>`

==================================================
TAREA 3 — EDGE FUNCTION: notify-booking
==================================================

ARCHIVO: `supabase/functions/notify-booking/index.ts`

Recibe: `{ bookingRequestId: string }`

LÓGICA:
1. Leer `booking_requests` + `profiles` del owner.
2. Enviar email al owner (jhhm999@gmail.com o su email de perfil):
   - Asunto: "Nueva solicitud de cita: [nombre del solicitante]"
   - Cuerpo: nombre, email, motivo, slot (fecha y hora).
   - Link a `/app/bookings` para gestionar.
3. Enviar email al solicitante (`requester_email`):
   - Asunto: "Tu solicitud de cita fue recibida"
   - Cuerpo: confirmar que la solicitud está pendiente, slot solicitado, plazo esperado de respuesta.
4. Enviar push al owner (si tiene subscriptions activas).

EMAIL:
- Usar Supabase Auth SMTP si está configurado, o Resend free tier.
- Si no hay SMTP configurado: documentar cómo activarlo y devolver 200 con warning.
- NUNCA exponer SMTP credentials en el frontend.

DOCUMENTACIÓN: en el código y en `docs/16-solicitudes-cita.md`.

==================================================
TAREA 4 — TESTS
==================================================

- `src/features/booking/BookingRequestPage.test.tsx`:
  - Muestra el slot seleccionado en formato legible.
  - Valida email inválido.
  - Valida nombre vacío.
  - Muestra pantalla de éxito tras enviar.
- `src/features/booking/bookingService.test.ts`:
  - Crea booking con datos correctos.

==================================================
CRITERIOS DE ACEPTACIÓN
==================================================

- [ ] `booking_requests` existe con RLS (insert público, select/update del dueño).
- [ ] Formulario valida y crea solicitud en Supabase.
- [ ] Pantalla de confirmación visible tras enviar.
- [ ] Edge Function `notify-booking` existe (puede funcionar sin SMTP en dev).
- [ ] Emails documentados aunque no se envíen sin SMTP real.
- [ ] npm run build, lint, test pasan.

FORMATO FINAL:
1. Sprint ejecutado
2. Archivos creados/modificados
3. Comandos ejecutados
4. Cómo probar el flujo completo
5. Configuración SMTP pendiente de Oscar
6. Pendientes para E2-S5
7. Pregunta: "¿Confirmas que avance al Sprint E2-S5?"
```
