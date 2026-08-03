-- =============================================================================
-- Ofertas Ocaña — Tokens de Confirmación de Email
-- =============================================================================

-- Tabla para tokens de confirmación de email
CREATE TABLE IF NOT EXISTS public.email_confirmation_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_email_confirmation_tokens_token ON public.email_confirmation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_confirmation_tokens_user_id ON public.email_confirmation_tokens(user_id);

-- Política RLS: Solo lectura pública para verificación
ALTER TABLE public.email_confirmation_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check confirmation tokens"
  ON public.email_confirmation_tokens FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage confirmation tokens"
  ON public.email_confirmation_tokens FOR ALL
  USING (auth.role() = 'service_role');

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION public.clean_expired_confirmation_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.email_confirmation_tokens
  WHERE expires_at < NOW()
    OR used = true;
END;
$$;

-- Ejecutar limpieza inmediata
SELECT public.clean_expired_confirmation_tokens();
