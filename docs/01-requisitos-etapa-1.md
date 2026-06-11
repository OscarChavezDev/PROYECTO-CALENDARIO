---
tags:
  - proyecto-personal
  - requisitos
  - etapa-1
  - mvp
estado: definido
fecha_creacion: 2026-06-11
ultima_revision: 2026-06-11
proyecto: "Organizador de calendario inteligente"
etapa: 1
---

# Requisitos finales etapa 1 — Organizador de calendario inteligente

Proyecto: Organizador de calendario inteligente
Decisiones: Decisiones etapa 1
Stack: Stack técnico y plan de inicio
Modelo de datos: Modelo de datos inicial
Backlog: Backlog técnico etapa 1
Ruta de desarrollo: `C:\Users\Oscar\Documents\Proyecto-Personal`

## Decisión base

La Etapa 1 se construirá como:

> **PWA responsive mobile-first + Supabase/Postgres + calendario propio + integración Google más adelante.**

## Objetivo del MVP

Tener una primera versión usable para organizar mi calendario personal desde PC y iPhone, con eventos, tareas, prioridades, recordatorios, sincronización entre dispositivos y base preparada para citas, disponibilidad e IA en etapas futuras.

## Alcance incluido

- Registro e inicio de sesión con correo + contraseña.
- Verificación de correo real.
- Calendario propio por usuario.
- Crear, editar, eliminar y consultar eventos.
- Crear, editar, completar, posponer y eliminar tareas.
- Prioridades: baja, media, alta, crítica.
- Entregables asociados a eventos/tareas.
- Recordatorios configurables.
- Web Push como recordatorio principal.
- Correo como respaldo para recordatorios importantes.
- Sincronización PC ↔ iPhone mediante Supabase Realtime.
- PWA instalable en iPhone desde pantalla de inicio.
- Lectura offline básica.
- Cola local para crear/editar sin conexión y sincronizar después.
- Campos preparados para integración futura con Google Calendar.

## Fuera del MVP

- Reservas/citas de otros usuarios.
- Vista pública de disponibilidad.
- Integración real con Google Calendar.
- Integración real con Gmail API.
- IA o creación por voz.
- App móvil nativa.
- Soporte Android completo, salvo pruebas básicas.

## Requisitos funcionales

| ID | Requisito | Prioridad | Criterio de aceptación |
|---|---|---:|---|
| RF-01 | El usuario puede registrarse con correo y contraseña. | Alta | La cuenta queda pendiente de verificación por email. |
| RF-02 | El usuario debe verificar su correo. | Alta | No puede usar funciones principales sin email confirmado. |
| RF-03 | El usuario puede iniciar/cerrar sesión. | Alta | La sesión funciona en PC y iPhone. |
| RF-04 | El usuario tiene un calendario personal propio. | Alta | Solo ve sus datos. |
| RF-05 | El usuario puede crear eventos. | Alta | Evento con título, fecha, hora inicio y hora fin. |
| RF-06 | El usuario puede editar/eliminar eventos. | Alta | Cambios se reflejan en la vista calendario. |
| RF-07 | El usuario puede crear tareas. | Alta | Tarea con título, fecha límite, prioridad y estado. |
| RF-08 | El usuario puede completar o posponer tareas. | Alta | Estado cambia correctamente. |
| RF-09 | El usuario puede ver calendario diario, semanal y mensual. | Alta | Eventos/tareas aparecen en las fechas correctas. |
| RF-10 | El usuario puede ver pendientes de hoy. | Alta | Lista filtra tareas/eventos del día actual. |
| RF-11 | El usuario puede asignar prioridad. | Media | Se distingue baja/media/alta/crítica. |
| RF-12 | El usuario puede marcar entregable requerido. | Media | Evento/tarea muestra descripción del entregable. |
| RF-13 | El usuario puede configurar recordatorios. | Alta | Mínimo: 10 min antes, 30 min antes, 1 h antes, día anterior. |
| RF-14 | El sistema envía Web Push de prueba. | Alta | En iPhone real se valida recepción tras instalar PWA. |
| RF-15 | El sistema envía correo de respaldo. | Media | Al menos para recordatorios importantes o críticos. |
| RF-16 | Cambios se sincronizan entre PC e iPhone. | Alta | Cambio visible en menos de 10 segundos en conexión normal. |
| RF-17 | El usuario puede leer datos básicos sin conexión. | Media | Calendario reciente abre sin internet. |
| RF-18 | El usuario puede crear/editar offline. | Media | Cambio queda en cola y sincroniza al reconectar. |
| RF-19 | El sistema prepara campos de integración externa. | Baja | Eventos/tareas tienen campos para proveedor externo futuro. |

## Requisitos no funcionales

| ID | Requisito | Prioridad |
|---|---|---:|
| RNF-01 | Diseño mobile-first para iPhone. | Alta |
| RNF-02 | Tiempo de sincronización objetivo menor a 10 segundos. | Alta |
| RNF-03 | Seguridad por usuario con RLS en Supabase/Postgres. | Alta |
| RNF-04 | No exponer service role key en frontend. | Alta |
| RNF-05 | Código TypeScript para reducir errores. | Alta |
| RNF-06 | PWA con manifest y service worker. | Alta |
| RNF-07 | Manejo explícito de zona horaria, inicialmente America/Bogota. | Alta |
| RNF-08 | Preparado para citas, disponibilidad e IA futura. | Media |
| RNF-09 | Pruebas mínimas unitarias y end-to-end. | Media |
| RNF-10 | Documentación técnica dentro del repo y del vault. | Media |

## Criterios de aceptación de Etapa 1

- [ ] Puedo registrarme con correo real y verificarlo.
- [ ] Puedo iniciar sesión en PC.
- [ ] Puedo iniciar sesión en iPhone.
- [ ] Puedo crear un evento desde PC y verlo en iPhone.
- [ ] Puedo crear una tarea desde iPhone y verla en PC.
- [ ] Puedo ver el día actual con tareas y eventos ordenados.
- [ ] Puedo marcar una tarea como completada.
- [ ] Puedo asignar prioridad alta/crítica.
- [ ] Puedo marcar si algo requiere entregable.
- [ ] Puedo recibir una notificación Web Push de prueba en iPhone.
- [ ] Puedo recibir un correo de respaldo.
- [ ] Puedo abrir la app como PWA desde pantalla de inicio.
- [ ] Puedo consultar datos recientes sin conexión.
- [ ] Puedo crear/editar offline y sincronizar al volver la conexión.

## Riesgos a validar temprano

- Web Push en iPhone real.
- Offline con edición y resolución de conflictos.
- Envío de correos de respaldo sin depender todavía de Gmail API.
- Reglas RLS correctas para que un usuario no vea datos de otro.