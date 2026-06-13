-- ============================================================
-- Migración Sprint 6: suscripciones Web Push
-- Tabla push_subscriptions con RLS por usuario
-- Aplicar en: Supabase Dashboard → SQL Editor → pegar y ejecutar
-- ============================================================

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

-- Una suscripción por endpoint y usuario (re-suscribir no duplica)
create unique index if not exists push_subscriptions_user_endpoint
  on public.push_subscriptions (user_id, endpoint);

alter table public.push_subscriptions enable row level security;

create policy "push_subs_select_own"
  on public.push_subscriptions for select
  using (user_id = (select auth.uid()));

create policy "push_subs_insert_own"
  on public.push_subscriptions for insert
  with check (user_id = (select auth.uid()));

create policy "push_subs_delete_own"
  on public.push_subscriptions for delete
  using (user_id = (select auth.uid()));
