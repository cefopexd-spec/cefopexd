-- =============================================================
-- CeFoPExD — ORGANIGRAMME DU CENTRE
-- Rôles classés par famille : Direction, Administration & services,
-- Corps enseignant, Apprenants & familles, Public.
-- Nouveaux rôles : Président Fondateur, Surveillant général,
-- Comptabilité / caisse, Candidat (nouvel inscrit).
-- Accès principal permanent (technique, hors organigramme) : centrecefopexd@gmail.com.
-- Paiements et reçus. Script idempotent : peut être rejoué sans erreur.
-- =============================================================

-- -------------------------------------------------------------
-- 1. RÔLES AUTORISÉS
-- -------------------------------------------------------------
ALTER TABLE public.profils DROP CONSTRAINT IF EXISTS profils_role_check;
ALTER TABLE public.profils ADD CONSTRAINT profils_role_check CHECK (role IN (
  'visiteur', 'candidat', 'apprenant', 'parent', 'professeur',
  'surveillant', 'comptable', 'secretaire', 'webmaster', 'admin', 'pedagogique', 'dg', 'fondateur', 'principal'));

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_cible_role_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_cible_role_check CHECK (cible_role IN (
  'apprenant', 'parent', 'professeur', 'surveillant', 'comptable', 'secretaire', 'webmaster',
  'admin', 'pedagogique', 'dg', 'fondateur', 'principal', 'tous'));

-- Titre affiché (ex. « Président Fondateur »), modifiable par chacun dans son profil
ALTER TABLE public.profils ADD COLUMN IF NOT EXISTS fonction TEXT;

-- -------------------------------------------------------------
-- 2. LE PRÉSIDENT FONDATEUR ET L'ACCÈS PRINCIPAL ONT TOUS LES DROITS
--    DE LA DIRECTION (partout où « dg » est autorisé, ils le sont aussi)
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.a_role(roles TEXT[]) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    public.mon_role() = ANY (roles)
    OR (public.mon_role() IN ('fondateur', 'principal') AND 'dg' = ANY (roles)),
    FALSE)
$$;

CREATE OR REPLACE FUNCTION public.notifier_roles(roles TEXT[], p_titre TEXT, p_message TEXT, p_lien TEXT)
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications (destinataire_id, titre, message, lien)
  SELECT id, p_titre, p_message, p_lien FROM public.profils
  WHERE statut = 'valide'
    AND (role = ANY (roles) OR (role = 'fondateur' AND 'dg' = ANY (roles)));
$$;
REVOKE EXECUTE ON FUNCTION public.notifier_roles(TEXT[], TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.est_personnel() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.a_role(ARRAY['dg', 'admin', 'secretaire', 'pedagogique', 'professeur', 'webmaster', 'surveillant', 'comptable'])
$$;

-- -------------------------------------------------------------
-- 3. ADRESSES D'ACCÈS
--    emails_principaux : accès total permanent (technique, non modifiable depuis le site)
--    dg_emails         : adresses de la Direction (gérées par la Direction dans « Comptes & rôles »)
-- -------------------------------------------------------------
INSERT INTO public.parametres (cle, valeur) VALUES ('emails_principaux', 'centrecefopexd@gmail.com')
ON CONFLICT (cle) DO UPDATE SET valeur = CASE
  WHEN position('centrecefopexd@gmail.com' IN lower(public.parametres.valeur)) > 0 THEN public.parametres.valeur
  WHEN trim(public.parametres.valeur) = '' THEN 'centrecefopexd@gmail.com'
  ELSE public.parametres.valeur || ',centrecefopexd@gmail.com' END;
INSERT INTO public.parametres (cle, valeur) VALUES ('dg_emails', '') ON CONFLICT (cle) DO NOTHING;

CREATE OR REPLACE FUNCTION public.email_dans(p_cle TEXT, p_email TEXT) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT lower(p_email) = ANY (string_to_array(lower(replace(valeur, ' ', '')), ','))
                   FROM public.parametres WHERE cle = p_cle), FALSE)
$$;

-- À la première connexion : accès principal, Président Fondateur (adresses de la Direction) ou visiteur
CREATE OR REPLACE FUNCTION public.creer_profil() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  meta JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::JSONB);
  r TEXT := CASE
    WHEN public.email_dans('emails_principaux', NEW.email) THEN 'principal'
    WHEN public.email_dans('dg_emails', NEW.email) THEN 'fondateur'
    ELSE 'visiteur' END;
