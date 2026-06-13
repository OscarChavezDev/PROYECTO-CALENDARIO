-- ============================================================
-- Hardening Sprint 7: política RLS de UPDATE para push_subscriptions
-- (V-05 de la auditoría de seguridad)
-- Antes solo había select/insert/delete; sin UPDATE el frontend no puede
-- actualizar sus propias suscripciones. Se agrega explícita y restrictiva.
-- Aplicar en: Supabase Dashboard → SQL Editor → pegar y ejecutar
-- ============================================================

drop policy if exists "push_subs_update_own" on public.push_subscriptions;

create policy "push_subs_update_own"
  on public.push_subscriptions for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
