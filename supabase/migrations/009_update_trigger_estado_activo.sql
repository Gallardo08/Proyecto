-- =============================================================================
-- Actualizar trigger para crear perfiles con estado 'activo' por defecto
-- =============================================================================

-- Actualizar la función handle_new_user para crear perfiles con estado 'activo'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, rol, estado)
  VALUES (NEW.id, 'emprendedor', 'activo');
  RETURN NEW;
END;
$$;
