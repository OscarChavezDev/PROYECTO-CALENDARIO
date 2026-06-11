# Organizador de calendario inteligente

Ruta de desarrollo: `C:\Users\Oscar\Documents\Proyecto-Personal`

## Decisión técnica

**PWA + Supabase/Postgres + calendario propio + integración Google más adelante.**

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Supabase Auth + Postgres + RLS + Realtime
- PWA: manifest + service worker
- IndexedDB para offline
- Web Push + correo como respaldo
- Vitest + Playwright para pruebas

## Estructura

```text
apps/calendar-pwa/      # app PWA React
supabase/migrations/    # SQL versionado
supabase/functions/     # Edge Functions futuras
docs/                   # documentación técnica del proyecto
```

## Primeros comandos sugeridos

```powershell
cd C:\Users\Oscar\Documents\Proyecto-Personal
git init
npm create vite@latest apps/calendar-pwa -- --template react-ts
cd apps/calendar-pwa
npm install
npm install @supabase/supabase-js react-router-dom
npm install -D vitest @testing-library/react @testing-library/jest-dom playwright
```

Ver documentación en `docs/`.