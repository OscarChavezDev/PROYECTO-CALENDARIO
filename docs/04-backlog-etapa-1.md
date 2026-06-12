---
tags:
  - proyecto-personal
  - backlog
  - etapa-1
  - mvp
estado: sprint-1-implementado
fecha_creacion: 2026-06-11
ultima_revision: 2026-06-12
proyecto: "Organizador de calendario inteligente"
---

# Backlog técnico etapa 1

Proyecto: Organizador de calendario inteligente
Requisitos: Requisitos finales etapa 1
Stack: Stack técnico y plan de inicio
Modelo: Modelo de datos inicial
Ruta desarrollo: `C:\Users\Oscar\Documents\Proyecto-Personal`


## Verificación 2026-06-12 (actualizada tras Sprint 1)

Resultado: **Sprint 0 completo; Sprint 1 implementado y verificado en código** (falta aplicar la migración SQL en Supabase, paso manual).

Validación ejecutada al cierre del Sprint 1:

- ✅ `npm run build`
- ✅ `npm run lint`
- ✅ `npm run test` (10/10 — el test que dependía del `.env.local` real fue corregido)
- ✅ `npm run test:e2e` (3/3 en Chromium)

Ver detalles en `docs/07-informe-verificacion-fase-1-2026-06-12.md` y `docs/08-sprint-1-auth-db.md`.
## Sprint 0 — Preparación

- [x] Inicializar Git en la ruta de desarrollo.
- [x] Crear app `apps/calendar-pwa` con Vite + React + TypeScript.
- [x] Instalar dependencias base.
- [x] Configurar ESLint/formatter si aplica.
- [x] Crear proyecto Supabase / confirmar proyecto Supabase remoto y configuración.
- [x] Crear `.env.local` desde `.env.example` con URL y anon key configuradas.
- [x] Documentar cómo correr el proyecto localmente.

## Sprint 1 — Auth y base de datos

- [x] Crear migración inicial de `profiles`, `calendars`, `events`, `tasks`, `reminders`.
- [x] Activar RLS en tablas principales (en la migración).
- [x] Crear políticas RLS por `user_id` (en la migración).
- [x] Implementar registro con correo + contraseña.
- [x] Implementar verificación de correo (aviso post-registro + estado en /app).
- [x] Implementar login/logout.
- [x] Crear calendario por defecto al registrar usuario (trigger en la migración).
- [x] **Aplicar la migración en Supabase SQL Editor** — aplicada y verificada 2026-06-12 (las 5 tablas responden con RLS activo).
- [x] Probar registro/login real de extremo a extremo — probado por Oscar 2026-06-12: registro, verificación de correo, login, calendario "Personal" visible y logout funcionando.

## Sprint 2 — Eventos y tareas

- [x] Crear formulario de evento.
- [x] Crear formulario de tarea.
- [x] Implementar CRUD de eventos (soft delete con `deleted_at`).
- [x] Implementar CRUD de tareas (incluye completar y posponer).
- [x] Implementar estados de tarea.
- [x] Implementar prioridad (badges en listas).
- [x] Implementar entregable simple (`requires_deliverable` + descripción).

## Sprint 3 — Vistas de calendario

- [x] Crear vista diaria.
- [x] Crear vista semanal (lista agrupada por día, mobile-first).
- [x] Crear vista mensual (grilla con puntos por prioridad).
- [x] Crear lista de pendientes de hoy (+ tareas sin fecha).
- [x] Ordenar por hora y prioridad (sin hora al final).
- [x] Mostrar etiquetas de evento/tarea (badges de tipo, prioridad y estado).

## Sprint 4 — Sincronización

- [x] Conectar Supabase Realtime a eventos.
- [x] Conectar Supabase Realtime a tareas.
- [x] Probar crear desde PC y ver en iPhone — probado por Oscar 2026-06-12 (migración 0002 aplicada).
- [x] Probar crear desde iPhone y ver en PC — probado por Oscar 2026-06-12.
- [x] Implementar recarga/reconciliación si Realtime falla (refetch manual + automático al reconectar).

## Sprint 5 — PWA y offline

- [x] Crear manifest de PWA (+ iconos y metas iOS).
- [x] Configurar service worker (solo producción; network-first navegación, cache-first assets).
- [x] Cachear assets básicos (verificado: la app abre con el servidor apagado).
- [x] Guardar datos recientes para lectura offline (snapshots en IndexedDB).
- [x] Crear cola local de mutaciones offline (entity_type, operation, payload, attempts, last_error).
- [x] Sincronizar cola al recuperar conexión (en orden, se detiene al primer fallo).
- [x] Aplicar regla de conflicto simple: gana `updated_at` más reciente.

## Sprint 6 — Notificaciones

- [ ] Implementar tabla `push_subscriptions`.
- [ ] Solicitar permiso de notificaciones.
- [ ] Guardar suscripción Web Push.
- [ ] Crear prueba manual de Web Push.
- [ ] Probar en iPhone real con PWA instalada.
- [ ] Agregar correo de respaldo para eventos/tareas críticas.

## Sprint 7 — Validación MVP

- [ ] Ejecutar criterios de aceptación.
- [ ] Hacer pruebas en PC.
- [ ] Hacer pruebas en iPhone real.
- [ ] Registrar bugs.
- [ ] Ajustar UX mobile-first.
- [ ] Preparar lista de mejoras para Etapa 2.

## Primer objetivo concreto

El primer objetivo de desarrollo debe ser:

> Abrir una PWA local, registrar usuario, iniciar sesión y crear/ver un evento guardado en Supabase con RLS.