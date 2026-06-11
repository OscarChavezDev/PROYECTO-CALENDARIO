---
tags:
  - proyecto-personal
  - arquitectura
  - costos
  - stack
estado: verificado
fecha_creacion: 2026-06-11
ultima_revision: 2026-06-11
proyecto: "Organizador de calendario inteligente"
---

# Costos y servicios del stack

Proyecto: Organizador de calendario inteligente
Stack: Stack técnico y plan de inicio
Prompt maestro: Prompt maestro desarrollo por sprints

## Conclusión rápida

Para desarrollo y MVP personal, el proyecto puede comenzar **sin pagar**, usando planes gratuitos y herramientas open source.

Posibles costos aparecen cuando:

- se supera el free tier de Supabase;
- se publica en producción con más tráfico;
- se usa proveedor de correo transaccional más allá del límite gratuito;
- se compra dominio propio;
- se decide crear app nativa iOS y publicarla en App Store.

## Tabla de costos esperados

| Servicio / tecnología | Uso en el proyecto | ¿Pago obligatorio para empezar? | Riesgo de costo |
|---|---|---:|---|
| Node.js | Runtime/herramienta local | No | Ninguno |
| React + TypeScript + Vite | Frontend/PWA | No | Ninguno |
| Tailwind CSS | Estilos | No | Ninguno |
| React Router | Rutas frontend | No | Ninguno |
| Vitest | Pruebas unitarias | No | Ninguno |
| Playwright | Pruebas e2e locales | No | Ninguno |
| Git/GitHub | Versionado/repositorio | No para uso básico | Privado/equipo avanzado podría cambiar |
| Supabase | Auth, Postgres, RLS, Realtime, Edge Functions | No para MVP pequeño | Free tier limitado; Pro es pago |
| Supabase Edge Functions | Web Push, emails, lógica servidor | No si se mantiene dentro de cuota Free | Cobro por invocaciones extra |
| Vercel | Hosting opcional PWA | No en Hobby personal | Pro/uso avanzado pago |
| Netlify | Hosting opcional PWA | No en Free | Planes/uso avanzado pago |
| Web Push / VAPID | Notificaciones web | No | Necesita servidor/función para enviar |
| Apple Developer Program | Solo si app nativa/App Store | No para PWA | USD 99/año si app iOS nativa/App Store |
| Resend u otro email transaccional | Correos de verificación/respaldo | No para pruebas/límites bajos | Pago si supera límites |
| Dominio propio | URL bonita/producción | No para local/MVP | Pago anual si se compra dominio |
| Gmail API | Integración futura | No para MVP | Puede implicar configuración/OAuth; no bloquear Etapa 1 |

## Recomendación de costos para Etapa 1

- Empezar con herramientas gratuitas.
- No activar planes pagos sin confirmación de Oscar.
- No meter tarjeta si no es necesario.
- Usar Supabase Free para desarrollo/MVP.
- Usar hosting gratuito solo cuando haga falta probar PWA fuera de localhost.
- Para correo, empezar con lo mínimo que permita Supabase Auth y dejar correo transaccional formal para más adelante.
- No pagar Apple Developer Program porque se eligió PWA, no app nativa iOS.

## Fuentes verificadas

- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase Edge Functions Pricing](https://supabase.com/docs/guides/functions/pricing)
- [Vercel Pricing](https://vercel.com/pricing)
- [Vercel Hobby Plan](https://vercel.com/docs/plans/hobby)
- [Netlify Pricing](https://www.netlify.com/pricing/)
- [Resend Pricing](https://resend.com/pricing)
- [Resend pricing knowledge base](https://resend.com/docs/knowledge-base/what-is-resend-pricing)
- [Apple Developer Program](https://developer.apple.com/programs/)
- [Apple choosing a membership](https://developer.apple.com/support/compare-memberships/)
- [Apple Declarative Web Push, WWDC25](https://developer.apple.com/videos/play/wwdc2025/235/)
- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)