-- =============================================================================
-- Ofertas Ocaña — Storage Bucket y Categorías Iniciales (Versión Final Limpia)
-- =============================================================================

-- -----------------------------------------------------------------------------  
-- PASO 1 — Crear Bucket para imágenes de productos
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products-images', 
  'products-images', 
  true, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------  
-- PASO 2 — Políticas de acceso para el bucket (SIN storage.object_url)
-- -----------------------------------------------------------------------------

-- Política pública de lectura para imágenes de productos
CREATE POLICY "Public Access for Product Images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'products-images'
  );

-- Política para que usuarios autenticados suban imágenes
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'products'
  );

-- Política para que dueños de productos puedan actualizar sus imágenes
CREATE POLICY "Product owners can update their images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'products-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.products p
      INNER JOIN public.businesses b ON p.business_id = b.id
      WHERE b.profile_id = auth.uid()
    )
  );

-- Política para que dueños de productos puedan eliminar sus imágenes
CREATE POLICY "Product owners can delete their images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'products-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.products p
      INNER JOIN public.businesses b ON p.business_id = b.id
      WHERE b.profile_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------  
-- PASO 3 — Poblar categorías iniciales
-- -----------------------------------------------------------------------------
INSERT INTO public.categories (nombre_categoria) VALUES
  ('Comida'),
  ('Moda'),
  ('Tecnología'),
  ('Hogar'),
  ('Belleza'),
  ('Servicios'),
  ('Artesanías'),
  ('Salud'),
  ('Deportes'),
  ('Educación'),
  ('Entretenimiento'),
  ('Otros')
ON CONFLICT (nombre_categoria) DO NOTHING;

-- -----------------------------------------------------------------------------  
-- PASO 4 — Configuraciones iniciales del sistema
-- -----------------------------------------------------------------------------
INSERT INTO public.system_settings (key, value) VALUES
  ('site_name', 'Ofertas Ocaña'),
  ('site_description', 'Plataforma para emprendedores locales de Ocaña'),
  ('contact_whatsapp', '573000000000'),
  ('max_products_per_business', '50'),
  ('product_image_max_size_mb', '5'),
  ('allow_product_creation', 'true'),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- -----------------------------------------------------------------------------  
-- PASO 5 — Verificación
-- -----------------------------------------------------------------------------
SELECT 'Bucket created successfully' as status FROM storage.buckets WHERE id = 'products-images';
SELECT COUNT(*) as categories_created FROM public.categories;
SELECT COUNT(*) as settings_created FROM public.system_settings;
