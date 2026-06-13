---
tags:
  - proyecto-personal
  - prompt
  - etapa-2
  - sprint-e2-6
  - validacion
  - qa
estado: listo-para-usar
fecha_creacion: 2026-06-13
sprint: E2-S6
---

# Prompt E2 Sprint 6 — Validación Etapa 2

Backlog: [[Proyectos personales/Organizador de calendario inteligente/04 Backlog/Backlog técnico etapa 2|Backlog técnico etapa 2]]

---

## PROMPT DIRECTO

```text
Actúa como desarrollador senior QA, especializado en pruebas de flujos completos, seguridad de datos y validación de apps mobile-first.

Vas a ejecutar SOLO el SPRINT E2-S6 — Validación Etapa 2.

RUTA DEL PROYECTO:
C:\Users\Oscar\Documents\Proyecto-Personal

APP PRINCIPAL:
C:\Users\Oscar\Documents\Proyecto-Personal\apps\calendar-pwa

REGLAS GENERALES:
- Este sprint es de validación y cierre, no de features nuevas.
- Puedes corregir bugs que encuentres, pero no implementar funcionalidad nueva.
- Al terminar: npm run build, npm run lint, npm run test, npm run test:e2e.

CONTEXTO:
- Etapa 2 completa: scheduler, disponibilidad, página pública, solicitudes, gestión de citas.
- Desplegado en Vercel (HTTPS).
- Zona horaria: America/Bogota.

OBJETIVO:
Validar que el flujo completo de Etapa 2 funciona de extremo a extremo. Verificar seguridad (no se filtra info privada). Ajustar UX donde sea necesario. Documentar bugs y mejoras para Etapa 3.

==================================================
CHECKLIST DE VALIDACIÓN
==================================================

FLUJO COMPLETO (ejecutar en orden):
1. Oscar configura disponibilidad: lunes a viernes, 9am–6pm, slots de 60 min, buffer 15 min.
2. Oscar agrega un bloqueo: mañana de 10am a 12pm.
3. Abrir `/book/[userId]` en modo incógnito (sin login).
4. Verificar que aparece el nombre de Oscar pero NO sus eventos privados ni títulos.
5. Verificar que el bloqueo del paso 2 no muestra slots disponibles.
6. Seleccionar un slot disponible. Completar formulario de solicitud.
7. Verificar que llega email/push a Oscar con los datos del solicitante.
8. Oscar confirma la cita desde `/app/bookings`.
9. Verificar que el evento aparece en el calendario de Oscar.
10. Verificar que el solicitante recibe email de confirmación (con .ics si está configurado).

PRUEBAS DE SEGURIDAD:
- [ ] La ruta pública `/book/:userId` NO revela título de eventos privados.
- [ ] La ruta pública NO revela descripción, ubicación ni prioridad de eventos.
- [ ] Un usuario no puede ver los `booking_requests` de otro usuario.
- [ ] Un usuario no puede modificar `availability_settings` de otro usuario.
- [ ] RLS: intentar INSERT/UPDATE con user_id de otro usuario falla.

PRUEBAS DE ZONA HORARIA:
- [ ] Slots generados en hora local de Colombia (America/Bogota).
- [ ] Email de confirmación muestra hora correcta para el solicitante.
- [ ] Evento creado en el calendario tiene `starts_at` correcto en UTC.

PRUEBAS MOBILE (iPhone con PWA instalada):
- [ ] `/book/:userId` usable en pantalla de iPhone (scroll, tap en slots).
- [ ] Formulario de solicitud usable en iPhone.
- [ ] `/app/bookings` usable en iPhone.

TESTS AUTOMATIZADOS:
- Verificar que todos los tests pasan: npm run test.
- Verificar que e2e no tiene regresiones: npm run test:e2e.
- Si hay tests faltantes en flujos críticos, agregarlos.

AJUSTES UX SI SE ENCUENTRAN:
- Mensajes de error claros en formularios.
- Estados de carga visibles.
- Feedback al confirmar/rechazar.
- Textos en español coherentes.

==================================================
DOCUMENTACIÓN DE CIERRE
==================================================

Crear `docs/17-validacion-etapa-2.md`:
1. Checklist de validación ejecutado con resultados.
2. Bugs encontrados y estado (corregido / pendiente).
3. Mejoras de UX aplicadas.
4. Configuraciones pendientes de Oscar (SMTP real, VAPID en prod, cron).
5. Lista de mejoras para Etapa 3 (voz, IA, pagos, múltiples usuarios).

==================================================
CRITERIOS DE ACEPTACIÓN
==================================================

- [ ] Flujo completo de reserva funciona de extremo a extremo.
- [ ] No se filtra información privada de eventos en página pública.
- [ ] RLS funciona correctamente en todas las tablas nuevas.
- [ ] Tests pasan sin regresiones.
- [ ] Documentación de cierre creada.
- [ ] npm run build, lint, test, test:e2e pasan.

FORMATO FINAL:
1. Checklist de validación con resultados (✅/❌/⚠️)
2. Bugs encontrados y correcciones aplicadas
3. Ajustes UX realizados
4. Configuraciones pendientes de Oscar
5. Lista de mejoras para Etapa 3
6. Estado final: tests + build
7. "Etapa 2 completada. ¿Iniciamos planificación de Etapa 3?"
```
