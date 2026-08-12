-- =============================================================================
-- Reforzar verificación por correo antes de permitir acceso a emprendedores
-- =============================================================================

ALTER TABLE public.profiles
ALTER COLUMN estado SET DEFAULT 'pendiente';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, rol, estado)
  VALUES (NEW.id, 'emprendedor', 'pendiente');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles
    SET estado = 'activo', updated_at = now()
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_email_confirmed ON auth.users;
CREATE TRIGGER on_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_confirmation();

UPDATE public.profiles p
SET estado = CASE
  WHEN u.email_confirmed_at IS NULL THEN 'pendiente'::public.profile_estado
  ELSE 'activo'::public.profile_estado
END,
updated_at = now()
FROM auth.users u
WHERE p.id = u.id
  AND p.estado <> 'bloqueado';

SELECT 
  p.id,
  u.email,
  u.email_confirmed_at,
  p.estado,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN 'Email confirmado'
    ELSE 'Email no confirmado'
  END AS email_status
FROM public.profiles p
INNER JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;
