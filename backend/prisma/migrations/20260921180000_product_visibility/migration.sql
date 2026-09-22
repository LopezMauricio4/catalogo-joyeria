ALTER TABLE public."Product" ADD COLUMN "visible" BOOLEAN NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "alpez_public_catalog_read" ON public."Product";
CREATE POLICY "alpez_public_catalog_read" ON public."Product"
  FOR SELECT TO anon, authenticated USING (visible = true);
-- Restrict any additional permissive SELECT policies too.
CREATE POLICY "alpez_visible_products_only" ON public."Product"
  AS RESTRICTIVE FOR SELECT TO anon, authenticated USING (visible = true);
