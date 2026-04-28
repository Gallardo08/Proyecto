-- =============================================================================
-- Ofertas Ocaña — Esquema + RLS + trigger de registro
-- Referencia: ejecutar en Supabase SQL Editor o con CLI `supabase db push`
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PASO 1 — DDL (Tipos y tablas)
-- -----------------------------------------------------------------------------

CREATE TYPE public.user_role AS ENUM ('admin', 'emprendedor');
CREATE TYPE public.profile_estado AS ENUM ('activo', 'bloqueado', 'pendiente');
CREATE TYPE public.product_estado_vigencia AS ENUM ('vigente', 'expirado');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  rol public.user_role NOT NULL DEFAULT 'emprendedor',
  estado public.profile_estado NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_rol ON public.profiles (rol);
CREATE INDEX idx_profiles_estado ON public.profiles (estado);

CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
  nombre_negocio TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  ubicacion TEXT,
  descripcion TEXT,
  foto_perfil_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_whatsapp_not_blank CHECK (length(trim(whatsapp)) > 0),
  CONSTRAINT chk_nombre_negocio_not_blank CHECK (length(trim(nombre_negocio)) > 0)
);

CREATE INDEX idx_businesses_profile_id ON public.businesses (profile_id);

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_categoria TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_nombre_categoria_not_blank CHECK (length(trim(nombre_categoria)) > 0)
);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories (id) ON DELETE RESTRICT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC(12, 2) NOT NULL CHECK (precio >= 0),
  descuento NUMERIC(5, 2) CHECK (descuento IS NULL OR (descuento >= 0 AND descuento <= 100)),
  imagen_url TEXT,
  fecha_publicacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado_vigencia public.product_estado_vigencia NOT NULL DEFAULT 'vigente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_nombre_producto CHECK (length(trim(nombre)) > 0)
);

CREATE INDEX idx_products_business ON public.products (business_id);
CREATE INDEX idx_products_category ON public.products (category_id);
CREATE INDEX idx_products_vigencia_pub ON public.products (estado_vigencia, fecha_publicacion DESC);

CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tr_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tr_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tr_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- PASO 2 — RLS + funciones + políticas + trigger auth
-- -----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.rol = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.owns_business(b_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = b_id AND b.profile_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.owns_business(UUID) TO authenticated;

-- --- profiles: solo lectura propia o admin; sin INSERT manual (lo crea el trigger) ---
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_no_insert_clients"
  ON public.profiles FOR INSERT
  WITH CHECK (false);

CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- Impide que un no-admin cambie su rol (is_admin() evalúa el rol actual en BD)
-- Bloquea que un emprendedor se ponga admin desde la API.
-- Permite: (1) un admin ya existente, (2) service_role, (3) SQL Editor sin claim `sub` (bootstrap).
CREATE OR REPLACE FUNCTION public.enforce_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_sub text;
BEGIN
  IF NEW.rol IS DISTINCT FROM OLD.rol THEN
    IF public.is_admin() THEN
      RETURN NEW;
    END IF;
    IF coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role' THEN
      RETURN NEW;
    END IF;
    jwt_sub := nullif(trim(coalesce(current_setting('request.jwt.claim.sub', true), '')), '');
    IF jwt_sub IS NULL THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Solo los administradores pueden cambiar el rol';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_profiles_role_guard
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_role_change();

-- --- businesses ---
CREATE POLICY "businesses_public_read_active"
  ON public.businesses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = profile_id AND p.estado = 'activo'
    )
  );

CREATE POLICY "businesses_owner_read_own"
  ON public.businesses FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "businesses_owner_insert"
  ON public.businesses FOR INSERT
  WITH CHECK (
    profile_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles pr WHERE pr.id = auth.uid() AND pr.rol = 'emprendedor')
  );

CREATE POLICY "businesses_owner_update"
  ON public.businesses FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "businesses_owner_delete"
  ON public.businesses FOR DELETE
  USING (profile_id = auth.uid());

CREATE POLICY "businesses_admin_all"
  ON public.businesses FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- --- categories ---
CREATE POLICY "categories_public_read"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "categories_admin_write"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- --- products ---
CREATE POLICY "products_public_read_vigentes_activos"
  ON public.products FOR SELECT
  USING (
    estado_vigencia = 'vigente'
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      INNER JOIN public.profiles p ON p.id = b.profile_id
      WHERE b.id = business_id AND p.estado = 'activo'
    )
  );

CREATE POLICY "products_owner_read_own"
  ON public.products FOR SELECT
  USING (public.owns_business(business_id));

CREATE POLICY "products_owner_insert"
  ON public.products FOR INSERT
  WITH CHECK (public.owns_business(business_id));

CREATE POLICY "products_owner_update"
  ON public.products FOR UPDATE
  USING (public.owns_business(business_id))
  WITH CHECK (public.owns_business(business_id));

CREATE POLICY "products_owner_delete"
  ON public.products FOR DELETE
  USING (public.owns_business(business_id));

CREATE POLICY "products_admin_all"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- --- system_settings ---
CREATE POLICY "system_settings_public_read"
  ON public.system_settings FOR SELECT
  USING (true);

CREATE POLICY "system_settings_admin_write"
  ON public.system_settings FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "system_settings_admin_update"
  ON public.system_settings FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "system_settings_admin_delete"
  ON public.system_settings FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- Trigger: al registrarse en auth.users → crear fila en profiles
-- -----------------------------------------------------------------------------
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
