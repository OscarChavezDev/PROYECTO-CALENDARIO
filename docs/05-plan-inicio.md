---
tags:
  - proyecto-personal
  - desarrollo
  - setup
estado: preparado
fecha_creacion: 2026-06-11
ultima_revision: 2026-06-11
proyecto: "Organizador de calendario inteligente"
---

# Setup ruta de desarrollo

Ruta externa del proyecto:

```text
C:\Users\Oscar\Documents\Proyecto-Personal
```

## Estado del escaneo

La carpeta existe y estaba vacía antes de organizarla.

Se creó estructura base de documentación y carpetas para desarrollo:

```text
Proyecto-Personal/
├─ README.md
├─ .env.example
├─ .gitignore
├─ apps/
├─ docs/
└─ supabase/
   ├─ migrations/
   └─ functions/
```

## Qué falta ejecutar

Todavía no se inicializó el proyecto con Vite ni se instalaron dependencias. Eso debe hacerse cuando Oscar confirme que arrancamos código.

## Comandos sugeridos para iniciar

```powershell
cd C:\Users\Oscar\Documents\Proyecto-Personal
git init
npm create vite@latest apps/calendar-pwa -- --template react-ts
cd apps/calendar-pwa
npm install
npm install @supabase/supabase-js react-router-dom
npm install -D vitest @testing-library/react @testing-library/jest-dom playwright
```

## Variables de entorno esperadas

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

Notas:

- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` pueden usarse en frontend.
- `SUPABASE_SERVICE_ROLE_KEY` nunca debe exponerse al frontend.
- VAPID/SMTP deben usarse desde servidor/Edge Functions.