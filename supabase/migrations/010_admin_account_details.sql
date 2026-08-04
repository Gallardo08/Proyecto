-- Datos de contacto visibles solo para el propietario de la cuenta o un administrador.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nombre TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Completa las cuentas que ya existían antes de agregar las columnas.
UPDATE public.profiles AS p
SET
  nombre = COALESCE(NULLIF(trim(u.raw_user_meta_data ->> 'name'), ''), p.nombre),
  email = COALESCE(u.email, p.email)
FROM auth.users AS u
WHERE u.id = p.id;

-- Guarda nombre y correo para cada cuenta creada a partir de ahora.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, rol, estado, nombre, email)
  VALUES (
    NEW.id,
    'emprendedor',
    'activo',
    NULLIF(trim(NEW.raw_user_meta_data ->> 'name'), ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;
