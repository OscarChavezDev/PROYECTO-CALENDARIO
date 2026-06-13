---
tags:
  - proyecto-personal
  - despliegue
  - vercel
  - pwa
estado: listo-para-desplegar
fecha_creacion: 2026-06-12
ultima_revision: 2026-06-12
proyecto: "Organizador de calendario inteligente"
---

# Despliegue en Vercel (plan Free, sin tarjeta)

Objetivo: tener una URL **HTTPS** pública para instalar la PWA en iPhone y, más
adelante, probar Web Push real (Sprint 6). El plan Hobby de Vercel es gratuito y no
pide tarjeta.

## Configuración ya incluida en el repo

`apps/calendar-pwa/vercel.json`:
- `framework: vite` → build automático (`npm run build` = `tsc -b && vite build`).
- Rewrite SPA `/(.*) → /index.html` (React Router). Los archivos reales —`sw.js`,
  `manifest.webmanifest`, `/assets/*`— se sirven directo porque los rewrites solo
  aplican cuando no hay archivo que coincida.
- Headers: `sw.js` sin caché (para que las actualizaciones lleguen) y `Content-Type`
  correcto del manifest.

## Pasos (una sola vez, ~5 minutos)

1. Entrar a [vercel.com](https://vercel.com) → **Sign Up** → **Continue with GitHub**
   (autoriza la cuenta `OscarChavezDev`).
2. **Add New… → Project** → importar el repo **`OscarChavezDev/PROYECTO-CALENDARIO`**.
3. En la pantalla de configuración del proyecto:
   - **Root Directory** → click *Edit* → seleccionar **`apps/calendar-pwa`**.
     (Es obligatorio: el `package.json` vive ahí, no en la raíz del repo.)
   - **Framework Preset**: debe autodetectar **Vite**. Build Command y Output
     (`dist`) se llenan solos.
4. Desplegar **Environment Variables** (sección *Environment Variables*). Copiar los
   dos valores desde `apps/calendar-pwa/.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   > Solo estas dos. NO subir la service role key ni VAPID/SMTP (esas van en el
   > servidor/Edge Functions del Sprint 6).
5. Click **Deploy**. En ~1 minuto da una URL tipo `https://proyecto-calendario.vercel.app`.

A partir de aquí, cada `git push` a `main` redepliega solo.

## Paso obligatorio en Supabase tras el primer deploy

Para que la verificación de correo y los redirects funcionen en la URL pública:

1. Supabase Dashboard → **Authentication → URL Configuration**.
2. **Site URL**: poner la URL de Vercel (`https://...vercel.app`).
3. **Redirect URLs**: agregar `https://...vercel.app/**` (y dejar también
   `http://localhost:5173/**` para seguir desarrollando en local).

## Instalar la PWA en iPhone

1. Abrir la URL de Vercel en **Safari** (no Chrome iOS).
2. Botón **Compartir** → **Añadir a pantalla de inicio**.
3. Se instala con el icono de calendario y abre en pantalla completa (standalone).

## Verificar que quedó bien

- Abrir la URL en el navegador → debe cargar y mostrar el aviso verde de Supabase.
- DevTools → Application → Manifest: sin errores; Service Workers: activo.
- Registrarse / iniciar sesión desde la URL pública.

## Notas

- El plan Free es para uso personal/no comercial: suficiente para el MVP.
- El dominio `*.vercel.app` es gratis; un dominio propio es opcional y de pago (no se
  compra sin tu permiso).
