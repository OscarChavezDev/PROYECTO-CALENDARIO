---
tags:
  - proyecto-personal
  - prompt
  - etapa-2
  - sprint-e2-5
  - gestion
  - citas
  - ics
estado: listo-para-usar
fecha_creacion: 2026-06-13
sprint: E2-S5
---

# Prompt E2 Sprint 5 — Gestión de citas

Backlog: [[Proyectos personales/Organizador de calendario inteligente/04 Backlog/Backlog técnico etapa 2|Backlog técnico etapa 2]]

---

## PROMPT DIRECTO

```text
Actúa como desarrollador senior full-stack especializado en React, flujos de gestión, calendarios, iCal/ICS y emails transaccionales.

Vas a ejecutar SOLO el SPRINT E2-S5 — Gestión de citas.

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
- E2-S4 completo: `booking_requests` existe, visitantes pueden solicitar citas.
- Oscar puede ver sus solicitudes desde Supabase pero aún no tiene UI para gestionarlas.
- La tabla `events` existe con CRUD completo (createEvent, updateEvent, deleteEvent).
- Email del proyecto: jhhm999@gmail.com.

OBJETIVO:
Dar a Oscar una vista para gestionar sus solicitudes de cita: ver pendientes, confirmar, rechazar o reprogramar. Al confirmar, crear el evento en su calendario y enviar al solicitante el email con el archivo .ics.

==================================================
TAREA 1 — VISTA DE GESTIÓN DE SOLICITUDES
==================================================

RUTA: `/app/bookings`

ARCHIVO: `src/features/booking/BookingsPage.tsx`

LAYOUT:
```
┌────────────────────────────────────┐
│  Solicitudes de cita               │
│  [Pendientes] [Confirmadas] [Otras]│
├────────────────────────────────────┤
│  Juan Pérez · jperez@email.com     │
│  Mar 17 jun · 10:00 – 11:00        │
│  "Quiero hablar sobre..."          │
│  [Confirmar] [Rechazar] [Reprogramar] │
├────────────────────────────────────┤
│  ...                               │
└────────────────────────────────────┘
```

TABS: Pendientes / Confirmadas / Rechazadas.

ACCIONES POR SOLICITUD:
- **Confirmar**: abre modal con campo "Mensaje al solicitante (opcional)" → confirma.
- **Rechazar**: abre modal con campo "Motivo (opcional)" → rechaza.
- **Reprogramar**: abre selector de slots disponibles + mensaje → actualiza solicitud con nuevo slot.

SERVICIO: `src/features/booking/ownerBookingService.ts`
- `listBookingRequests(status?): Promise<BookingRequest[]>`
- `confirmBooking(id, ownerMessage?): Promise<void>`
- `rejectBooking(id, ownerMessage?): Promise<void>`
- `rescheduleBooking(id, newStartsAt, newEndsAt, ownerMessage?): Promise<void>`

==================================================
TAREA 2 — CREAR EVENTO AL CONFIRMAR
==================================================

En `confirmBooking`:
1. Actualizar `booking_requests.status = 'confirmed'`.
2. Llamar `createEvent` con:
   - `title`: "Cita: [requester_name]"
   - `starts_at`, `ends_at` del booking.
   - `description`: motivo del solicitante + email.
   - `priority`: 'alta'.
   - `calendar_id`: calendario default de Oscar.
3. Llamar Edge Function `confirm-booking` para enviar email + .ics al solicitante.

==================================================
TAREA 3 — EDGE FUNCTION: confirm-booking
==================================================

ARCHIVO: `supabase/functions/confirm-booking/index.ts`

Recibe: `{ bookingRequestId: string, action: 'confirmed' | 'rejected' | 'rescheduled' }`

LÓGICA AL CONFIRMAR:
1. Leer `booking_requests` + perfil del dueño.
2. Generar archivo `.ics` (iCalendar) con los datos del evento:
   ```
   BEGIN:VCALENDAR
   VERSION:2.0
   PRODID:-//Calendario Inteligente//ES
   BEGIN:VEVENT
   UID:[id]@calendar-app
   SUMMARY:[título]
   DTSTART:[starts_at en formato iCal]
   DTEND:[ends_at en formato iCal]
   DESCRIPTION:[motivo]
   ORGANIZER:MAILTO:[email del owner]
   ATTENDEE:MAILTO:[requester_email]
   END:VEVENT
   END:VCALENDAR
   ```
3. Enviar email al solicitante:
   - Asunto: "Cita confirmada: [fecha y hora]"
   - Cuerpo: detalles, mensaje del dueño si existe.
   - Adjunto: `invite.ics`.
4. Enviar push al dueño (confirmación interna).

LÓGICA AL RECHAZAR:
1. Email al solicitante con asunto "Tu solicitud de cita no fue aceptada".
2. Incluir motivo si existe.

LÓGICA AL REPROGRAMAR:
1. Email al solicitante con nuevo horario.
2. Nuevo .ics con el horario actualizado.

==================================================
TAREA 4 — ACCESO DESDE MENÚ
==================================================

Agregar enlace a `/app/bookings` en `AppLayout.tsx`:
- Solo visible cuando el usuario tiene sesión activa.
- Badge con número de solicitudes pendientes (opcional).

==================================================
TAREA 5 — TESTS
==================================================

- `src/features/booking/BookingsPage.test.tsx`:
  - Muestra solicitudes pendientes.
  - Muestra mensaje cuando no hay solicitudes.
  - Botones de acción visibles.
- `src/features/booking/ownerBookingService.test.ts`:
  - confirmBooking actualiza status.
  - rejectBooking actualiza status.

==================================================
CRITERIOS DE ACEPTACIÓN
==================================================

- [ ] `/app/bookings` muestra solicitudes agrupadas por estado.
- [ ] Confirmar solicitud crea evento en el calendario de Oscar.
- [ ] Rechazar/reprogramar actualiza el status correctamente.
- [ ] Edge Function `confirm-booking` existe con lógica de .ics y email.
- [ ] Enlace a bookings desde el menú principal.
- [ ] npm run build, lint, test pasan.

FORMATO FINAL:
1. Sprint ejecutado
2. Archivos creados/modificados
3. Comandos ejecutados
4. Cómo probar el flujo completo (solicitud → confirmar → evento en calendario)
5. Pendientes para E2-S6
6. Pregunta: "¿Confirmas que avance al Sprint E2-S6?"
```
