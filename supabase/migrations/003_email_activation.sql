-- =============================================================================
-- Ofertas Ocaña — Activación por Confirmación de Email
-- =============================================================================

-- Trigger para activar usuario cuando confirma email
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Cuando el usuario confirma su email, activar su perfil
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles 
    SET estado = 'activo', updated_at = now()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger para email confirmation
CREATE TRIGGER on_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_confirmation();

-- Activar usuarios que ya confirmaron su email
UPDATE public.profiles 
SET estado = 'activo' 
FROM auth.users u
WHERE profiles.id = u.id 
  AND u.email_confirmed_at IS NOT NULL 
  AND profiles.estado = 'pendiente';

-- Verificar resultado
SELECT 
  p.id,
  u.email,
  u.email_confirmed_at,
  p.estado,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN 'Email confirmado'
    ELSE 'Email no confirmado'
  END as email_status
FROM public.profiles p
INNER JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;
