-- =============================================================
-- CeFoPExD — ACCÈS AU STUDIO DU SITE PAR RUBRIQUE
-- Le Studio est ouvert à la Direction, au gestionnaire du site, et à
-- toute personne du personnel à qui la Direction a ouvert la rubrique
-- « Studio du site » dans Comptes & rôles (ex. un administrateur).
-- Script idempotent : peut être rejoué sans erreur.
-- =============================================================

CREATE OR REPLACE FUNCTION public.acces_studio() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.a_role(ARRAY['dg', 'webmaster'])
    OR (public.est_personnel() AND EXISTS (
      SELECT 1 FROM public.profils
      WHERE id = auth.uid() AND statut = 'valide' AND 'site' = ANY (COALESCE(sections, ARRAY[]::TEXT[]))
    ))
$$;
GRANT EXECUTE ON FUNCTION public.acces_studio() TO authenticated;

-- Contenu du site (brouillon / publié)
DROP POLICY IF EXISTS "Site : lecture" ON public.site_contenu;
CREATE POLICY "Site : lecture" ON public.site_contenu FOR SELECT
  USING (id = 'publie' OR public.acces_studio());
DROP POLICY IF EXISTS "Site : création" ON public.site_contenu;
CREATE POLICY "Site : création" ON public.site_contenu FOR INSERT TO authenticated
  WITH CHECK (public.acces_studio());
DROP POLICY IF EXISTS "Site : modification" ON public.site_contenu;
CREATE POLICY "Site : modification" ON public.site_contenu FOR UPDATE TO authenticated
  USING (public.acces_studio()) WITH CHECK (public.acces_studio());

-- Historique des publications
DROP POLICY IF EXISTS "Versions : lecture" ON public.site_versions;
CREATE POLICY "Versions : lecture" ON public.site_versions FOR SELECT TO authenticated
  USING (public.acces_studio());
DROP POLICY IF EXISTS "Versions : création" ON public.site_versions;
CREATE POLICY "Versions : création" ON public.site_versions FOR INSERT TO authenticated
  WITH CHECK (public.acces_studio());

-- Médiathèque (bucket « site »)
DROP POLICY IF EXISTS "Site médias : liste" ON storage.objects;
CREATE POLICY "Site médias : liste" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'site' AND public.acces_studio());
DROP POLICY IF EXISTS "Site médias : dépôt" ON storage.objects;
CREATE POLICY "Site médias : dépôt" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site' AND public.acces_studio());
DROP POLICY IF EXISTS "Site médias : modification" ON storage.objects;
CREATE POLICY "Site médias : modification" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site' AND public.acces_studio());
DROP POLICY IF EXISTS "Site médias : suppression" ON storage.objects;
CREATE POLICY "Site médias : suppression" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site' AND public.acces_studio());
