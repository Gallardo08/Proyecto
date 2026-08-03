-- =============================================================================
-- Ofertas Ocaña — Tokens de Recuperación de Contraseña
-- =============================================================================

-- Tabla para tokens de recuperación de contraseña
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON public.password_reset_tokens(email);

-- Política RLS: Solo lectura pública para verificación
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check reset tokens"
  ON public.password_reset_tokens FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage reset tokens"
  ON public.password_reset_tokens FOR ALL
  USING (auth.role() = 'service_role');

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION public.clean_expired_reset_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.password_reset_tokens
  WHERE expires_at < NOW()
    OR used = true;
END;
$$;

-- Ejecutar limpieza inmediata
SELECT public.clean_expired_reset_tokens();
