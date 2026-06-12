-- ============================================================
-- Migración Sprint 4: habilitar Supabase Realtime
-- Agrega events y tasks a la publicación supabase_realtime
-- (idempotente: no falla si ya estaban agregadas)
-- Aplicar en: Supabase Dashboard → SQL Editor → pegar y ejecutar
-- ============================================================

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'events'
  ) then
    alter publication supabase_realtime add table public.events;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table public.tasks;
  end if;
end $$;
