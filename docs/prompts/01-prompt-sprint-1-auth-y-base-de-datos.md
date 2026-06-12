---
tags:
  - proyecto-personal
  - prompt
  - desarrollo
  - sprint-1
  - auth
  - supabase
estado: listo-para-usar
fecha_creacion: 2026-06-12
ultima_revision: 2026-06-12
proyecto: "Organizador de calendario inteligente"
sprint: 1
---

# Prompt Sprint 1 — Auth y base de datos

Proyecto: Organizador de calendario inteligente
Backlog: Backlog técnico etapa 1
Modelo: Modelo de datos inicial
Verificación previa: Informe verificación fase 1 - 2026-06-12
Ruta desarrollo: `C:\Users\Oscar\Documents\Proyecto-Personal`

## Uso

Copiar el bloque **PROMPT DIRECTO** y pegarlo en el agente/desarrollador que ejecutará el Sprint 1.

Regla: este prompt es **solo para Sprint 1**. No debe implementar eventos/tareas avanzadas, vistas reales de calendario, realtime, PWA/offline ni notificaciones.

---

## PROMPT DIRECTO

```text
Actúa como desarrollador senior full-stack especializado en React, TypeScript, Vite, Supabase/Postgres, Auth y Row Level Security.

Vas a ejecutar SOLO el SPRINT 1 del proyecto “Organizador de calendario inteligente”.

RUTA DEL PROYECTO:
C:\Users\Oscar\Documents\Proyecto-Personal

APP PRINCIPAL:
C:\Users\Oscar\Documents\Proyecto-Personal\apps\calendar-pwa

NO avances a Sprint 2. Al terminar Sprint 1, detente y entrega reporte.

CONTEXTO ACTUAL VERIFICADO:
- Sprint 0 ya está implementado.
- Existe repo Git con remoto: https://github.com/OscarChavezDev/PROYECTO-CALENDARIO.git
- App creada en apps/calendar-pwa con React + TypeScript + Vite.
- Tailwind v4 está configurado con @tailwindcss/vite.
- React Router está configurado.
- Cliente Supabase existe en src/lib/supabase/client.ts.
- .env.local existe y contiene VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY configurados.
- Build pasa.
- Lint pasa.
- E2E básico pasa.
- Test unitario actual falla porque espera “Supabase aún no configurado”, pero .env.local ya tiene Supabase configurado.

PRIMERA OBLIGACIÓN DEL SPRINT:
Antes de implementar Auth, corrige el test unitario para que no dependa del .env.local real. Debe pasar tanto si Supabase está configurado como si no.
Opciones aceptadas:
- Mockear el módulo src/lib/config/env.
- Separar componente de estado de Supabase y testear ambos estados.
- Ajustar test para validar un mensaje de Supabase configurado o no configurado sin asumir estado fijo.

DECISIÓN TÉCNICA DEL PRODUCTO:
- Plataforma: PWA responsive mobile-first.
- Frontend: React + TypeScript + Vite.
- Backend principal: Supabase/Postgres.
- Auth: Supabase Auth con correo + contraseña y verificación de email.
- Seguridad: Row Level Security por usuario.
- Calendario: calendario propio, no Google Calendar en MVP.
- Zona horaria por defecto: America/Bogota.
- No exponer service role key en frontend.
- No implementar servicios pagos ni pedir tarjeta.

OBJETIVO DEL SPRINT 1:
Tener autenticación real con Supabase y base de datos inicial protegida con RLS, dejando lista la app para que un usuario pueda registrarse, iniciar sesión, cerrar sesión, entrar a /app como ruta protegida y tener calendario por defecto.

ALCANCE INCLUIDO EN ESTE SPRINT:
1. Corregir tests del Sprint 0.
2. Crear migración SQL inicial.
3. Crear tablas base:
   - profiles
   - calendars
   - events
   - tasks
   - reminders
4. Activar RLS en tablas principales.
5. Crear políticas RLS por user_id / auth.uid().
6. Crear función/trigger para crear profile automáticamente cuando se registra un usuario.
7. Crear función/trigger para crear calendario por defecto cuando se crea profile, o alternativa segura equivalente.
8. Implementar Auth real en frontend:
   - registro con correo + contraseña;
   - login con correo + contraseña;
   - logout;
   - estado de sesión;
   - manejo de loading/error;
   - aviso de verificación de correo.
9. Proteger ruta /app.
10. Crear pantalla /app mínima que muestre datos del usuario y calendario por defecto si existe.
11. Actualizar documentación.
12. Verificar con build, lint y tests.

FUERA DE ESTE SPRINT:
- CRUD completo de eventos y tareas.
- Formularios finales de eventos/tareas.
- Vistas diaria/semanal/mensual reales.
- Supabase Realtime.
- PWA/offline.
- Web Push/notificaciones.
- Gmail API/correos transaccionales.
- IA.

MODELO DE DATOS SUGERIDO:

profiles:
- id uuid primary key references auth.users(id) on delete cascade
- email text not null
- full_name text null
- timezone text not null default 'America/Bogota'
- created_at timestamptz default now()
- updated_at timestamptz default now()

calendars:
- id uuid primary key default gen_random_uuid()
- user_id uuid not null references auth.users(id) on delete cascade
- name text not null default 'Personal'
- color text null default '#2563eb'
- is_default boolean not null default false
- created_at timestamptz default now()
- updated_at timestamptz default now()

IMPORTANTE: garantizar máximo un calendario default por usuario con índice único parcial si es posible.

Ejemplo:
unique index on calendars(user_id) where is_default = true

events:
- id uuid primary key default gen_random_uuid()
- user_id uuid not null references auth.users(id) on delete cascade
- calendar_id uuid not null references calendars(id) on delete cascade
- title text not null
- description text null
- starts_at timestamptz not null
- ends_at timestamptz not null
- all_day boolean not null default false
- priority text not null default 'media'
- status text not null default 'programado'
- requires_deliverable boolean not null default false
- deliverable_description text null
- location text null
- external_provider text null
- external_calendar_id text null
- external_event_id text null
- last_external_sync_at timestamptz null
- sync_status text not null default 'local'
- created_at timestamptz default now()
- updated_at timestamptz default now()
- deleted_at timestamptz null

Validaciones sugeridas:
- ends_at > starts_at
- priority in ('baja','media','alta','critica')
- status in ('programado','completado','cancelado','pospuesto')
- sync_status in ('local','synced','conflict','error')

tasks:
- id uuid primary key default gen_random_uuid()
- user_id uuid not null references auth.users(id) on delete cascade
- calendar_id uuid null references calendars(id) on delete set null
- related_event_id uuid null references events(id) on delete set null
- title text not null
- description text null
- due_at timestamptz null
- due_date date null
- priority text not null default 'media'
- status text not null default 'pendiente'
- requires_deliverable boolean not null default false
- deliverable_description text null
- completed_at timestamptz null
- external_provider text null
- external_task_id text null
- sync_status text not null default 'local'
- created_at timestamptz default now()
- updated_at timestamptz default now()
- deleted_at timestamptz null

Validaciones sugeridas:
- priority in ('baja','media','alta','critica')
- status in ('pendiente','en_proceso','completada','pospuesta','cancelada')
- sync_status in ('local','synced','conflict','error')
- due_at or due_date puede ser null, pero si ambos existen deben representar fechas coherentes.

reminders:
- id uuid primary key default gen_random_uuid()
- user_id uuid not null references auth.users(id) on delete cascade
- event_id uuid null references events(id) on delete cascade
- task_id uuid null references tasks(id) on delete cascade
- remind_at timestamptz not null
- channel text not null default 'push'
- status text not null default 'pending'
- sent_at timestamptz null
- created_at timestamptz default now()
- updated_at timestamptz default now()

Validaciones sugeridas:
- channel in ('push','email','both')
- status in ('pending','sent','failed','cancelled')
- exactamente uno de event_id o task_id debe estar presente, si lo puedes validar con check constraint.

RLS OBLIGATORIO:
Activar RLS en:
- profiles
- calendars
- events
- tasks
- reminders

Políticas mínimas:
- profiles: usuario puede select/update solo si id = auth.uid().
- calendars: usuario puede select/insert/update/delete solo si user_id = auth.uid().
- events: usuario puede select/insert/update/delete solo si user_id = auth.uid().
- tasks: usuario puede select/insert/update/delete solo si user_id = auth.uid().
- reminders: usuario puede select/insert/update/delete solo si user_id = auth.uid().

NO uses service role key en frontend.
NO pongas secrets en .env.example ni commits.

MIGRACIONES:
Crear archivo SQL en:
C:\Users\Oscar\Documents\Proyecto-Personal\supabase\migrations\

Nombre sugerido:
202606120001_initial_auth_calendar_schema.sql

Si Supabase CLI está instalado, puedes validar con comandos locales según disponibilidad. Si no está instalado o no hay acceso al proyecto remoto, NO te bloquees: deja la migración SQL creada, documenta cómo aplicarla manualmente en Supabase SQL Editor y continúa con frontend.

FRONTEND — ARCHIVOS/CARPETAS SUGERIDAS:
Crear o actualizar:
- src/features/auth/AuthProvider.tsx
- src/features/auth/useAuth.ts
- src/features/auth/LoginPage.tsx
- src/features/auth/RegisterPage.tsx
- src/features/auth/ProtectedRoute.tsx
- src/features/auth/authService.ts
- src/features/calendar/CalendarPage.tsx
- src/lib/supabase/client.ts
- src/routes/router.tsx
- src/routes/HomePage.tsx
- src/test/setup.ts si hace falta

RUTAS ESPERADAS:
- / => Home pública
- /login => Login
- /register => Registro
- /app => Ruta protegida, placeholder funcional del calendario del usuario

COMPORTAMIENTO AUTH:
- Si el usuario no está autenticado y entra a /app, redirigir a /login.
- Si el usuario se registra correctamente, mostrar mensaje para verificar email.
- Si Supabase tiene confirmación de email activa, indicar que debe revisar correo.
- Si el usuario inicia sesión correctamente, redirigir a /app.
- Si el usuario hace logout, volver a /login o /.
- Mostrar errores legibles.
- Mantener mobile-first.

CALENDARIO POR DEFECTO:
Opción preferida:
- Trigger DB crea profile al nuevo auth.users.
- Trigger DB crea calendars default al crear profile.

Alternativa aceptada:
- Al entrar a /app, frontend consulta calendario default y si no existe llama a función segura/RPC o inserta default respetando RLS.

Preferencia: resolverlo en DB para consistencia.

TESTS MÍNIMOS:
Actualizar/agregar tests para:
1. HomePage no falla con Supabase configurado o no configurado.
2. LoginPage renderiza formulario email/password.
3. RegisterPage renderiza formulario email/password.
4. ProtectedRoute redirige si no hay sesión, si es viable testearlo sin demasiada complejidad.
5. AuthProvider no rompe render inicial.

E2E MÍNIMO:
Actualizar Playwright si aplica:
- Home carga.
- Navega a login.
- Navega a registro.
No obligar login real en e2e si depende de credenciales reales.

DOCUMENTACIÓN A ACTUALIZAR:
- README.md raíz si cambian instrucciones.
- apps/calendar-pwa/README.md si sigue siendo template de Vite; reemplazarlo con documentación real del proyecto.
- docs/04-backlog-etapa-1.md marcando avance del Sprint 1 solo cuando realmente esté completo.
- Crear docs/08-sprint-1-auth-db.md con:
  - qué se implementó;
  - migración creada;
  - cómo aplicarla en Supabase;
  - variables necesarias;
  - cómo probar registro/login;
  - limitaciones pendientes.

COMANDOS DE VERIFICACIÓN OBLIGATORIOS:
Desde:
C:\Users\Oscar\Documents\Proyecto-Personal\apps\calendar-pwa

Ejecutar:
- npm run build
- npm run lint
- npm run test
- npm run test:e2e

Si test:e2e requiere navegador y falla por falta de instalación, documentar el comando:
- npx playwright install chromium

CRITERIOS DE ACEPTACIÓN DEL SPRINT 1:
El Sprint 1 se considera completo solo si:
- npm run build pasa.
- npm run lint pasa.
- npm run test pasa.
- npm run test:e2e pasa o queda documentado bloqueo externo real.
- Existe migración SQL inicial con tablas y RLS.
- Hay formularios reales de login y registro.
- Hay estado de sesión con Supabase Auth.
- /app está protegida.
- Logout existe.
- No hay service role key en frontend.
- README/docs explican cómo aplicar la migración y probar auth.
- Git status queda limpio o se indica exactamente qué falta commitear.

FORMATO DE RESPUESTA FINAL:
Al terminar, responde exactamente con estas secciones:

1. Sprint ejecutado
2. Resumen de implementación
3. Archivos creados/modificados
4. Migraciones SQL creadas
5. Comandos ejecutados y resultados
6. Pruebas manuales sugeridas para Oscar
7. Riesgos/bloqueos
8. Pendientes antes de Sprint 2
9. Estado de Git
10. Pregunta final: “¿Confirmas que avance al Sprint 2?”

EMPIEZA AHORA con Sprint 1. No implementes Sprint 2.
```