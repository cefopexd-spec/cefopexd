-- Pré-inscriptions rattachées au compte (connexion Google via Supabase Auth)
-- Chaque demande appartient à l'utilisateur connecté qui l'a envoyée ;
-- il peut la retrouver dans « Mon espace ». Script idempotent.

ALTER TABLE public.inscriptions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS inscriptions_user_id_idx ON public.inscriptions (user_id);

-- L'insertion publique (sans compte) n'est plus autorisée
DROP POLICY IF EXISTS "Allow public insert inscriptions" ON public.inscriptions;

-- Un utilisateur connecté peut créer ses propres pré-inscriptions…
DROP POLICY IF EXISTS "Inscriptions : insertion par le titulaire" ON public.inscriptions;
CREATE POLICY "Inscriptions : insertion par le titulaire"
  ON public.inscriptions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- … et consulter uniquement les siennes
DROP POLICY IF EXISTS "Inscriptions : lecture par le titulaire" ON public.inscriptions;
CREATE POLICY "Inscriptions : lecture par le titulaire"
  ON public.inscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
