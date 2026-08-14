-- =============================================================================
-- Eliminación automática de productos expirados (más de 8 días)
-- Utiliza pg_cron para ejecutar la limpieza diariamente
-- =============================================================================

-- Habilitar la extensión pg_cron si no está habilitada
-- Nota: En Supabase, pg_cron ya está disponible pero se necesita habilitar por base de datos
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Crear función para eliminar productos expirados
CREATE OR REPLACE FUNCTION public.delete_expired_products()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Eliminar productos con más de 8 días de antigüedad
  DELETE FROM public.products
  WHERE fecha_publicacion < now() - interval '8 days';
  
  -- Log opcional para monitoreo (puedes descomentar si necesitas auditoría)
  -- INSERT INTO public.system_settings (key, value, updated_at)
  -- VALUES ('last_expired_cleanup', now()::text, now())
  -- ON CONFLICT (key) DO UPDATE SET value = now()::text, updated_at = now();
END;
$$;

-- Programar la ejecución diaria a las 3:00 AM (hora UTC)
-- El formato de cron es: minuto hora día-mes mes día-semana
-- 0 3 * * * significa: minuto 0, hora 3, todos los días, todos los meses, todos los días de la semana
SELECT cron.schedule(
  'delete_expired_products_daily',
  '0 3 * * *',
  $$SELECT public.delete_expired_products();$$
);

-- Verificar que el job fue programado correctamente
SELECT * FROM cron.job WHERE jobname = 'delete_expired_products_daily';
