---
tags:
  - proyecto-personal
  - prompt
  - desarrollo
  - sprint-7
  - validacion
  - mvp
  - qa
estado: listo-para-usar
fecha_creacion: 2026-06-12
ultima_revision: 2026-06-12
proyecto: "Organizador de calendario inteligente"
sprint: 7
---

# Prompt Sprint 7 ? Validaci?n MVP

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
Act?a como QA lead, desarrollador senior y arquitecto de producto.

Vas a ejecutar SOLO el SPRINT 7 ? Validaci?n MVP.

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
- Sprint 1 Auth + DB implementado.
- Sprint 2 Eventos/tareas implementado.
- Sprint 3 Vistas calendario implementado.
- Sprint 4 Realtime implementado.
- Sprint 5 PWA/offline implementado.
- Sprint 6 Notificaciones implementado o documentado con bloqueo real.
- Si falta un sprint funcional, no marques MVP como completo. Documenta huecos y crea plan de cierre.

OBJETIVO:
Validar el MVP de Etapa 1, registrar bugs, corregir bloqueantes peque?os/seguros, actualizar documentaci?n y dejar una decisi?n clara: MVP aprobado, aprobado con observaciones o no aprobado.

ALCANCE:
1. Ejecutar checklist de aceptaci?n Etapa 1.
2. Ejecutar build/lint/test/e2e.
3. Probar auth.
4. Probar eventos.
5. Probar tareas.
6. Probar vistas d?a/semana/mes/hoy.
7. Probar realtime entre dos sesiones.
8. Probar PWA/instalaci?n si es posible.
9. Probar offline b?sico.
10. Probar notificaciones o documentar bloqueo real.
11. Registrar bugs.
12. Corregir bugs bloqueantes si son peque?os y seguros.
13. Actualizar README/docs.
14. Preparar mejoras para Etapa 2.

FUERA DE ALCANCE:
- Nuevas features grandes.
- Reservas/citas.
- IA.
- Google Calendar.
- Refactors grandes no necesarios.

CHECKLIST MVP:
- Registro con correo real.
- Verificaci?n de correo o flujo documentado seg?n Supabase.
- Login PC/iPhone o viewport m?vil.
- Crear evento.
- Crear tarea.
- Completar/posponer tarea.
- Prioridad alta/cr?tica.
- Entregable requerido.
- Pendientes de hoy.
- D?a/semana/mes.
- Realtime menor a 10 segundos en conexi?n normal.
- PWA instalable o bloqueo documentado.
- Offline b?sico.
- Web Push de prueba o bloqueo real.
- No hay secrets expuestos.
- RLS impide acceso entre usuarios.

PRUEBAS MANUALES M?NIMAS:
1. Crear usuario A.
2. Crear usuario B.
3. Verificar que A no ve datos de B.
4. Crear evento como A.
5. Crear tarea como A.
6. Abrir segunda sesi?n como A y validar sync.
7. Probar viewport m?vil.
8. Probar offline con DevTools.
9. Probar PWA en preview/despliegue si disponible.
10. Probar notificaci?n si secrets/HTTPS est?n listos.

BUG REPORT:
Crear `docs/14-sprint-7-validacion-mvp.md` con resultado, checklist pass/fail, bugs, riesgos, decisi?n MVP y recomendaciones Etapa 2.

CLASIFICACI?N BUGS:
- Bloqueante: impide auth, guardar datos, seguridad o build.
- Alto: rompe flujo principal con workaround.
- Medio: afecta UX/caso secundario.
- Bajo: visual/documentaci?n.

CRITERIOS MVP APROBADO:
- Build/lint/test pasan.
- Auth funciona.
- CRUD eventos/tareas funciona.
- RLS b?sico validado.
- Vistas principales funcionan.
- Realtime b?sico funciona.
- PWA/offline no bloquean uso principal.
- No hay bugs bloqueantes abiertos.

SI NO EST? LISTO:
Declara ?MVP no aprobado todav?a? y crea lista priorizada de cierre. No maquilles el resultado.

FORMATO FINAL:
1. Sprint ejecutado
2. Resultado: aprobado / aprobado con observaciones / no aprobado
3. Checklist resumido
4. Bugs encontrados
5. Bugs corregidos
6. Bugs pendientes priorizados
7. Comandos ejecutados y resultados
8. Pruebas manuales realizadas
9. Documentaci?n actualizada
10. Recomendaci?n para Etapa 2 o cierre pendiente
11. Estado Git
12. Pregunta: ??Confirmas cierre de Etapa 1 o quieres corregir pendientes primero??

No implementes Etapa 2.
```
