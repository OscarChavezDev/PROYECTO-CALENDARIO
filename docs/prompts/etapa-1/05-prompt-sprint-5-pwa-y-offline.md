---
tags:
  - proyecto-personal
  - prompt
  - desarrollo
  - sprint-5
  - pwa
  - offline
  - indexeddb
estado: listo-para-usar
fecha_creacion: 2026-06-12
ultima_revision: 2026-06-12
proyecto: "Organizador de calendario inteligente"
sprint: 5
---

# Prompt Sprint 5 ? PWA y offline

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
Act?a como desarrollador senior frontend especializado en PWA, service workers, IndexedDB y UX offline.

Vas a ejecutar SOLO el SPRINT 5 ? PWA y offline.

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
- Sprint 2 completo: CRUD eventos/tareas.
- Sprint 3 completo: vistas calendario.
- Sprint 4 idealmente completo: Realtime.
- Si CRUD no existe, detente; offline sin CRUD no tiene sentido.

OBJETIVO:
Convertir la app en PWA instalable y agregar soporte offline progresivo: cache de app, lectura offline b?sica y cola local de cambios para sincronizar al recuperar conexi?n.

ALCANCE:
1. Web App Manifest.
2. Iconos/metadata PWA.
3. Service worker b?sico.
4. Cache de assets para abrir la app sin conexi?n.
5. Indicador online/offline.
6. IndexedDB para eventos/tareas recientes.
7. Cola local de mutaciones offline.
8. Sincronizar cola al recuperar conexi?n.
9. Regla simple de conflicto: gana `updated_at` m?s reciente.
10. Documentaci?n de instalaci?n en iPhone.

FUERA DE ALCANCE:
- Web Push real.
- Background sync avanzado no confiable en iOS.
- Resoluci?n compleja de conflictos.
- App nativa.

DEPENDENCIAS:
Puedes usar IndexedDB nativo o instalar Dexie si mejora claridad. Si instalas Dexie, documenta el motivo. No requiere pago.

ARCHIVOS SUGERIDOS:
- public/manifest.webmanifest
- src/lib/pwa/registerServiceWorker.ts
- src/lib/offline/db.ts
- src/lib/offline/offlineQueue.ts
- src/lib/offline/syncQueue.ts
- src/lib/network/useOnlineStatus.ts
- src/components/OfflineBanner.tsx
- docs/12-sprint-5-pwa-offline.md

REGLAS:
- Cache-first para assets.
- No cachear secrets.
- No romper desarrollo local.
- Al estar offline, mostrar datos cacheados con aviso claro.
- Mutaciones offline deben incluir entity_type, operation, payload, attempts y last_error.

TESTS M?NIMOS:
- Cola agrega mutaci?n.
- Cola elimina al ?xito.
- Online/offline status renderiza.
- Resoluci?n simple elige updated_at m?s reciente.

PRUEBA MANUAL:
- Build + preview.
- Abrir app.
- Desactivar red en DevTools.
- Recargar y verificar app abre.
- Crear/editar offline si est? implementado.
- Reconectar y verificar sync.

DOCUMENTACI?N:
Crear `docs/12-sprint-5-pwa-offline.md` con qu? cachea, c?mo instalar en iPhone, c?mo probar offline y limitaciones iOS.

CRITERIOS DE ACEPTACI?N:
- Manifest existe y build lo incluye.
- Service worker registra en producci?n/preview.
- App abre sin conexi?n con assets cacheados.
- Datos recientes pueden mostrarse offline.
- Cola offline existe y tiene flujo b?sico.
- Build/lint/test/e2e pasan o bloqueo real documentado.


FORMATO FINAL OBLIGATORIO:
1. Sprint ejecutado
2. Resumen de implementaci?n
3. Archivos creados/modificados
4. Comandos ejecutados y resultados
5. Pruebas manuales sugeridas para Oscar
6. Riesgos/bloqueos
7. Pendientes para Sprint 6
8. Estado Git
9. Pregunta final: ??Confirmas que avance al Sprint 6??

No avances al Sprint 6 sin confirmaci?n.
```
