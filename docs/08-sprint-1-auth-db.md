---
tags:
  - proyecto-personal
  - sprint-1
  - auth
  - supabase
  - rls
estado: implementado-pendiente-migracion
fecha_creacion: 2026-06-12
ultima_revision: 2026-06-12
proyecto: "Organizador de calendario inteligente"
sprint: 1
---

# Sprint 1 — Auth y base de datos

## Qué se implementó

### Base de datos (migración SQL)

Archivo: `supabase/migrations/202606120001_initial_auth_calendar_schema.sql`

- Tablas: `profiles`, `calendars`, `events`, `tasks`, `reminders`.
- **RLS activado en las 5 tablas** con políticas por usuario (`user_id = auth.uid()`; en `profiles`, `id = auth.uid()` con solo select/update).
- Check constraints: `ends_at > starts_at`, prioridades (`baja|media|alta|critica`), estados, `sync_status`, "exactamente uno de event_id/task_id" en reminders, coherencia `due_at`/`due_date`.
- Índice único parcial: máximo un calendario `is_default` por usuario.
- Campos de integración externa futura en `events`/`tasks` (`external_provider`, `external_*_id`, `last_external_sync_at`, `sync_status`).
- Triggers:
  - `on_auth_user_created` → crea `profile` automáticamente al registrarse un usuario (security definer).
  - `on_profile_created` → crea calendario "Personal" por defecto.
  - `*_set_updated_at` → mantiene `updated_at` en todas las tablas.
- Zona horaria por defecto del perfil: `America/Bogota`.

### Frontend (apps/calendar-pwa)

- `src/features/auth/authContext.ts` + `AuthProvider.tsx` + `useAuth.ts` — estado de sesión global con `onAuthStateChange`.
- `src/features/auth/authService.ts` — registro, login y logout con errores traducidos al español.
- `src/features/auth/LoginPage.tsx` — formulario real de login; redirige a `/app` al entrar.
- `src/features/auth/RegisterPage.tsx` — formulario de registro con confirmación de contraseña y aviso "revisa tu correo" cuando la verificación de email está activa.
- `src/features/auth/ProtectedRoute.tsx` — protege `/app`; sin sesión redirige a `/login`.
- `src/features/calendar/CalendarPage.tsx` — pantalla `/app`: muestra email, estado de verificación, calendario por defecto y botón de cerrar sesión.
- `src/components/SupabaseStatusBanner.tsx` — extraído para testear ambos estados sin depender del `.env.local` real (corrección del test del Sprint 0).
- Rutas: `/` (pública), `/login`, `/register`, `/app` (protegida).

## Cómo aplicar la migración (paso manual, ~2 minutos)

La CLI de Supabase no está instalada, así que se aplica por el SQL Editor:

1. Entrar a [supabase.com/dashboard](https://supabase.com/dashboard) → tu proyecto.
2. Menú lateral → **SQL Editor** → **New query**.
3. Abrir `supabase/migrations/202606120001_initial_auth_calendar_schema.sql`, copiar TODO el contenido y pegarlo.
4. Click **Run**. Debe terminar sin errores ("Success. No rows returned").
5. Verificar en **Table Editor** que existen las 5 tablas y que muestran el candado de RLS.

> Importante: si ya habías creado un usuario ANTES de aplicar la migración, ese usuario no tendrá profile ni calendario (el trigger no existía). Regístrate con un usuario nuevo después de aplicarla.

## Configuración recomendada de Auth en Supabase

En **Authentication → URL Configuration**:
- Site URL: `http://localhost:5173` (para que los enlaces de verificación redirijan a la app en desarrollo).

En **Authentication → Sign In / Providers → Email**:
- "Confirm email" activado (default) para que se exija verificación de correo.

## Variables necesarias

`apps/calendar-pwa/.env.local` (ya configurado):

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

No se usa ninguna otra variable en este sprint. La service role key no se usa en frontend.

## Cómo probar registro/login

1. `cd apps/calendar-pwa && npm run dev` → abrir `http://localhost:5173`.
2. Ir a **Registro**, crear cuenta con un correo real y contraseña (mínimo 6 caracteres).
3. Debe aparecer "Revisa tu correo 📬". Abrir el enlace de verificación del email.
4. Volver a la app → **Login** → entrar con las credenciales.
5. Debe redirigir a `/app` y mostrar: tu email, "Correo verificado ✓" y el calendario "Personal".
6. Probar **Cerrar sesión** → vuelve a `/login`.
7. Intentar entrar a `http://localhost:5173/app` sin sesión → debe redirigir a `/login`.

## Verificación ejecutada al cierre del sprint

- ✅ `npm run build`
- ✅ `npm run lint`
- ✅ `npm run test` — 10/10 (6 archivos)
- ✅ `npm run test:e2e` — 3/3 en Chromium (home, login→registro, /app redirige sin sesión)

## Limitaciones pendientes

- La migración aún no está aplicada en el proyecto Supabase remoto (paso manual de arriba).
- El flujo completo registro→verificación→login→calendario default solo puede probarse tras aplicar la migración.
- Los emails de verificación usan el servicio integrado de Supabase (limitado a pocos correos/hora; suficiente para desarrollo, se reemplaza por SMTP propio en Sprint 6).
- No hay recuperación de contraseña ("¿olvidaste tu contraseña?") — se puede agregar en un sprint posterior.
- `/app` es un placeholder funcional; eventos/tareas llegan en Sprint 2.
