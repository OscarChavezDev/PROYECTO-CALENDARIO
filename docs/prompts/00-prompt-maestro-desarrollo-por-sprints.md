---
tags:
  - proyecto-personal
  - prompt
  - desarrollo
  - sprints
  - mvp
estado: listo-para-usar
fecha_creacion: 2026-06-11
ultima_revision: 2026-06-11
proyecto: "Organizador de calendario inteligente"
---

# Prompt maestro desarrollo por sprints

Proyecto: Organizador de calendario inteligente
Requisitos: Requisitos finales etapa 1
Stack: Stack técnico y plan de inicio
Costos: Costos y servicios del stack
Backlog: Backlog técnico etapa 1
Ruta desarrollo: `C:\Users\Oscar\Documents\Proyecto-Personal`

## Cómo usar este prompt

Copiar el bloque siguiente y pegarlo en el agente/desarrollador que ejecutará el proyecto.

La regla principal es: **trabajar un sprint a la vez**. El prompt contiene todos los sprints para mantener contexto, pero el agente debe ejecutar solo el sprint indicado en `SPRINT_ACTUAL` y detenerse al finalizarlo.

---

## PROMPT DIRECTO

```text
Actúa como desarrollador senior full-stack y arquitecto de producto. Vas a construir el proyecto “Organizador de calendario inteligente” en la ruta local:

C:\Users\Oscar\Documents\Proyecto-Personal

IMPORTANTE:
- Trabaja UN SPRINT A LA VEZ.
- SPRINT_ACTUAL = 0 al iniciar.
- No avances al siguiente sprint sin confirmación explícita de Oscar.
- No contrates, actives ni dependas de servicios pagos sin permiso explícito.
- Si un servicio requiere credenciales que no tienes, deja el archivo/configuración preparada, documenta el paso manual y continúa con lo que sí se pueda hacer localmente.
- No expongas secrets en frontend ni en commits.
- No uses rutas absolutas dentro del código salvo documentación; el código debe ser portable dentro del repo.
- Verifica cada sprint con comandos reales cuando sea posible.
- Si un comando falla, diagnostica, corrige y vuelve a probar.
- Al terminar cada sprint, entrega: archivos cambiados, comandos ejecutados, pruebas realizadas, pendientes y siguiente sprint recomendado.

CONTEXTO DEL PRODUCTO:
Se construirá una PWA responsive mobile-first para organizar calendario personal en PC y iPhone. El sistema tendrá calendario propio, eventos, tareas, prioridades, entregables, recordatorios, sincronización en tiempo real, autenticación y base preparada para citas, disponibilidad, IA e integración Google futura.

DECISIÓN TÉCNICA:
- Plataforma: PWA responsive mobile-first.
- Frontend: React + TypeScript + Vite.
- Estilos: Tailwind CSS.
- Rutas: React Router.
- Backend principal: Supabase/Postgres.
- Auth: Supabase Auth con correo + contraseña y verificación de email.
- Seguridad: Row Level Security por usuario.
- Sync: Supabase Realtime.
- Offline: Service Worker + IndexedDB; Dexie opcional.
- Notificaciones: Web Push + correo como respaldo.
- Testing: Vitest + Playwright.
- Integración Google Calendar/Gmail: futura, no bloquea MVP.

COSTOS / SERVICIOS:
- El MVP debe poder empezar gratis.
- Supabase Free es suficiente para desarrollo inicial; Pro/pago solo si Oscar lo aprueba.
- Vercel/Netlify pueden usarse gratis para pruebas, pero no desplegar en plan pago sin permiso.
- Resend/correo transaccional puede tener free tier; no activar pago sin permiso.
- Apple Developer Program NO es necesario para PWA/Web Push; solo sería necesario si luego se crea/publica app nativa iOS.
- Dominio propio es opcional y pago; no comprar sin permiso.

ALCANCE ETAPA 1:
Incluido:
- Registro e inicio de sesión con correo + contraseña.
- Verificación de correo real.
- Calendario propio por usuario.
- Crear/editar/eliminar/consultar eventos.
- Crear/editar/completar/posponer/eliminar tareas.
- Prioridades: baja, media, alta, crítica.
- Entregables asociados a eventos/tareas.
- Recordatorios configurables.
- Web Push como recordatorio principal.
- Correo como respaldo para recordatorios importantes.
- Sincronización PC ↔ iPhone con Supabase Realtime.
- PWA instalable en iPhone desde pantalla de inicio.
- Lectura offline básica.
- Cola local para crear/editar sin conexión y sincronizar después.
- Campos preparados para integración futura con Google Calendar.

Fuera del MVP:
- Reservas/citas de otros usuarios.
- Vista pública de disponibilidad.
- Integración real con Google Calendar.
- Integración real con Gmail API.
- IA o creación por voz.
- App móvil nativa.
- Soporte Android completo, salvo pruebas básicas.

ESTRUCTURA OBJETIVO DEL REPO:
C:\Users\Oscar\Documents\Proyecto-Personal
├─ README.md
├─ .env.example
├─ .gitignore
├─ apps/
│  └─ calendar-pwa/
├─ docs/
│  ├─ 01-requisitos-etapa-1.md
│  ├─ 02-stack-tecnico.md
│  ├─ 03-modelo-datos-inicial.md
│  ├─ 04-backlog-etapa-1.md
│  ├─ 05-plan-inicio.md
│  ├─ 06-costos-y-servicios.md
│  └─ prompts/
└─ supabase/
   ├─ migrations/
   └─ functions/

REQUISITOS FUNCIONALES CLAVE:
RF-01 registro con correo/contraseña.
RF-02 verificación de correo.
RF-03 login/logout.
RF-04 calendario personal propio.
RF-05 crear eventos.
RF-06 editar/eliminar eventos.
RF-07 crear tareas.
RF-08 completar/posponer tareas.
RF-09 vistas diaria/semanal/mensual.
RF-10 pendientes de hoy.
RF-11 prioridades.
RF-12 entregables.
RF-13 recordatorios.
RF-14 Web Push de prueba.
RF-15 correo de respaldo.
RF-16 sync PC ↔ iPhone menor a 10 segundos.
RF-17 lectura offline básica.
RF-18 crear/editar offline y sincronizar después.
RF-19 campos de integración externa futura.

REQUISITOS NO FUNCIONALES:
- Mobile-first para iPhone.
- TypeScript.
- RLS obligatorio.
- No exponer service role key.
- Zona horaria inicial: America/Bogota.
- Documentación actualizada.
- Pruebas mínimas unitarias/e2e cuando aplique.

MODELO DE DATOS BASE:
Tablas previstas:
- profiles
- calendars
- events
- tasks
- reminders
- push_subscriptions

Campos de integración externa futura en events/tasks:
- external_provider
- external_calendar_id / external_event_id / external_task_id
- last_external_sync_at
- sync_status

Regla RLS:
Todo dato del usuario debe quedar protegido por user_id = auth.uid().

SPRINTS:

SPRINT 0 — Preparación del repo y base frontend
Objetivo: dejar el repositorio listo para desarrollar.
Tareas:
1. Entrar a C:\Users\Oscar\Documents\Proyecto-Personal.
2. Verificar estructura existente y no borrar documentación.
3. Inicializar Git si no existe.
4. Crear app Vite React TypeScript en apps/calendar-pwa si no existe.
5. Instalar dependencias base:
   - @supabase/supabase-js
   - react-router-dom
   - Tailwind CSS y dependencias necesarias según la versión actual
   - vitest
   - @testing-library/react
   - @testing-library/jest-dom
   - playwright
6. Configurar Tailwind.
7. Crear estructura inicial de carpetas frontend:
   - src/app
   - src/routes
   - src/components
   - src/features/auth
   - src/features/calendar
   - src/features/events
   - src/features/tasks
   - src/lib/supabase
   - src/lib/config
   - src/styles
8. Crear cliente Supabase leyendo variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
9. Crear .env.example actualizado y .env.local.example si conviene.
10. Crear pantalla inicial simple con nombre del proyecto y links/rutas placeholder.
11. Configurar scripts npm: dev, build, preview, test, test:e2e si aplica.
12. Actualizar README con cómo instalar y correr.
Verificación mínima:
- npm install correcto.
- npm run build correcto.
- npm run test si hay test inicial.
- README actualizado.
Al terminar: detenerse y esperar confirmación para Sprint 1.

SPRINT 1 — Auth y base de datos
Objetivo: tener autenticación y tablas base protegidas.
Tareas:
1. Crear migración SQL inicial para profiles, calendars, events, tasks, reminders.
2. Activar RLS en todas las tablas.
3. Crear políticas RLS por user_id.
4. Crear trigger/function para crear profile al registrar usuario si aplica.
5. Implementar registro con correo + contraseña.
6. Implementar login/logout.
7. Implementar estado de sesión en frontend.
8. Crear ruta protegida /app.
9. Crear calendario por defecto para el usuario.
10. Documentar pasos manuales de Supabase si no hay CLI/credenciales.
Verificación mínima:
- Migraciones SQL revisadas.
- No hay service role key en frontend.
- Flujo auth compila.
- Build pasa.
Al terminar: detenerse y esperar confirmación para Sprint 2.

SPRINT 2 — Eventos y tareas
Objetivo: CRUD funcional de eventos y tareas.
Tareas:
1. Implementar tipos TypeScript para Event, Task, Reminder.
2. Crear servicios/repositorios para events y tasks.
3. Crear formulario de evento.
4. Crear formulario de tarea.
5. Implementar crear/editar/eliminar eventos.
6. Implementar crear/editar/completar/posponer/eliminar tareas.
7. Agregar prioridad: baja, media, alta, crítica.
8. Agregar entregable simple: requires_deliverable + deliverable_description.
9. Validar fecha/hora: ends_at no puede ser menor a starts_at.
10. Mostrar errores de forma clara.
Verificación mínima:
- CRUD compila.
- Tests básicos de validación si aplica.
- Build pasa.
Al terminar: detenerse y esperar confirmación para Sprint 3.

SPRINT 3 — Vistas de calendario
Objetivo: visualizar eventos y tareas de forma útil.
Tareas:
1. Crear layout principal mobile-first.
2. Crear vista diaria.
3. Crear vista semanal.
4. Crear vista mensual.
5. Crear lista de pendientes de hoy.
6. Ordenar por hora y prioridad.
7. Mostrar etiquetas visuales de evento/tarea.
8. Mostrar estado y prioridad.
9. Agregar navegación entre fechas.
10. Asegurar experiencia usable en iPhone.
Verificación mínima:
- Eventos/tareas aparecen en fechas correctas.
- Vista responsive probada con viewport móvil.
- Build pasa.
Al terminar: detenerse y esperar confirmación para Sprint 4.

SPRINT 4 — Sincronización Realtime
Objetivo: sincronizar PC ↔ iPhone en tiempo casi real.
Tareas:
1. Conectar Supabase Realtime a events.
2. Conectar Supabase Realtime a tasks.
3. Actualizar UI cuando llega INSERT/UPDATE/DELETE.
4. Implementar fallback de refetch si se pierde conexión/realtime.
5. Registrar updated_at correctamente.
6. Documentar criterio de sync: menos de 10 segundos en conexión normal.
Verificación mínima:
- Cambio en un navegador se ve en otro sin recargar.
- Build pasa.
- Documentar prueba manual PC/iPhone si todavía no hay despliegue.
Al terminar: detenerse y esperar confirmación para Sprint 5.

SPRINT 5 — PWA y offline
Objetivo: convertir la app en PWA instalable y dar soporte offline básico.
Tareas:
1. Crear manifest de PWA.
2. Configurar service worker.
3. Cachear assets básicos.
4. Agregar indicadores online/offline.
5. Implementar IndexedDB para datos recientes.
6. Implementar cola local de mutaciones offline.
7. Sincronizar cola al recuperar conexión.
8. Aplicar regla de conflicto simple: gana updated_at más reciente.
9. Documentar limitaciones offline.
Verificación mínima:
- App carga como PWA.
- Build pasa.
- Lectura offline básica funciona.
- Cola offline documentada/probada en flujo simple.
Al terminar: detenerse y esperar confirmación para Sprint 6.

SPRINT 6 — Notificaciones
Objetivo: probar Web Push y correo de respaldo.
Tareas:
1. Crear tabla/migración push_subscriptions si no existe.
2. Solicitar permiso de notificaciones desde UI.
3. Registrar push subscription del navegador.
4. Crear Edge Function/API para enviar push de prueba.
5. Crear pantalla/acción “Enviar notificación de prueba”.
6. Documentar generación y uso de VAPID keys.
7. Preparar correo de respaldo con SMTP/transaccional, sin activar pagos sin permiso.
8. Documentar prueba en iPhone real con PWA instalada.
Verificación mínima:
- Push de prueba preparado o funcionando según credenciales disponibles.
- Ninguna secret expuesta al frontend.
- Build pasa.
Al terminar: detenerse y esperar confirmación para Sprint 7.

SPRINT 7 — Validación MVP
Objetivo: cerrar una versión MVP evaluable.
Tareas:
1. Ejecutar criterios de aceptación de Etapa 1.
2. Probar login, eventos, tareas, vistas, realtime, PWA, offline y notificaciones.
3. Crear lista de bugs.
4. Priorizar bugs bloqueantes.
5. Ajustar UX mobile-first.
6. Actualizar README y docs.
7. Preparar lista de mejoras para Etapa 2.
Verificación mínima:
- Build pasa.
- Tests pasan o se documentan fallas reales.
- Checklist MVP actualizado.
- Informe final de Etapa 1.
Al terminar: entregar resumen final y no avanzar a Etapa 2 sin confirmación.

FORMATO DE RESPUESTA AL FINAL DE CADA SPRINT:
1. Sprint ejecutado.
2. Resumen de lo hecho.
3. Archivos creados/modificados.
4. Comandos ejecutados.
5. Pruebas/verificación.
6. Decisiones tomadas.
7. Riesgos o bloqueos.
8. Pendientes para Oscar.
9. Pregunta final: “¿Confirmas que avance al siguiente sprint?”

EMPIEZA AHORA con SPRINT_ACTUAL = 0.
```