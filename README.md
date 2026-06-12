# Organizador de calendario inteligente

PWA mobile-first para organizar calendario personal (eventos, tareas, prioridades,
entregables y recordatorios) sincronizada entre PC y iPhone.

Repositorio: <https://github.com/OscarChavezDev/PROYECTO-CALENDARIO>

## Decisión técnica

**PWA + Supabase/Postgres + calendario propio + integración Google más adelante.**

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4 (plugin `@tailwindcss/vite`)
- React Router
- Supabase Auth + Postgres + RLS + Realtime
- PWA: manifest + service worker (Sprint 5)
- IndexedDB para offline (Sprint 5)
- Web Push + correo como respaldo (Sprint 6)
- Vitest + Testing Library + Playwright para pruebas

## Estructura

```text
apps/calendar-pwa/      # app PWA React (Vite + TS)
supabase/migrations/    # SQL versionado
supabase/functions/     # Edge Functions futuras
docs/                   # documentación técnica del proyecto
```

Estructura interna de la app:

```text
apps/calendar-pwa/src/
├─ app/            # layout/shell de la aplicación
├─ routes/         # router y páginas generales
├─ components/     # UI compartida
├─ features/       # auth, calendar, events, tasks
├─ lib/config/     # lectura de variables de entorno
├─ lib/supabase/   # cliente Supabase
├─ styles/         # CSS global (Tailwind)
└─ test/           # setup de Vitest
```

## Cómo instalar y correr

```powershell
cd C:\Users\Oscar\Documents\Proyecto-Personal\apps\calendar-pwa
npm install
npm run dev        # servidor de desarrollo (http://localhost:5173)
npm run build      # type-check + build de producción
npm run preview    # sirve el build de producción
npm run test       # tests unitarios (Vitest)
npm run test:e2e   # tests e2e (requiere: npx playwright install chromium)
```

## Variables de entorno

Copiar `apps/calendar-pwa/.env.example` a `apps/calendar-pwa/.env.local` y llenar:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

La app carga sin estas variables (muestra un aviso en la pantalla inicial), pero
se necesitan para todo lo que use backend a partir del Sprint 1.

Las variables server-only (service role key, VAPID, SMTP) viven en el
`.env.example` de la raíz y **nunca** deben exponerse al frontend.

## Estado del proyecto

- ✅ Sprint 0 — Preparación del repo y base frontend
- ⬜ Sprint 1 — Auth y base de datos
- ⬜ Sprint 2 — Eventos y tareas
- ⬜ Sprint 3 — Vistas de calendario
- ⬜ Sprint 4 — Sincronización Realtime
- ⬜ Sprint 5 — PWA y offline
- ⬜ Sprint 6 — Notificaciones
- ⬜ Sprint 7 — Validación MVP

### Pasos manuales pendientes (Oscar)

1. Crear el proyecto en [Supabase](https://supabase.com) (plan Free) — necesario para Sprint 1.
2. Copiar URL y anon key a `apps/calendar-pwa/.env.local`.
3. Opcional: `npx playwright install chromium` para correr los tests e2e.

Ver documentación completa en `docs/` y el plan de sprints en
`docs/prompts/00-prompt-maestro-desarrollo-por-sprints.md`.