BEGIN
  INSERT INTO public.profils (id, email, pseudo, prenom, nom, photo_url, role, statut, fonction)
  VALUES (
    NEW.id,
    NEW.email,
    public.pseudo_depuis_email(NEW.email),
    NULLIF(meta ->> 'given_name', ''),
    NULLIF(meta ->> 'family_name', ''),
    COALESCE(meta ->> 'avatar_url', meta ->> 'picture'),
    r,
    CASE WHEN r = 'visiteur' THEN 'en_attente' ELSE 'valide' END,
    CASE WHEN r = 'fondateur' THEN 'Président Fondateur' WHEN r = 'principal' THEN 'Accès principal' ELSE NULL END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

-- Compte déjà existant avec l'adresse permanente
UPDATE public.profils
SET role = 'principal', statut = 'valide', fonction = COALESCE(fonction, 'Accès principal')
WHERE public.email_dans('emails_principaux', email);

-- -------------------------------------------------------------
-- 4. PROTECTION DES PROFILS
--    - rôle, statut et rubriques : seule la Direction les change ;
--    - un visiteur devient automatiquement « candidat » en se pré-inscrivant ;
--    - l'e-mail ne change que par le serveur (changement d'adresse vérifié).
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.proteger_profil() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  NEW.id := OLD.id;
  IF auth.uid() IS NOT NULL THEN
    NEW.email := OLD.email;
  END IF;
  IF auth.uid() IS NOT NULL AND NOT public.a_role(ARRAY['dg']) THEN
    IF NOT (OLD.role = 'visiteur' AND NEW.role = 'candidat') THEN
      NEW.role := OLD.role;
    END IF;
    NEW.statut := OLD.statut;
    NEW.sections := OLD.sections;
    NEW.valide_par := OLD.valide_par;
    NEW.valide_le := OLD.valide_le;
  END IF;
  -- Seuls le Président Fondateur et l'accès principal nomment un Président Fondateur ;
  -- l'accès principal ne peut être donné ou retiré que par un accès principal
  IF auth.uid() IS NOT NULL AND NEW.role IS DISTINCT FROM OLD.role THEN
    IF (NEW.role = 'principal' OR OLD.role = 'principal') AND public.mon_role() IS DISTINCT FROM 'principal' THEN
      NEW.role := OLD.role;
      NEW.statut := OLD.statut;
    ELSIF NEW.role = 'fondateur' AND public.mon_role() NOT IN ('fondateur', 'principal') THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  -- Le compte d'accès principal reste toujours validé
  IF OLD.role = 'principal' AND public.mon_role() IS DISTINCT FROM 'principal' AND auth.uid() IS NOT NULL THEN
    NEW.statut := OLD.statut;
  END IF;
  IF NEW.statut = 'valide' AND OLD.statut IS DISTINCT FROM 'valide' AND auth.uid() IS NOT NULL THEN
    NEW.valide_par := auth.uid();
    NEW.valide_le := now();
  END IF;
  RETURN NEW;
END $$;

-- La pré-inscription fait passer le visiteur en « candidat »
CREATE OR REPLACE FUNCTION public.marquer_candidat() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    UPDATE public.profils SET role = 'candidat' WHERE id = NEW.user_id AND role = 'visiteur';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS inscriptions_candidat ON public.inscriptions;
CREATE TRIGGER inscriptions_candidat AFTER INSERT ON public.inscriptions
  FOR EACH ROW EXECUTE FUNCTION public.marquer_candidat();

-- Visiteurs ayant déjà déposé une pré-inscription
UPDATE public.profils p SET role = 'candidat'
WHERE p.role = 'visiteur' AND EXISTS (SELECT 1 FROM public.inscriptions i WHERE i.user_id = p.id);

-- -------------------------------------------------------------
-- 5. DROITS DES NOUVEAUX RÔLES
-- -------------------------------------------------------------
-- Profils : la Direction, l'administration et le secrétariat voient tous les comptes
DROP POLICY IF EXISTS "Profils : lecture" ON public.profils;
CREATE POLICY "Profils : lecture" ON public.profils FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.a_role(ARRAY['dg', 'admin', 'secretaire']));

-- Apprenants : consultés par tout le personnel concerné
DROP POLICY IF EXISTS "Apprenants : lecture" ON public.apprenants;
CREATE POLICY "Apprenants : lecture" ON public.apprenants FOR SELECT TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'pedagogique', 'professeur', 'webmaster', 'surveillant', 'comptable'])
         OR profil_id = auth.uid() OR public.est_parent_de(id));

-- Présences : le surveillant général fait aussi l'appel
DROP POLICY IF EXISTS "Présences : lecture" ON public.presences;
CREATE POLICY "Présences : lecture" ON public.presences FOR SELECT TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'pedagogique', 'professeur', 'surveillant'])
         OR EXISTS (SELECT 1 FROM public.apprenants a WHERE a.id = apprenant_id AND (a.profil_id = auth.uid() OR public.est_parent_de(a.id))));
DROP POLICY IF EXISTS "Présences : saisie" ON public.presences;
CREATE POLICY "Présences : saisie" ON public.presences FOR ALL TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'pedagogique', 'professeur', 'surveillant']))
  WITH CHECK (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'pedagogique', 'professeur', 'surveillant']));

-- Permissions, absences et retards : traités aussi par le surveillant général
DROP POLICY IF EXISTS "Demandes : lecture" ON public.demandes;
CREATE POLICY "Demandes : lecture" ON public.demandes FOR SELECT TO authenticated
  USING (demandeur_id = auth.uid() OR public.a_role(ARRAY['dg', 'admin', 'secretaire', 'pedagogique', 'surveillant']));
