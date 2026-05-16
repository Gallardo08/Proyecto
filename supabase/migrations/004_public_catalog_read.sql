-- =============================================================================
-- Ofertas Ocana - Lectura publica del catalogo
-- =============================================================================
-- El catalogo principal debe poder listar productos vigentes de cualquier
-- emprendedor. Sin estas politicas, RLS puede devolver 0 productos al usuario
-- anonimo, o solo los productos propios cuando hay una sesion iniciada.

DROP POLICY IF EXISTS "businesses_public_read_active" ON public.businesses;
CREATE POLICY "businesses_public_read_catalog"
  ON public.businesses FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "products_public_read_vigentes_activos" ON public.products;
CREATE POLICY "products_public_read_vigentes"
  ON public.products FOR SELECT
  USING (estado_vigencia = 'vigente');

