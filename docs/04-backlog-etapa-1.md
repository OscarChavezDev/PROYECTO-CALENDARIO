---
tags:
  - proyecto-personal
  - backlog
  - etapa-1
  - mvp
estado: listo-para-primer-sprint
fecha_creacion: 2026-06-11
ultima_revision: 2026-06-11
proyecto: "Organizador de calendario inteligente"
---

# Backlog técnico etapa 1

Proyecto: Organizador de calendario inteligente
Requisitos: Requisitos finales etapa 1
Stack: Stack técnico y plan de inicio
Modelo: Modelo de datos inicial
Ruta desarrollo: `C:\Users\Oscar\Documents\Proyecto-Personal`

## Sprint 0 — Preparación

- [ ] Inicializar Git en la ruta de desarrollo.
- [ ] Crear app `apps/calendar-pwa` con Vite + React + TypeScript.
- [ ] Instalar dependencias base.
- [ ] Configurar ESLint/formatter si aplica.
- [ ] Crear proyecto Supabase.
- [ ] Crear `.env.local` desde `.env.example`.
- [ ] Documentar cómo correr el proyecto localmente.

## Sprint 1 — Auth y base de datos

- [ ] Crear migración inicial de `profiles`, `calendars`, `events`, `tasks`, `reminders`.
- [ ] Activar RLS en tablas principales.
- [ ] Crear políticas RLS por `user_id`.
- [ ] Implementar registro con correo + contraseña.
- [ ] Implementar verificación de correo.
- [ ] Implementar login/logout.
- [ ] Crear calendario por defecto al registrar usuario.

## Sprint 2 — Eventos y tareas

- [ ] Crear formulario de evento.
- [ ] Crear formulario de tarea.
- [ ] Implementar CRUD de eventos.
- [ ] Implementar CRUD de tareas.
- [ ] Implementar estados de tarea.
- [ ] Implementar prioridad.
- [ ] Implementar entregable simple.

## Sprint 3 — Vistas de calendario

- [ ] Crear vista diaria.
- [ ] Crear vista semanal.
- [ ] Crear vista mensual.
- [ ] Crear lista de pendientes de hoy.
- [ ] Ordenar por hora y prioridad.
- [ ] Mostrar etiquetas de evento/tarea.

## Sprint 4 — Sincronización

- [ ] Conectar Supabase Realtime a eventos.
- [ ] Conectar Supabase Realtime a tareas.
- [ ] Probar crear desde PC y ver en iPhone.
- [ ] Probar crear desde iPhone y ver en PC.
- [ ] Implementar recarga/reconciliación si Realtime falla.

## Sprint 5 — PWA y offline

- [ ] Crear manifest de PWA.
- [ ] Configurar service worker.
- [ ] Cachear assets básicos.
- [ ] Guardar datos recientes para lectura offline.
- [ ] Crear cola local de mutaciones offline.
- [ ] Sincronizar cola al recuperar conexión.
- [ ] Aplicar regla de conflicto simple: gana `updated_at` más reciente.

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