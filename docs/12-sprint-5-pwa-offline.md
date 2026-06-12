---
tags:
  - proyecto-personal
  - sprint-5
  - pwa
  - offline
  - indexeddb
estado: implementado
fecha_creacion: 2026-06-12
ultima_revision: 2026-06-12
proyecto: "Organizador de calendario inteligente"
sprint: 5
---

# Sprint 5 — PWA y offline

## Qué se implementó

### PWA instalable

- `public/manifest.webmanifest` — nombre, colores, `display: standalone`, iconos.
- Iconos generados: `pwa-192.png`, `pwa-512.png` (+ maskable) y `apple-touch-icon.png` (180px, iOS).
- Metas iOS en `index.html` (`apple-mobile-web-app-*`, `apple-touch-icon`).
- `public/sw.js` — service worker propio (sin dependencias):
  - **Precache** del shell en `install` (`/`, `index.html`, manifest, iconos).
  - **Navegaciones**: network-first con fallback al `index.html` cacheado.
  - **`/assets/` (hash de Vite) y estáticos**: cache-first con población en runtime.
  - **Nunca intercepta otros orígenes** (Supabase va directo a red; no se cachean secrets).
- `src/lib/pwa/registerServiceWorker.ts` — registra el SW **solo en producción** (en dev rompería HMR).

### Lectura offline (IndexedDB)

- `src/lib/offline/db.ts` — capa mínima sobre IndexedDB nativo (sin Dexie: el uso es simple
  y se evita una dependencia). Stores: `events`, `tasks`, `mutationQueue`, `meta`.
- Cada vez que cambian eventos/tareas se guarda un **snapshot** (sin filas locales sin sincronizar).
- Si la carga contra Supabase falla (sin red), `CalendarPage` lee el snapshot y muestra el aviso
  "Estás viendo datos guardados localmente".

### Cola offline de mutaciones

- `src/lib/offline/offlineQueue.ts` — cada mutación guarda `entity_type`, `operation`
  (`create|update|delete|complete|postpone`), `payload`, `entity_id`, `base_updated_at`,
  `queued_at`, `attempts` y `last_error`.
- `src/lib/offline/syncQueue.ts` — `processQueue()` ejecuta la cola **en orden** al recuperar
  conexión (y al montar la app); al primer fallo se detiene (orden causal) y guarda el error
  para reintento.
- **Regla de conflicto simple: gana `updated_at` más reciente.** Antes de aplicar un
  update/complete/postpone encolado se consulta el `updated_at` del servidor; si el servidor
  cambió la fila después de encolarse la mutación, la mutación se descarta.
- Optimista en UI: crear/editar offline se refleja al instante con filas locales
  (`id` con prefijo `local-`); al sincronizar, un refetch trae la verdad del servidor.
- Editar o borrar offline algo creado offline **fusiona/cancela** la mutación encolada
  (no genera operaciones inválidas contra el servidor).
- Contador "N cambios por sincronizar" junto al badge de sync.

### Indicadores

- `src/lib/network/useOnlineStatus.ts` — hook con `navigator.onLine` + eventos (useSyncExternalStore).
- `src/components/OfflineBanner.tsx` — banner ámbar global bajo el header cuando no hay conexión.

## Cómo instalar en iPhone

1. Servir la app por **HTTPS** (o probar en LAN con `npm run dev -- --host`; para instalar
   de verdad se necesita un despliegue HTTPS, p. ej. Vercel/Netlify gratuito — pendiente de
   autorización de Oscar).
2. Abrir la URL en **Safari** → botón **Compartir** → **Añadir a pantalla de inicio**.
3. La app abre standalone (sin barra de Safari), con el icono de calendario.

## Cómo probar offline (PC)

1. `npm run build && npm run preview` → abrir `http://localhost:4173` y hacer login.
2. Recargar una vez (el SW toma control), luego DevTools → Network → **Offline**.
3. Recargar: la app abre desde el cache y muestra los datos guardados + banner offline.
4. Crear una tarea estando offline → aparece al instante + contador "1 cambio por sincronizar".
5. Quitar Offline: la cola se procesa sola, el contador desaparece y un refetch reconcilia.

Verificación automatizada ya ejecutada: con el servidor de preview **apagado**, la app cargó
desde el cache del SW y renderizó la pantalla completa.

## Limitaciones (iOS y generales)

- **Instalación PWA requiere HTTPS** (Safari no instala desde http://IP-local). El despliegue
  gratuito llega como pendiente.
- iOS no soporta Background Sync: la cola solo se procesa con la app abierta.
- Safari puede purgar caches/IndexedDB de PWAs sin uso prolongado (~semanas).
- Completar/posponer una tarea creada offline requiere esperar su sincronización.
- La sesión de Supabase debe existir previamente; el login necesita conexión.
- Cambio de versión del shell: el SW usa cache `calendar-pwa-v1`; al cambiar assets el
  network-first de navegación trae el HTML nuevo y los assets nuevos se cachean al vuelo.

## Pendientes para Sprint 6

- Tabla/migración `push_subscriptions` (ya prevista) + permiso de notificaciones en UI.
- Edge Function para enviar push de prueba + VAPID keys.
- Correo de respaldo (SMTP free tier, sin activar pagos).
- Prueba en iPhone real con PWA instalada (requiere despliegue HTTPS).

## Verificación ejecutada

- ✅ `npm run build` · ✅ `npm run lint` · ✅ `npm run test` (67/67, 18 archivos) · ✅ `npm run test:e2e` (3/3)
- ✅ Prueba offline real: manifest 200, SW controlando la página, app carga con el servidor apagado.
