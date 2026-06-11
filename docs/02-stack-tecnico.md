---
tags:
  - proyecto-personal
  - arquitectura
  - stack
  - etapa-1
estado: definido
fecha_creacion: 2026-06-11
ultima_revision: 2026-06-11
proyecto: "Organizador de calendario inteligente"
---

# Stack técnico y plan de inicio

Proyecto: Organizador de calendario inteligente
Requisitos: Requisitos finales etapa 1
Backlog: Backlog técnico etapa 1
Ruta desarrollo: `C:\Users\Oscar\Documents\Proyecto-Personal`

## Stack recomendado

### Frontend / PWA

- **React + TypeScript + Vite**: base rápida para SPA/PWA.
- **Tailwind CSS**: estilos rápidos y consistentes.
- **React Router**: rutas internas: login, calendario, tareas, ajustes.
- **Service Worker + Web App Manifest**: instalación como PWA y soporte offline.
- **IndexedDB**: cache local y cola offline.
- **Dexie** opcional: capa cómoda sobre IndexedDB.

### Backend / datos

- **Supabase/Postgres** como backend principal.
- **Supabase Auth** para correo + contraseña y verificación de email.
- **Row Level Security** para aislar datos por usuario.
- **Supabase Realtime** para sincronización PC ↔ iPhone.
- **Supabase Edge Functions** para lógica sensible: Web Push, emails, recordatorios programados e integraciones futuras.

### Notificaciones y correos

- **Web Push** para recordatorios principales.
- **Correo transaccional/SMTP personalizado** como respaldo.
- **Gmail API** queda como integración futura si se necesita enviar desde una cuenta Gmail autorizada.

### Testing

- **Vitest** para pruebas unitarias.
- **Playwright** para pruebas end-to-end en navegador.
- Pruebas manuales obligatorias en iPhone real.

### Herramientas base

- Node.js en versión LTS.
- Git.
- VS Code.
- Cuenta de Supabase.
- iPhone real para validar PWA/Web Push.

## Estructura recomendada del repo

```text
C:\Users\Oscar\Documents\Proyecto-Personal
├─ README.md
├─ .env.example
├─ .gitignore
├─ apps/
│  └─ calendar-pwa/              # aquí se creará la app Vite + React
├─ docs/
│  ├─ 01-requisitos-etapa-1.md
│  ├─ 02-stack-tecnico.md
│  ├─ 03-modelo-datos-inicial.md
│  ├─ 04-backlog-etapa-1.md
│  └─ 05-plan-inicio.md
└─ supabase/
   ├─ migrations/                # SQL versionado
   └─ functions/                 # Edge Functions futuras
```

## Primeros comandos sugeridos

No los ejecuté todavía. Cuando decidas iniciar código, correr desde PowerShell:

```powershell
cd C:\Users\Oscar\Documents\Proyecto-Personal
git init
npm create vite@latest apps/calendar-pwa -- --template react-ts
cd apps/calendar-pwa
npm install
npm install @supabase/supabase-js react-router-dom
npm install -D vitest @testing-library/react @testing-library/jest-dom playwright
```

Después se agrega Tailwind, PWA manifest/service worker, configuración Supabase y variables de entorno.

## Orden recomendado para empezar

1. Confirmar que la carpeta de desarrollo quedó organizada.
2. Inicializar Git.
3. Crear app Vite React TypeScript en `apps/calendar-pwa`.
4. Crear proyecto Supabase.
5. Definir `.env.local` con URL y anon key de Supabase.
6. Crear migraciones SQL iniciales.
7. Activar RLS.
8. Implementar autenticación.
9. Implementar CRUD eventos/tareas.
10. Implementar vistas calendario.
11. Activar Realtime.
12. Probar PC ↔ iPhone.
13. Probar PWA instalada.
14. Probar Web Push en iPhone.
15. Agregar offline progresivo.

## Fuentes consultadas

- [Vite — Getting Started](https://vite.dev/guide/)
- [React — Build a React app from Scratch](https://react.dev/learn/build-a-react-app-from-scratch)
- [Supabase — Use Supabase with React](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase — Realtime Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Supabase — Password-based Auth](https://supabase.com/docs/guides/auth/passwords)
- [MDN — Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [MDN — Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Apple — Web Push notifications](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers)
- [Tailwind CSS — Install with Vite](https://tailwindcss.com/docs)
- [Vitest — Getting Started](https://vitest.dev/guide/)
- [Playwright — Installation](https://playwright.dev/docs/intro)