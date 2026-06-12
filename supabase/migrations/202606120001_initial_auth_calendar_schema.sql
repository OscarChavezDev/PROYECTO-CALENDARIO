-- ============================================================
-- Migración inicial: Organizador de calendario inteligente
-- Sprint 1 — Auth y base de datos
-- Tablas: profiles, calendars, events, tasks, reminders
-- Seguridad: RLS por usuario (user_id = auth.uid()) en todas
-- Aplicar en: Supabase Dashboard → SQL Editor → pegar y ejecutar
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Función compartida: mantener updated_at al día
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- profiles: perfil 1 a 1 con auth.users
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  timezone text not null default 'America/Bogota',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (id = (select auth.uid()));

create policy "profiles_update_own"
  on public.profiles for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- calendars
-- ------------------------------------------------------------
create table if not exists public.calendars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Personal',
  color text default '#2563eb',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Máximo un calendario default por usuario
create unique index if not exists calendars_one_default_per_user
  on public.calendars (user_id)
  where is_default = true;

create index if not exists calendars_user_id_idx on public.calendars (user_id);

alter table public.calendars enable row level security;

create policy "calendars_select_own"
  on public.calendars for select
  using (user_id = (select auth.uid()));

create policy "calendars_insert_own"
  on public.calendars for insert
  with check (user_id = (select auth.uid()));

create policy "calendars_update_own"
  on public.calendars for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "calendars_delete_own"
  on public.calendars for delete
  using (user_id = (select auth.uid()));

create trigger calendars_set_updated_at
  before update on public.calendars
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- events (con campos de integración externa futura)
-- ------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  calendar_id uuid not null references public.calendars (id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  priority text not null default 'media',
  status text not null default 'programado',
  requires_deliverable boolean not null default false,
  deliverable_description text,
  location text,
  external_provider text,
  external_calendar_id text,
  external_event_id text,
  last_external_sync_at timestamptz,
  sync_status text not null default 'local',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint events_ends_after_starts check (ends_at > starts_at),
  constraint events_priority_valid check (priority in ('baja', 'media', 'alta', 'critica')),
  constraint events_status_valid check (status in ('programado', 'completado', 'cancelado', 'pospuesto')),
  constraint events_sync_status_valid check (sync_status in ('local', 'synced', 'conflict', 'error'))
);

create index if not exists events_user_starts_idx on public.events (user_id, starts_at);
create index if not exists events_calendar_id_idx on public.events (calendar_id);

alter table public.events enable row level security;

create policy "events_select_own"
  on public.events for select
  using (user_id = (select auth.uid()));

create policy "events_insert_own"
  on public.events for insert
  with check (user_id = (select auth.uid()));

create policy "events_update_own"
  on public.events for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "events_delete_own"
  on public.events for delete
  using (user_id = (select auth.uid()));

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- tasks
-- ------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  calendar_id uuid references public.calendars (id) on delete set null,
  related_event_id uuid references public.events (id) on delete set null,
  title text not null,
  description text,
  due_at timestamptz,
  due_date date,
  priority text not null default 'media',
  status text not null default 'pendiente',
  requires_deliverable boolean not null default false,
  deliverable_description text,
  completed_at timestamptz,
  external_provider text,
  external_task_id text,
  sync_status text not null default 'local',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint tasks_priority_valid check (priority in ('baja', 'media', 'alta', 'critica')),
  constraint tasks_status_valid check (status in ('pendiente', 'en_proceso', 'completada', 'pospuesta', 'cancelada')),
  constraint tasks_sync_status_valid check (sync_status in ('local', 'synced', 'conflict', 'error')),
  -- Si existen ambas, deben representar el mismo día (coherencia due_at/due_date)
  constraint tasks_due_coherent check (
    due_at is null or due_date is null or due_date = (due_at at time zone 'America/Bogota')::date
  )
);

create index if not exists tasks_user_due_idx on public.tasks (user_id, due_at);
create index if not exists tasks_user_status_idx on public.tasks (user_id, status);

alter table public.tasks enable row level security;

create policy "tasks_select_own"
  on public.tasks for select
  using (user_id = (select auth.uid()));

create policy "tasks_insert_own"
  on public.tasks for insert
  with check (user_id = (select auth.uid()));

create policy "tasks_update_own"
  on public.tasks for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "tasks_delete_own"
  on public.tasks for delete
  using (user_id = (select auth.uid()));

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- reminders
-- ------------------------------------------------------------
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id uuid references public.events (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete cascade,
  remind_at timestamptz not null,
  channel text not null default 'push',
  status text not null default 'pending',
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reminders_channel_valid check (channel in ('push', 'email', 'both')),
  constraint reminders_status_valid check (status in ('pending', 'sent', 'failed', 'cancelled')),
  -- Exactamente uno de event_id o task_id
  constraint reminders_exactly_one_target check (num_nonnulls(event_id, task_id) = 1)
);

create index if not exists reminders_user_remind_idx on public.reminders (user_id, remind_at);
create index if not exists reminders_status_idx on public.reminders (status, remind_at);

alter table public.reminders enable row level security;

create policy "reminders_select_own"
  on public.reminders for select
  using (user_id = (select auth.uid()));

create policy "reminders_insert_own"
  on public.reminders for insert
  with check (user_id = (select auth.uid()));

create policy "reminders_update_own"
  on public.reminders for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "reminders_delete_own"
  on public.reminders for delete
  using (user_id = (select auth.uid()));

create trigger reminders_set_updated_at
  before update on public.reminders
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Trigger: crear profile automáticamente al registrarse un usuario
-- (security definer porque corre sin sesión de usuario)
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- Trigger: crear calendario default al crearse el profile
-- ------------------------------------------------------------
create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.calendars (user_id, name, is_default)
  values (new.id, 'Personal', true);
  return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_profile();
