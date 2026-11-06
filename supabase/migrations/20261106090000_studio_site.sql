-- =============================================================
-- CeFoPExD — STUDIO DU SITE (constructeur de site intégré)
-- Rôle « Gestionnaire du site » (webmaster), contenu du site en
-- brouillon / publié, historique des publications, médiathèque.
-- Script idempotent : peut être rejoué sans erreur.
-- =============================================================

-- -------------------------------------------------------------
-- 1. NOUVEAU RÔLE : gestionnaire du site (webmaster)
-- -------------------------------------------------------------
ALTER TABLE public.profils DROP CONSTRAINT IF EXISTS profils_role_check;
ALTER TABLE public.profils ADD CONSTRAINT profils_role_check
  CHECK (role IN ('visiteur', 'apprenant', 'parent', 'professeur', 'secretaire', 'pedagogique', 'admin', 'webmaster', 'dg'));

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_cible_role_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_cible_role_check
  CHECK (cible_role IN ('apprenant', 'parent', 'professeur', 'secretaire', 'pedagogique', 'admin', 'webmaster', 'dg', 'tous'));

CREATE OR REPLACE FUNCTION public.est_personnel() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.a_role(ARRAY['dg', 'admin', 'secretaire', 'pedagogique', 'professeur', 'webmaster'])
$$;

-- Le gestionnaire du site consulte les inscriptions (fiches PDF)
-- et les apprenants (cartes d'étudiant, photos)
DROP POLICY IF EXISTS "Inscriptions : lecture personnel" ON public.inscriptions;
CREATE POLICY "Inscriptions : lecture personnel" ON public.inscriptions FOR SELECT TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'webmaster']));

DROP POLICY IF EXISTS "Apprenants : lecture" ON public.apprenants;
CREATE POLICY "Apprenants : lecture" ON public.apprenants FOR SELECT TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'pedagogique', 'professeur', 'webmaster'])
         OR profil_id = auth.uid() OR public.est_parent_de(id));

DROP POLICY IF EXISTS "Apprenants : gestion" ON public.apprenants;
CREATE POLICY "Apprenants : gestion" ON public.apprenants FOR ALL TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'webmaster']))
  WITH CHECK (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'webmaster']));

-- -------------------------------------------------------------
-- 2. CONTENU DU SITE : une ligne « brouillon », une ligne « publie »
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_contenu (
  id TEXT PRIMARY KEY CHECK (id IN ('brouillon', 'publie')),
  donnees JSONB NOT NULL DEFAULT '{}'::JSONB,
  maj_par UUID REFERENCES public.profils (id) ON DELETE SET NULL,
  maj_le TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_contenu ENABLE ROW LEVEL SECURITY;

-- Tout le monde lit la version publiée (c'est le site officiel) ;
-- seuls le DG et le gestionnaire du site lisent le brouillon
DROP POLICY IF EXISTS "Site : lecture" ON public.site_contenu;
CREATE POLICY "Site : lecture" ON public.site_contenu FOR SELECT
  USING (id = 'publie' OR public.a_role(ARRAY['dg', 'webmaster']));
DROP POLICY IF EXISTS "Site : création" ON public.site_contenu;
CREATE POLICY "Site : création" ON public.site_contenu FOR INSERT TO authenticated
  WITH CHECK (public.a_role(ARRAY['dg', 'webmaster']));
DROP POLICY IF EXISTS "Site : modification" ON public.site_contenu;
CREATE POLICY "Site : modification" ON public.site_contenu FOR UPDATE TO authenticated
  USING (public.a_role(ARRAY['dg', 'webmaster'])) WITH CHECK (public.a_role(ARRAY['dg', 'webmaster']));

GRANT SELECT ON public.site_contenu TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_contenu TO authenticated;

-- -------------------------------------------------------------
-- 3. HISTORIQUE DES PUBLICATIONS (retour à une version précédente)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_versions (
  id BIGSERIAL PRIMARY KEY,
  donnees JSONB NOT NULL,
  note TEXT,
  publie_par UUID REFERENCES public.profils (id) ON DELETE SET NULL,
  publie_le TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Versions : lecture" ON public.site_versions;
CREATE POLICY "Versions : lecture" ON public.site_versions FOR SELECT TO authenticated
  USING (public.a_role(ARRAY['dg', 'webmaster']));
DROP POLICY IF EXISTS "Versions : création" ON public.site_versions;
CREATE POLICY "Versions : création" ON public.site_versions FOR INSERT TO authenticated
  WITH CHECK (public.a_role(ARRAY['dg', 'webmaster']));
GRANT SELECT, INSERT ON public.site_versions TO authenticated;
GRANT USAGE ON SEQUENCE public.site_versions_id_seq TO authenticated;

-- -------------------------------------------------------------
-- 4. MÉDIATHÈQUE : images publiques du site (bucket « site »)
-- -------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('site', 'site', TRUE, 10485760,
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/x-icon', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = TRUE, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Site médias : liste" ON storage.objects;
CREATE POLICY "Site médias : liste" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'site' AND public.a_role(ARRAY['dg', 'webmaster']));
DROP POLICY IF EXISTS "Site médias : dépôt" ON storage.objects;
CREATE POLICY "Site médias : dépôt" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site' AND public.a_role(ARRAY['dg', 'webmaster']));
DROP POLICY IF EXISTS "Site médias : modification" ON storage.objects;
CREATE POLICY "Site médias : modification" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site' AND public.a_role(ARRAY['dg', 'webmaster']));
DROP POLICY IF EXISTS "Site médias : suppression" ON storage.objects;
CREATE POLICY "Site médias : suppression" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site' AND public.a_role(ARRAY['dg', 'webmaster']));
