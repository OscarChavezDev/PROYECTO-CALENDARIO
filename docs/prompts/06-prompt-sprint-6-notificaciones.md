---
tags:
  - proyecto-personal
  - prompt
  - desarrollo
  - sprint-6
  - notificaciones
  - web-push
  - reminders
estado: listo-para-usar
fecha_creacion: 2026-06-12
ultima_revision: 2026-06-12
proyecto: "Organizador de calendario inteligente"
sprint: 6
---

# Prompt Sprint 6 ? Notificaciones

Proyecto: Organizador de calendario inteligente
Backlog: Backlog t?cnico etapa 1
Requisitos: Requisitos finales etapa 1
Modelo: Modelo de datos inicial
Ruta desarrollo: `C:\Users\Oscar\Documents\Proyecto-Personal`

## Uso

Copiar el bloque **PROMPT DIRECTO** y pegarlo en el agente/desarrollador. Este prompt es solo para el sprint indicado.

---

## PROMPT DIRECTO

```text
Act?a como desarrollador senior full-stack especializado en Web Push, Supabase Edge Functions, seguridad de secrets y recordatorios.

Vas a ejecutar SOLO el SPRINT 6 ? Notificaciones.

RUTA DEL PROYECTO:
C:\Users\Oscar\Documents\Proyecto-Personal

APP PRINCIPAL:
C:\Users\Oscar\Documents\Proyecto-Personal\apps\calendar-pwa

REGLAS GENERALES:
- Trabaja SOLO este sprint. No avances al siguiente sin confirmaci?n de Oscar.
- Verifica el estado real del repo antes de modificar.
- No borres documentaci?n ni c?digo existente sin justificar.
- No uses servicios pagos ni pidas tarjeta.
- No expongas service role key, VAPID private key, SMTP secrets ni otros secretos en frontend.
- Mant?n TypeScript, mobile-first y documentaci?n actualizada.
- Al terminar ejecuta: npm run build, npm run lint, npm run test, npm run test:e2e.
- Si un comando falla, corrige o documenta bloqueo real.

PRECONDICIONES:
- Sprint 1 completo: Auth + DB + RLS.
- Sprint 2 completo: eventos/tareas.
- Sprint 5 idealmente completo: PWA y service worker.
- Si no hay service worker/PWA, implementa solo la preparaci?n m?nima necesaria para Web Push, pero no rehagas Sprint 5 completo.

OBJETIVO:
Preparar e implementar notificaciones Web Push de prueba y estructura para recordatorios, con correo como respaldo documentado/preparado sin activar servicios pagos.

ALCANCE:
1. Migraci?n para `push_subscriptions` si no existe.
2. RLS para `push_subscriptions`.
3. UI para solicitar permiso de notificaciones.
4. Registrar push subscription del navegador.
5. Edge Function/API para enviar push de prueba.
6. Documentar generaci?n de VAPID keys.
7. No exponer VAPID private key ni service role key en frontend.
8. Preparar correo de respaldo con SMTP/transaccional como documentaci?n/config, sin pagar.
9. Documentar prueba en iPhone real con PWA instalada.

FUERA DE ALCANCE:
- Scheduler completo de recordatorios recurrentes.
- Gmail API real.
- Sistema avanzado de emails.
- App nativa.

TABLA `push_subscriptions`:
- id uuid primary key default gen_random_uuid()
- user_id uuid not null references auth.users(id) on delete cascade
- endpoint text not null
- p256dh text not null
- auth text not null
- user_agent text null
- created_at timestamptz default now()
- revoked_at timestamptz null

WEB PUSH:
- Usar Push API y Notification API.
- Service worker escucha `push` y muestra notification.
- VAPID_PUBLIC_KEY puede estar en frontend.
- VAPID_PRIVATE_KEY nunca en frontend.
- Edge Function o endpoint server-side env?a push de prueba.

ARCHIVOS SUGERIDOS:
- supabase/migrations/*_push_subscriptions.sql
- supabase/functions/send-test-push/index.ts
- src/features/notifications/NotificationSettings.tsx
- src/features/notifications/pushService.ts
- public/sw.js o mecanismo equivalente
- docs/13-sprint-6-notificaciones.md

UI:
- Secci?n ?Notificaciones?.
- Bot?n solicitar permisos.
- Estado: no soportado / pendiente / permitido / denegado.
- Bot?n ?Enviar notificaci?n de prueba?.
- Mensaje para iPhone: instalar PWA en pantalla de inicio si es necesario.

TESTS M?NIMOS:
- Detecci?n de soporte Notification/PushManager.
- UI muestra estados b?sicos.
- No testear push real en unit si no es viable; documentar manual.

DOCUMENTACI?N:
Crear `docs/13-sprint-6-notificaciones.md` con VAPID keys, variables, despliegue Edge Function, prueba navegador/iPhone y limitaciones.

CRITERIOS DE ACEPTACI?N:
- push_subscriptions existe con RLS.
- Frontend puede pedir permiso y guardar subscription.
- Funci?n/API de push de prueba existe o queda lista con instrucciones si faltan secrets.
- No hay secrets expuestos.
- Build/lint/test/e2e pasan o bloqueo real documentado.


FORMATO FINAL OBLIGATORIO:
1. Sprint ejecutado
2. Resumen de implementaci?n
3. Archivos creados/modificados
4. Comandos ejecutados y resultados
5. Pruebas manuales sugeridas para Oscar
6. Riesgos/bloqueos
7. Pendientes para Sprint 7
8. Estado Git
9. Pregunta final: ??Confirmas que avance al Sprint 7??

No avances al Sprint 7 sin confirmaci?n.
```
