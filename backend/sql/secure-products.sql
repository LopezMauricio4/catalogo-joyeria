-- La escritura se realiza exclusivamente desde el backend con conexión PostgreSQL.
-- Idempotente; no modifica productos ni cuentas.
ALTER TABLE public."Product" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."Product" FROM anon, authenticated;
GRANT SELECT ON TABLE public."Product" TO anon, authenticated;
DROP POLICY IF EXISTS "alpez_public_catalog_read" ON public."Product";
CREATE POLICY "alpez_public_catalog_read" ON public."Product"
  FOR SELECT TO anon, authenticated USING (true);
