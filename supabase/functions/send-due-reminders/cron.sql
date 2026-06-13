-- ============================================================
-- Cron para enviar recordatorios vencidos cada minuto.
-- Llama a la Edge Function send-due-reminders vía pg_net.
--
-- ANTES de ejecutar:
--   1. Database → Extensions: habilitar  pg_cron  y  pg_net.
--   2. Desplegar la función send-due-reminders. "Verify JWT" en OFF (recomendado:
--      la función usa su propia auth con x-cron-secret). El cron igual manda la
--      clave publishable en el header por si quedara en ON; funciona en ambos casos.
--   3. Reemplazar <CRON_SECRET> por el valor real del secret CRON_SECRET de la función.
--      (El project ref y la clave publishable ya están puestos; la publishable es
--       pública, la misma que usa el frontend.)
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
    url     := 'https://xzjjtvmtugjiwzfyetcx.supabase.co/functions/v1/send-due-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'sb_publishable_79cbWIHnj4WSp3GLgjcLig_2G-ekI8E',
      'Authorization', 'Bearer sb_publishable_79cbWIHnj4WSp3GLgjcLig_2G-ekI8E',
      'x-cron-secret', '<CRON_SECRET>'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- Para verificar el job:      select * from cron.job;
-- Para ver las corridas:      select * from cron.job_run_details order by start_time desc limit 10;
-- Para quitarlo:              select cron.unschedule('send-due-reminders-every-minute');
