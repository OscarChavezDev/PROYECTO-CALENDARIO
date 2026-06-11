---
tags:
  - proyecto-personal
  - arquitectura
  - base-de-datos
  - supabase
estado: borrador-definido
fecha_creacion: 2026-06-11
ultima_revision: 2026-06-11
proyecto: "Organizador de calendario inteligente"
---

# Modelo de datos inicial

Proyecto: Organizador de calendario inteligente
Requisitos: Requisitos finales etapa 1

## Principios

- Cada dato pertenece a un `user_id`.
- RLS debe impedir que un usuario vea o modifique datos de otro.
- Eventos y tareas pueden compartir campos, pero conviene separarlos para claridad del MVP.
- Los campos de integración externa se preparan desde el inicio, aunque Google se implemente después.
- Todo debe usar `created_at`, `updated_at` y estado lógico.

## Tablas iniciales

### `profiles`

Perfil público/privado del usuario conectado a `auth.users`.

| Campo | Tipo sugerido | Nota |
|---|---|---|
| id | uuid PK | Igual a `auth.users.id` |
| email | text | Correo verificado |
| full_name | text nullable | Nombre visible |
| timezone | text | Default `America/Bogota` |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

### `calendars`

| Campo | Tipo sugerido | Nota |
|---|---|---|
| id | uuid PK | Calendario |
| user_id | uuid FK | Dueño |
| name | text | Ej: Personal |
| color | text nullable | Color UI |
| is_default | boolean | Calendario principal |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

### `events`

| Campo | Tipo sugerido | Nota |
|---|---|---|
| id | uuid PK | Evento |
| user_id | uuid FK | Dueño |
| calendar_id | uuid FK | Calendario |
| title | text | Obligatorio |
| description | text nullable | Notas |
| starts_at | timestamptz | Inicio |
| ends_at | timestamptz | Fin |
| all_day | boolean | Día completo |
| priority | text | baja/media/alta/crítica |
| status | text | programado/completado/cancelado/pospuesto |
| requires_deliverable | boolean | Requiere entrega |
| deliverable_description | text nullable | Qué se debe entregar |
| location | text nullable | Opcional |
| external_provider | text nullable | google/apple/etc futuro |
| external_calendar_id | text nullable | Futuro |
| external_event_id | text nullable | Futuro |
| last_external_sync_at | timestamptz nullable | Futuro |
| sync_status | text nullable | local/synced/conflict/error |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |
| deleted_at | timestamptz nullable | Soft delete |

### `tasks`

| Campo | Tipo sugerido | Nota |
|---|---|---|
| id | uuid PK | Tarea |
| user_id | uuid FK | Dueño |
| calendar_id | uuid FK nullable | Si se muestra en calendario |
| related_event_id | uuid FK nullable | Relación opcional |
| title | text | Obligatorio |
| description | text nullable | Notas |
| due_at | timestamptz nullable | Fecha/hora límite |
| due_date | date nullable | Fecha sin hora |
| priority | text | baja/media/alta/crítica |
| status | text | pendiente/en_proceso/completada/pospuesta/cancelada |
| requires_deliverable | boolean | Requiere entrega |
| deliverable_description | text nullable | Qué se debe entregar |
| completed_at | timestamptz nullable | Cuándo se completó |
| external_provider | text nullable | Futuro |
| external_task_id | text nullable | Futuro |
| sync_status | text nullable | local/synced/conflict/error |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |
| deleted_at | timestamptz nullable | Soft delete |

### `reminders`

| Campo | Tipo sugerido | Nota |
|---|---|---|
| id | uuid PK | Recordatorio |
| user_id | uuid FK | Dueño |
| event_id | uuid FK nullable | Evento |
| task_id | uuid FK nullable | Tarea |
| remind_at | timestamptz | Momento exacto |
| channel | text | push/email/both |
| status | text | pending/sent/failed/cancelled |
| sent_at | timestamptz nullable | Enviado |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

### `push_subscriptions`

| Campo | Tipo sugerido | Nota |
|---|---|---|
| id | uuid PK | Suscripción |
| user_id | uuid FK | Dueño |
| endpoint | text | Push endpoint |
| p256dh | text | Key |
| auth | text | Secret |
| user_agent | text nullable | Dispositivo/navegador |
| created_at | timestamptz | Auto |
| revoked_at | timestamptz nullable | Revocada |

### `offline_mutations`

Puede vivir solo en IndexedDB local; no necesariamente en Supabase. Sirve como concepto para la cola offline.

| Campo | Tipo sugerido | Nota |
|---|---|---|
| local_id | string | ID local |
| entity_type | text | event/task/reminder |
| entity_id | uuid nullable | ID remoto si existe |
| operation | text | create/update/delete |
| payload | json | Cambio pendiente |
| created_at | datetime | Local |
| attempts | number | Reintentos |
| last_error | text nullable | Error |

## Reglas RLS mínimas

- `profiles`: el usuario solo lee/actualiza su propio perfil.
- `calendars`: `user_id = auth.uid()`.
- `events`: `user_id = auth.uid()`.
- `tasks`: `user_id = auth.uid()`.
- `reminders`: `user_id = auth.uid()`.
- `push_subscriptions`: `user_id = auth.uid()`.

## Reglas de conflicto MVP

- Cada registro tiene `updated_at`.
- Si hay conflicto simple, gana el cambio más reciente.
- Si hay conflicto complejo, marcar `sync_status = conflict` para revisión futura.

## Pendiente antes de programar migraciones

- [ ] Confirmar si eventos y tareas quedan en tablas separadas o tabla unificada `calendar_items`.
- [ ] Confirmar nombres finales de estados.
- [ ] Confirmar si `due_date` y `due_at` convivirán o solo uno.
- [ ] Definir si entregables serán campos simples o tabla aparte en Etapa 1.