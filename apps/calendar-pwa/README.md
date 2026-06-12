# calendar-pwa

App principal del **Organizador de calendario inteligente**: PWA mobile-first en
React + TypeScript + Vite, con Supabase como backend (Auth, Postgres con RLS, Realtime).

Documentación general del proyecto: [README raíz](../../README.md) y [docs/](../../docs/).

## Requisitos

- Node.js LTS
- `apps/calendar-pwa/.env.local` con las variables de Supabase (ver abajo)

## Comandos

```powershell
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo (http://localhost:5173)
npm run build      # type-check (tsc -b) + build de producción
npm run preview    # servir el build de producción
npm run lint       # ESLint
npm run test       # tests unitarios (Vitest + Testing Library)
npm run test:watch # tests unitarios en modo watch
npm run test:e2e   # tests e2e (Playwright; requiere: npx playwright install chromium)
```

## Variables de entorno

Copiar `.env.example` a `.env.local`:

```env
VITE_SUPABASE_URL=      # Project URL del proyecto Supabase
VITE_SUPABASE_ANON_KEY= # anon/publishable key (frontend-safe)
```

La app carga sin estas variables (muestra aviso ámbar en la home), pero auth y datos
requieren que existan. **Nunca** poner aquí la service role key.

## Estructura

```text
src/
├─ app/            # AppLayout (shell con navegación)
├─ routes/         # router + HomePage
├─ components/     # UI compartida (SupabaseStatusBanner, …)
├─ features/
│  ├─ auth/        # AuthProvider, useAuth, authService, Login/Register, ProtectedRoute
│  ├─ calendar/    # CalendarPage (/app, protegida)
│  ├─ events/      # (Sprint 2)
│  └─ tasks/       # (Sprint 2)
├─ lib/config/     # lectura de env vars (env.ts)
├─ lib/supabase/   # cliente Supabase (client.ts)
├─ styles/         # CSS global (Tailwind v4)
└─ test/           # setup de Vitest (jest-dom + cleanup)
```

## Rutas

| Ruta | Acceso | Contenido |
|---|---|---|
| `/` | pública | Home con estado de Supabase y accesos |
| `/login` | pública | Login con correo + contraseña |
| `/register` | pública | Registro con verificación de correo |
| `/app` | **protegida** | Sesión, calendario por defecto, logout |

## Base de datos

Las migraciones SQL viven en [supabase/migrations/](../../supabase/migrations/).
Cómo aplicarlas y probar auth: [docs/08-sprint-1-auth-db.md](../../docs/08-sprint-1-auth-db.md).