DROP POLICY IF EXISTS "Demandes : traitement" ON public.demandes;
CREATE POLICY "Demandes : traitement" ON public.demandes FOR UPDATE TO authenticated
  USING (public.a_role(ARRAY['dg', 'secretaire', 'surveillant']))
  WITH CHECK (public.a_role(ARRAY['dg', 'secretaire', 'surveillant']));

-- Rapports : tout le personnel peut en soumettre à la Direction
DROP POLICY IF EXISTS "Rapports : envoi" ON public.rapports;
CREATE POLICY "Rapports : envoi" ON public.rapports FOR INSERT TO authenticated
  WITH CHECK (auteur_id = auth.uid() AND public.est_personnel());

-- -------------------------------------------------------------
-- 6. PAIEMENTS ET REÇUS (comptabilité / caisse)
-- -------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.recu_seq;

CREATE TABLE IF NOT EXISTS public.paiements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE,
  apprenant_id UUID NOT NULL REFERENCES public.apprenants (id) ON DELETE CASCADE,
  montant NUMERIC(12, 0) NOT NULL CHECK (montant > 0),
  motif TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'especes' CHECK (mode IN ('especes', 'mobile_money', 'virement', 'cheque', 'autre')),
  reference TEXT,
  date_paiement DATE NOT NULL DEFAULT CURRENT_DATE,
  annee_academique TEXT,
  observations TEXT,
  annule BOOLEAN NOT NULL DEFAULT FALSE,
  motif_annulation TEXT,
  enregistre_par UUID DEFAULT auth.uid() REFERENCES public.profils (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.paiements ENABLE ROW LEVEL SECURITY;

-- Numéro de reçu automatique : REC-AA-00001
CREATE OR REPLACE FUNCTION public.numeroter_recu() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.numero IS NULL THEN
    NEW.numero := 'REC-' || to_char(now(), 'YY') || '-' || lpad(nextval('public.recu_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS paiements_numero ON public.paiements;
CREATE TRIGGER paiements_numero BEFORE INSERT ON public.paiements
  FOR EACH ROW EXECUTE FUNCTION public.numeroter_recu();

DROP POLICY IF EXISTS "Paiements : lecture" ON public.paiements;
CREATE POLICY "Paiements : lecture" ON public.paiements FOR SELECT TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'comptable', 'secretaire'])
         OR EXISTS (SELECT 1 FROM public.apprenants a WHERE a.id = apprenant_id AND (a.profil_id = auth.uid() OR public.est_parent_de(a.id))));
DROP POLICY IF EXISTS "Paiements : saisie" ON public.paiements;
CREATE POLICY "Paiements : saisie" ON public.paiements FOR INSERT TO authenticated
  WITH CHECK (public.a_role(ARRAY['dg', 'admin', 'comptable']));
-- Un reçu n'est jamais supprimé : il est annulé (avec motif)
DROP POLICY IF EXISTS "Paiements : annulation" ON public.paiements;
CREATE POLICY "Paiements : annulation" ON public.paiements FOR UPDATE TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'comptable']))
  WITH CHECK (public.a_role(ARRAY['dg', 'admin', 'comptable']));

GRANT SELECT, INSERT, UPDATE ON public.paiements TO authenticated;
GRANT USAGE ON SEQUENCE public.recu_seq TO authenticated;

-- Journal des actions (comme les autres tables de gestion)
DROP TRIGGER IF EXISTS paiements_journal ON public.paiements;
CREATE TRIGGER paiements_journal AFTER INSERT OR UPDATE OR DELETE ON public.paiements
  FOR EACH ROW EXECUTE FUNCTION public.journaliser();

-- -------------------------------------------------------------
-- 7. ANNONCES « À TOUT LE MONDE » : tous les rôles de l'organigramme sont avertis
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notifier_message() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.destinataire_id IS NOT NULL THEN
    PERFORM public.notifier_profil(NEW.destinataire_id, 'Nouveau message : ' || NEW.sujet, NULL, '/mon-espace/messages');
  ELSIF NEW.cible_role = 'tous' THEN
    PERFORM public.notifier_roles(ARRAY['apprenant', 'parent', 'professeur', 'surveillant', 'comptable', 'secretaire',
      'webmaster', 'admin', 'pedagogique', 'dg'], 'Nouveau message : ' || NEW.sujet, NULL, '/mon-espace/messages');
  ELSE
    PERFORM public.notifier_roles(ARRAY[NEW.cible_role], 'Nouveau message : ' || NEW.sujet, NULL, '/mon-espace/messages');
  END IF;
  RETURN NEW;
END $$;

-- -------------------------------------------------------------
-- 8. CHANGEMENT D'ADRESSE E-MAIL : une fois la nouvelle adresse confirmée,
--    le profil reprend automatiquement la nouvelle adresse
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.synchroniser_email() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email AND NEW.email IS NOT NULL THEN
    UPDATE public.profils SET email = NEW.email WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS on_auth_user_email_change ON auth.users;
CREATE TRIGGER on_auth_user_email_change AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.synchroniser_email();
