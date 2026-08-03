-- =============================================================================
-- Ofertas Ocaña — Establecer estado por defecto a 'activo'
-- =============================================================================

-- Actualizar perfiles existentes a 'activo'
UPDATE public.profiles 
SET estado = 'activo' 
WHERE estado = 'pendiente';

-- Cambiar el valor por defecto de la columna
ALTER TABLE public.profiles 
ALTER COLUMN estado SET DEFAULT 'activo';
