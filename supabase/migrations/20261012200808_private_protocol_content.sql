-- Protocol text and delivery URLs are server-only. Public catalog/article fields
-- remain readable; public users must not retrieve private content via REST.
REVOKE SELECT ON public.protocols FROM PUBLIC, anon, authenticated;
DO $$
DECLARE columns_sql text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
    INTO columns_sql FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'protocols';
  EXECUTE format('REVOKE SELECT (%s) ON public.protocols FROM PUBLIC, anon, authenticated', columns_sql);
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
    INTO columns_sql FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'protocols'
      AND column_name NOT IN ('protocol', 'gamma_url');
  EXECUTE format('GRANT SELECT (%s) ON public.protocols TO anon, authenticated', columns_sql);
END $$;
DROP POLICY IF EXISTS "Protocols are publicly readable" ON public.protocols;
CREATE POLICY "Published previews are publicly readable" ON public.protocols
  FOR SELECT TO anon, authenticated USING (status = 'Published');
-- Service-role readers keep full access for Notion sync and WhatsApp delivery.
