-- =============================================================================
-- Cambiar el valor por defecto de estado en profiles, de pendiente a activo
-- =============================================================================

ALTER TABLE public.profiles
ALTER COLUMN estado SET DEFAULT 'activo';
