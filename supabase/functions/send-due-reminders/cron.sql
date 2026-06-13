-- ============================================================
-- Cron para enviar recordatorios vencidos cada minuto.
-- Llama a la Edge Function send-due-reminders vía pg_net.
--
-- ANTES de ejecutar:
--   1. Database → Extensions: habilitar  pg_cron  y  pg_net.
--   2. Desplegar la función con Verify JWT OFF:
--        supabase functions deploy send-due-reminders --no-verify-jwt
--      (o en el Dashboard, desactivar "Verify JWT" para esa función).
--   3. Reemplazar <PROJECT_REF> y <CRON_SECRET> abajo por tus valores reales.
--      <CRON_SECRET> debe coincidir con el secret CRON_SECRET de la función.
--
-- Ejecutar este bloque en SQL Editor.
-- ============================================================

-- Quita el job anterior si ya existía (idempotente)
select cron.unschedule('send-due-reminders-every-minute')
where exists (
  select 1 from cron.job where jobname = 'send-due-reminders-every-minute'
);

select cron.schedule(
  'send-due-reminders-every-minute',
  '* * * * *',  -- cada minuto
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-due-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', '<CRON_SECRET>'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- Para verificar:  select * from cron.job;
-- Para ver corridas:  select * from cron.job_run_details order by start_time desc limit 10;
-- Para quitarlo:   select cron.unschedule('send-due-reminders-every-minute');
