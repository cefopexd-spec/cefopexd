-- =============================================================
-- SYSTÈME DE GESTION DE L'ÉCOLE — CeFoPExD
-- Profils et rôles, filières/matières, apprenants (matricule),
-- professeurs, circuit des inscriptions, présences, publications,
-- messages, rapports, notifications et journal des actions.
-- Script idempotent : peut être rejoué sans erreur.
-- =============================================================

-- -------------------------------------------------------------
-- 1. PARAMÈTRES (comptes du Directeur Général)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parametres (
  cle TEXT PRIMARY KEY,
  valeur TEXT NOT NULL
);
ALTER TABLE public.parametres ENABLE ROW LEVEL SECURITY;
-- Adresses e-mail Google qui reçoivent automatiquement le rôle « dg » (séparées par des virgules)
INSERT INTO public.parametres (cle, valeur) VALUES ('dg_emails', '') ON CONFLICT (cle) DO NOTHING;

-- -------------------------------------------------------------
-- 2. PROFILS (un par compte Google)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profils (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  pseudo TEXT NOT NULL UNIQUE,
  nom TEXT,
  prenom TEXT,
  date_naissance DATE,
  lieu_naissance TEXT,
  telephone TEXT,
  photo_url TEXT,
  type_demandeur TEXT CHECK (type_demandeur IN ('etudiant', 'administration', 'stage', 'emploi', 'parent', 'autre')),
  motif TEXT,
  role TEXT NOT NULL DEFAULT 'visiteur'
    CHECK (role IN ('visiteur', 'apprenant', 'parent', 'professeur', 'secretaire', 'admin', 'dg')),
  sections TEXT[],                -- rubriques de gestion ouvertes par le DG (NULL = rubriques par défaut du rôle)
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'refuse')),
  profil_complet BOOLEAN NOT NULL DEFAULT FALSE,
  valide_par UUID REFERENCES public.profils (id),
  valide_le TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profils ENABLE ROW LEVEL SECURITY;

-- Rôle effectif de l'utilisateur connecté (uniquement si son compte est validé)
CREATE OR REPLACE FUNCTION public.mon_role() RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profils WHERE id = auth.uid() AND statut = 'valide'
$$;

CREATE OR REPLACE FUNCTION public.a_role(roles TEXT[]) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(public.mon_role() = ANY (roles), FALSE)
$$;

-- Pseudo unique fabriqué à partir de l'e-mail (partie avant @)
CREATE OR REPLACE FUNCTION public.pseudo_depuis_email(mail TEXT) RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  base TEXT := lower(regexp_replace(split_part(COALESCE(mail, ''), '@', 1), '[^a-zA-Z0-9._]', '', 'g'));
  candidat TEXT;
  n INT := 1;
BEGIN
  IF length(base) < 3 THEN base := 'membre' || base; END IF;
  base := left(base, 24);
  candidat := base;
  WHILE EXISTS (SELECT 1 FROM public.profils WHERE pseudo = candidat) LOOP
    n := n + 1;
    candidat := base || n::TEXT;
  END LOOP;
  RETURN candidat;
END $$;

-- Création automatique du profil à la première connexion Google
CREATE OR REPLACE FUNCTION public.creer_profil() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  meta JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::JSONB);
  est_dg BOOLEAN;
BEGIN
  SELECT lower(NEW.email) = ANY (string_to_array(lower(replace(valeur, ' ', '')), ','))
    INTO est_dg FROM public.parametres WHERE cle = 'dg_emails';

  INSERT INTO public.profils (id, email, pseudo, prenom, nom, photo_url, role, statut)
  VALUES (
    NEW.id,
    NEW.email,
    public.pseudo_depuis_email(NEW.email),
    NULLIF(meta ->> 'given_name', ''),
    NULLIF(meta ->> 'family_name', ''),
    COALESCE(meta ->> 'avatar_url', meta ->> 'picture'),
    CASE WHEN COALESCE(est_dg, FALSE) THEN 'dg' ELSE 'visiteur' END,
    CASE WHEN COALESCE(est_dg, FALSE) THEN 'valide' ELSE 'en_attente' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created_profil ON auth.users;
CREATE TRIGGER on_auth_user_created_profil
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.creer_profil();

-- Profils des comptes déjà existants
INSERT INTO public.profils (id, email, pseudo, photo_url)
SELECT u.id, u.email, public.pseudo_depuis_email(u.email),
       COALESCE(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profils p WHERE p.id = u.id);

-- Protection : seul le DG peut changer un rôle, un statut ou les rubriques
CREATE OR REPLACE FUNCTION public.proteger_profil() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  NEW.id := OLD.id;
  NEW.email := OLD.email;
  IF auth.uid() IS NOT NULL AND NOT public.a_role(ARRAY['dg']) THEN
    NEW.role := OLD.role;
    NEW.statut := OLD.statut;
    NEW.sections := OLD.sections;
    NEW.valide_par := OLD.valide_par;
    NEW.valide_le := OLD.valide_le;
  END IF;
  IF NEW.statut = 'valide' AND OLD.statut IS DISTINCT FROM 'valide' AND auth.uid() IS NOT NULL THEN
    NEW.valide_par := auth.uid();
    NEW.valide_le := now();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS profils_proteger ON public.profils;
CREATE TRIGGER profils_proteger BEFORE UPDATE ON public.profils
  FOR EACH ROW EXECUTE FUNCTION public.proteger_profil();

DROP POLICY IF EXISTS "Profils : lecture" ON public.profils;
CREATE POLICY "Profils : lecture" ON public.profils FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.a_role(ARRAY['dg', 'admin', 'secretaire']));
DROP POLICY IF EXISTS "Profils : modification" ON public.profils;
CREATE POLICY "Profils : modification" ON public.profils FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.a_role(ARRAY['dg']))
  WITH CHECK (id = auth.uid() OR public.a_role(ARRAY['dg']));

-- -------------------------------------------------------------
-- 3. NOTIFICATIONS ET JOURNAL DES ACTIONS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinataire_id UUID NOT NULL REFERENCES public.profils (id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  message TEXT,
  lien TEXT,
  lu BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS notifications_dest_idx ON public.notifications (destinataire_id, lu);
DROP POLICY IF EXISTS "Notifications : les siennes" ON public.notifications;
CREATE POLICY "Notifications : les siennes" ON public.notifications FOR SELECT TO authenticated
  USING (destinataire_id = auth.uid());
DROP POLICY IF EXISTS "Notifications : marquer lu" ON public.notifications;
CREATE POLICY "Notifications : marquer lu" ON public.notifications FOR UPDATE TO authenticated
  USING (destinataire_id = auth.uid()) WITH CHECK (destinataire_id = auth.uid());

CREATE OR REPLACE FUNCTION public.notifier_roles(roles TEXT[], p_titre TEXT, p_message TEXT, p_lien TEXT)
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications (destinataire_id, titre, message, lien)
  SELECT id, p_titre, p_message, p_lien FROM public.profils
  WHERE role = ANY (roles) AND statut = 'valide';
$$;

CREATE OR REPLACE FUNCTION public.notifier_profil(p_id UUID, p_titre TEXT, p_message TEXT, p_lien TEXT)
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications (destinataire_id, titre, message, lien)
  SELECT p_id, p_titre, p_message, p_lien WHERE p_id IS NOT NULL;
$$;
REVOKE EXECUTE ON FUNCTION public.notifier_roles(TEXT[], TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notifier_profil(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.journal (
  id BIGSERIAL PRIMARY KEY,
  acteur_id UUID REFERENCES public.profils (id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_cible TEXT NOT NULL,
  cible_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.journal ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS journal_date_idx ON public.journal (created_at DESC);
DROP POLICY IF EXISTS "Journal : DG" ON public.journal;
CREATE POLICY "Journal : DG" ON public.journal FOR SELECT TO authenticated
  USING (public.a_role(ARRAY['dg']));

-- Journalisation automatique de toutes les modifications des tables de gestion
CREATE OR REPLACE FUNCTION public.journaliser() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ligne JSONB := to_jsonb(COALESCE(NEW, OLD));
  changements JSONB;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    SELECT jsonb_object_agg(n.key, n.value) INTO changements
    FROM jsonb_each(to_jsonb(NEW)) n
    WHERE n.key NOT IN ('updated_at') AND n.value IS DISTINCT FROM to_jsonb(OLD) -> n.key;
    IF changements IS NULL THEN RETURN NEW; END IF;
  END IF;
  INSERT INTO public.journal (acteur_id, action, table_cible, cible_id, details)
  VALUES (
    auth.uid(),
    lower(TG_OP),
    TG_TABLE_NAME,
    ligne ->> 'id',
    CASE WHEN TG_OP = 'UPDATE' THEN changements ELSE ligne END
  );
  RETURN COALESCE(NEW, OLD);
END $$;

-- -------------------------------------------------------------
-- 4. FILIÈRES ET MATIÈRES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.filieres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  duree TEXT,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.filieres ENABLE ROW LEVEL SECURITY;
INSERT INTO public.filieres (slug, nom, duree) VALUES
  ('informatique', 'Informatique appliquée', '2 ans'),
  ('mecatronique', 'Mécatronique', '2 ans'),
  ('agro-alimentaire', 'Agro-alimentaire', '18 mois'),
  ('energie-renouvelable', 'Énergie renouvelable', '18 mois'),
  ('langue-allemande', 'Langue allemande', NULL),
  ('formations-courtes', 'Formations courtes', NULL)
ON CONFLICT (slug) DO NOTHING;

DROP POLICY IF EXISTS "Filières : lecture" ON public.filieres;
CREATE POLICY "Filières : lecture" ON public.filieres FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Filières : gestion" ON public.filieres;
CREATE POLICY "Filières : gestion" ON public.filieres FOR ALL TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin'])) WITH CHECK (public.a_role(ARRAY['dg', 'admin']));

CREATE TABLE IF NOT EXISTS public.matieres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filiere_id UUID REFERENCES public.filieres (id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  coefficient NUMERIC(4, 1),
  volume_horaire INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.matieres ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Matières : lecture" ON public.matieres;
CREATE POLICY "Matières : lecture" ON public.matieres FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "Matières : gestion" ON public.matieres;
CREATE POLICY "Matières : gestion" ON public.matieres FOR ALL TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin'])) WITH CHECK (public.a_role(ARRAY['dg', 'admin']));

-- -------------------------------------------------------------
-- 5. PROFESSEURS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.professeurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profil_id UUID UNIQUE REFERENCES public.profils (id) ON DELETE SET NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  specialite TEXT,
  diplome TEXT,
  date_embauche DATE,
  dossier TEXT,                   -- notes du dossier administratif
  actif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.professeurs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Professeurs : lecture" ON public.professeurs;
CREATE POLICY "Professeurs : lecture" ON public.professeurs FOR SELECT TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire']) OR profil_id = auth.uid());
DROP POLICY IF EXISTS "Professeurs : gestion" ON public.professeurs;
CREATE POLICY "Professeurs : gestion" ON public.professeurs FOR ALL TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin'])) WITH CHECK (public.a_role(ARRAY['dg', 'admin']));

CREATE TABLE IF NOT EXISTS public.professeur_matieres (
  professeur_id UUID NOT NULL REFERENCES public.professeurs (id) ON DELETE CASCADE,
  matiere_id UUID NOT NULL REFERENCES public.matieres (id) ON DELETE CASCADE,
  PRIMARY KEY (professeur_id, matiere_id)
);
ALTER TABLE public.professeur_matieres ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Prof-matières : lecture" ON public.professeur_matieres;
CREATE POLICY "Prof-matières : lecture" ON public.professeur_matieres FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "Prof-matières : gestion" ON public.professeur_matieres;
CREATE POLICY "Prof-matières : gestion" ON public.professeur_matieres FOR ALL TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin'])) WITH CHECK (public.a_role(ARRAY['dg', 'admin']));

-- -------------------------------------------------------------
-- 6. CIRCUIT DES INSCRIPTIONS (table existante complétée)
--    en_attente -> en_traitement (secrétariat) -> transmis_admin
--    -> dossier_complet (soumis au DG) -> valide | refuse
-- -------------------------------------------------------------
ALTER TABLE public.inscriptions
  ADD COLUMN IF NOT EXISTS type_demandeur TEXT,
  ADD COLUMN IF NOT EXISTS motif TEXT,
  ADD COLUMN IF NOT EXISTS date_naissance DATE,
  ADD COLUMN IF NOT EXISTS lieu_naissance TEXT,
  ADD COLUMN IF NOT EXISTS notes_secretariat TEXT,
  ADD COLUMN IF NOT EXISTS dossier JSONB,
  ADD COLUMN IF NOT EXISTS traite_par UUID REFERENCES public.profils (id),
  ADD COLUMN IF NOT EXISTS complete_par UUID REFERENCES public.profils (id),
  ADD COLUMN IF NOT EXISTS valide_par UUID REFERENCES public.profils (id),
  ADD COLUMN IF NOT EXISTS valide_le TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS apprenant_id UUID,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.inscriptions DROP CONSTRAINT IF EXISTS inscriptions_statut_check;
ALTER TABLE public.inscriptions ADD CONSTRAINT inscriptions_statut_check
  CHECK (statut IN ('en_attente', 'en_traitement', 'transmis_admin', 'dossier_complet', 'valide', 'refuse'));

DROP POLICY IF EXISTS "Inscriptions : lecture personnel" ON public.inscriptions;
CREATE POLICY "Inscriptions : lecture personnel" ON public.inscriptions FOR SELECT TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire']));
DROP POLICY IF EXISTS "Inscriptions : traitement personnel" ON public.inscriptions;
CREATE POLICY "Inscriptions : traitement personnel" ON public.inscriptions FOR UPDATE TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire']))
  WITH CHECK (public.a_role(ARRAY['dg', 'admin', 'secretaire']));

-- Seul le DG peut valider ou refuser définitivement
CREATE OR REPLACE FUNCTION public.controler_inscription() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.statut IN ('valide', 'refuse') AND NEW.statut IS DISTINCT FROM OLD.statut
     AND auth.uid() IS NOT NULL AND NOT public.a_role(ARRAY['dg']) THEN
    RAISE EXCEPTION 'Seul le Directeur Général peut valider ou refuser une inscription.';
  END IF;
  IF NEW.statut = 'valide' AND OLD.statut IS DISTINCT FROM 'valide' THEN
    NEW.valide_par := auth.uid();
    NEW.valide_le := now();
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS inscriptions_controler ON public.inscriptions;
CREATE TRIGGER inscriptions_controler BEFORE UPDATE ON public.inscriptions
  FOR EACH ROW EXECUTE FUNCTION public.controler_inscription();

-- Notifications à chaque étape du circuit
CREATE OR REPLACE FUNCTION public.notifier_inscription() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  qui TEXT := trim(COALESCE(NEW.prenom, '') || ' ' || COALESCE(NEW.nom, ''));
  lien TEXT := '/gestion/inscriptions/' || NEW.id;
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.notifier_roles(ARRAY['secretaire', 'admin', 'dg'], 'Nouvelle pré-inscription',
      qui || ' — ' || COALESCE(NEW.filiere, ''), lien);
  ELSIF NEW.statut IS DISTINCT FROM OLD.statut THEN
    IF NEW.statut = 'transmis_admin' THEN
      PERFORM public.notifier_roles(ARRAY['admin'], 'Dossier transmis par le secrétariat', qui, lien);
    ELSIF NEW.statut = 'dossier_complet' THEN
      PERFORM public.notifier_roles(ARRAY['dg'], 'Dossier à valider', qui, lien);
    ELSIF NEW.statut IN ('valide', 'refuse') THEN
      PERFORM public.notifier_profil(NEW.user_id,
        CASE WHEN NEW.statut = 'valide' THEN 'Votre inscription est validée' ELSE 'Votre demande n''a pas été retenue' END,
        COALESCE(NEW.filiere, ''), '/mon-espace');
      PERFORM public.notifier_roles(ARRAY['secretaire', 'admin'],
        CASE WHEN NEW.statut = 'valide' THEN 'Inscription validée par le DG' ELSE 'Inscription refusée par le DG' END, qui, lien);
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS inscriptions_notifier ON public.inscriptions;
CREATE TRIGGER inscriptions_notifier AFTER INSERT OR UPDATE ON public.inscriptions
  FOR EACH ROW EXECUTE FUNCTION public.notifier_inscription();

-- -------------------------------------------------------------
-- 7. APPRENANTS (matricule automatique : CEF-AA-0001)
-- -------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.matricule_seq;

CREATE TABLE IF NOT EXISTS public.apprenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricule TEXT UNIQUE,
  profil_id UUID REFERENCES public.profils (id) ON DELETE SET NULL,
  inscription_id UUID REFERENCES public.inscriptions (id) ON DELETE SET NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  sexe TEXT CHECK (sexe IN ('F', 'M')),
  date_naissance DATE,
  lieu_naissance TEXT,
  nationalite TEXT,
  telephone TEXT,
  email TEXT,
  adresse TEXT,
  filiere_id UUID REFERENCES public.filieres (id),
  niveau_etude TEXT,
  annee_academique TEXT,
  tuteur_nom TEXT,
  tuteur_lien TEXT,
  tuteur_telephone TEXT,
  tuteur_email TEXT,
  statut TEXT NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif', 'suspendu', 'diplome', 'abandon')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.apprenants ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.attribuer_matricule() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.matricule IS NULL THEN
    NEW.matricule := 'CEF-' || to_char(now(), 'YY') || '-' || lpad(nextval('public.matricule_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS apprenants_matricule ON public.apprenants;
CREATE TRIGGER apprenants_matricule BEFORE INSERT ON public.apprenants
  FOR EACH ROW EXECUTE FUNCTION public.attribuer_matricule();

CREATE TABLE IF NOT EXISTS public.parents_apprenants (
  parent_id UUID NOT NULL REFERENCES public.profils (id) ON DELETE CASCADE,
  apprenant_id UUID NOT NULL REFERENCES public.apprenants (id) ON DELETE CASCADE,
  lien TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (parent_id, apprenant_id)
);
ALTER TABLE public.parents_apprenants ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.est_parent_de(p_apprenant UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.parents_apprenants WHERE parent_id = auth.uid() AND apprenant_id = p_apprenant)
$$;

DROP POLICY IF EXISTS "Apprenants : lecture" ON public.apprenants;
CREATE POLICY "Apprenants : lecture" ON public.apprenants FOR SELECT TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'professeur'])
         OR profil_id = auth.uid() OR public.est_parent_de(id));
DROP POLICY IF EXISTS "Apprenants : gestion" ON public.apprenants;
CREATE POLICY "Apprenants : gestion" ON public.apprenants FOR ALL TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire']))
  WITH CHECK (public.a_role(ARRAY['dg', 'admin', 'secretaire']));

DROP POLICY IF EXISTS "Parents : leurs liens" ON public.parents_apprenants;
CREATE POLICY "Parents : leurs liens" ON public.parents_apprenants FOR SELECT TO authenticated
  USING (parent_id = auth.uid() OR public.a_role(ARRAY['dg', 'admin', 'secretaire']));
DROP POLICY IF EXISTS "Parents : gestion des liens" ON public.parents_apprenants;
CREATE POLICY "Parents : gestion des liens" ON public.parents_apprenants FOR ALL TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire']))
  WITH CHECK (public.a_role(ARRAY['dg', 'admin', 'secretaire']));

-- Un parent relie son enfant en donnant matricule + date de naissance (vérification d'identité)
CREATE OR REPLACE FUNCTION public.lier_enfant(p_matricule TEXT, p_date_naissance DATE, p_lien TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  enfant public.apprenants%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Connexion requise.'; END IF;
  SELECT * INTO enfant FROM public.apprenants
  WHERE upper(matricule) = upper(trim(p_matricule)) AND date_naissance = p_date_naissance;
  IF NOT FOUND THEN
    RETURN 'introuvable';
  END IF;
  INSERT INTO public.parents_apprenants (parent_id, apprenant_id, lien)
  VALUES (auth.uid(), enfant.id, p_lien) ON CONFLICT DO NOTHING;
  RETURN enfant.prenom || ' ' || enfant.nom;
END $$;
GRANT EXECUTE ON FUNCTION public.lier_enfant(TEXT, DATE, TEXT) TO authenticated;

-- -------------------------------------------------------------
-- 8. PRÉSENCES / ABSENCES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.presences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apprenant_id UUID NOT NULL REFERENCES public.apprenants (id) ON DELETE CASCADE,
  jour DATE NOT NULL,
  statut TEXT NOT NULL CHECK (statut IN ('present', 'absent', 'retard', 'excuse')),
  heure_arrivee TIME,
  motif TEXT,
  saisi_par UUID REFERENCES public.profils (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (apprenant_id, jour)
);
ALTER TABLE public.presences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Présences : lecture" ON public.presences;
CREATE POLICY "Présences : lecture" ON public.presences FOR SELECT TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'professeur'])
         OR public.est_parent_de(apprenant_id)
         OR EXISTS (SELECT 1 FROM public.apprenants a WHERE a.id = apprenant_id AND a.profil_id = auth.uid()));
DROP POLICY IF EXISTS "Présences : saisie" ON public.presences;
CREATE POLICY "Présences : saisie" ON public.presences FOR ALL TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'professeur']))
  WITH CHECK (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'professeur']));

-- -------------------------------------------------------------
-- 9. PUBLICATIONS (site public + annonces internes)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  resume TEXT,
  contenu TEXT NOT NULL,
  categorie TEXT NOT NULL DEFAULT 'actualite'
    CHECK (categorie IN ('actualite', 'annonce', 'evenement', 'formation')),
  public BOOLEAN NOT NULL DEFAULT TRUE,          -- visible sur le site ou seulement en interne
  cible TEXT NOT NULL DEFAULT 'tous'
    CHECK (cible IN ('tous', 'apprenants', 'parents', 'professeurs', 'personnel')),
  date_evenement TIMESTAMPTZ,
  image_url TEXT,
  publie BOOLEAN NOT NULL DEFAULT TRUE,
  auteur_id UUID REFERENCES public.profils (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Publications : site public" ON public.publications;
CREATE POLICY "Publications : site public" ON public.publications FOR SELECT
  USING (publie AND public);
DROP POLICY IF EXISTS "Publications : internes" ON public.publications;
CREATE POLICY "Publications : internes" ON public.publications FOR SELECT TO authenticated
  USING (
    public.a_role(ARRAY['dg', 'admin', 'secretaire'])
    OR (publie AND (
      cible = 'tous'
      OR (cible = 'apprenants' AND public.a_role(ARRAY['apprenant']))
      OR (cible = 'parents' AND public.a_role(ARRAY['parent']))
      OR (cible = 'professeurs' AND public.a_role(ARRAY['professeur']))
      OR (cible = 'personnel' AND public.a_role(ARRAY['professeur', 'secretaire', 'admin']))
    ))
  );
DROP POLICY IF EXISTS "Publications : gestion" ON public.publications;
CREATE POLICY "Publications : gestion" ON public.publications FOR ALL TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire']))
  WITH CHECK (public.a_role(ARRAY['dg', 'admin', 'secretaire']));

-- -------------------------------------------------------------
-- 10. MESSAGES (à une personne ou à tout un groupe)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expediteur_id UUID NOT NULL REFERENCES public.profils (id) ON DELETE CASCADE,
  destinataire_id UUID REFERENCES public.profils (id) ON DELETE CASCADE,
  cible_role TEXT CHECK (cible_role IN ('apprenant', 'parent', 'professeur', 'secretaire', 'admin', 'dg', 'tous')),
  sujet TEXT NOT NULL,
  contenu TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (destinataire_id IS NOT NULL OR cible_role IS NOT NULL)
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Messages : lecture" ON public.messages;
CREATE POLICY "Messages : lecture" ON public.messages FOR SELECT TO authenticated
  USING (
    expediteur_id = auth.uid() OR destinataire_id = auth.uid()
    OR (cible_role IS NOT NULL AND (cible_role = 'tous' AND public.mon_role() IS NOT NULL OR cible_role = public.mon_role()))
    OR public.a_role(ARRAY['dg'])
  );
DROP POLICY IF EXISTS "Messages : envoi" ON public.messages;
CREATE POLICY "Messages : envoi" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    expediteur_id = auth.uid() AND public.mon_role() IS NOT NULL
    -- envoi à un groupe : réservé au personnel, sauf pour écrire au secrétariat, à l'administration ou au DG
    AND (cible_role IS NULL OR cible_role IN ('secretaire', 'admin', 'dg')
         OR public.a_role(ARRAY['dg', 'admin', 'secretaire', 'professeur']))
  );

CREATE OR REPLACE FUNCTION public.notifier_message() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.destinataire_id IS NOT NULL THEN
    PERFORM public.notifier_profil(NEW.destinataire_id, 'Nouveau message : ' || NEW.sujet, NULL, '/mon-espace/messages');
  ELSIF NEW.cible_role = 'tous' THEN
    PERFORM public.notifier_roles(ARRAY['apprenant', 'parent', 'professeur', 'secretaire', 'admin', 'dg'],
      'Nouveau message : ' || NEW.sujet, NULL, '/mon-espace/messages');
  ELSE
    PERFORM public.notifier_roles(ARRAY[NEW.cible_role], 'Nouveau message : ' || NEW.sujet, NULL, '/mon-espace/messages');
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS messages_notifier ON public.messages;
CREATE TRIGGER messages_notifier AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notifier_message();

-- -------------------------------------------------------------
-- 11. RAPPORTS (soumis au DG)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rapports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auteur_id UUID NOT NULL REFERENCES public.profils (id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  periode TEXT,
  contenu TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'soumis' CHECK (statut IN ('soumis', 'lu', 'archive')),
  commentaire_dg TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rapports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Rapports : lecture" ON public.rapports;
CREATE POLICY "Rapports : lecture" ON public.rapports FOR SELECT TO authenticated
  USING (auteur_id = auth.uid() OR public.a_role(ARRAY['dg']));
DROP POLICY IF EXISTS "Rapports : envoi" ON public.rapports;
CREATE POLICY "Rapports : envoi" ON public.rapports FOR INSERT TO authenticated
  WITH CHECK (auteur_id = auth.uid() AND public.a_role(ARRAY['admin', 'secretaire', 'professeur', 'dg']));
DROP POLICY IF EXISTS "Rapports : suivi DG" ON public.rapports;
CREATE POLICY "Rapports : suivi DG" ON public.rapports FOR UPDATE TO authenticated
  USING (public.a_role(ARRAY['dg'])) WITH CHECK (public.a_role(ARRAY['dg']));

CREATE OR REPLACE FUNCTION public.notifier_rapport() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.notifier_roles(ARRAY['dg'], 'Nouveau rapport : ' || NEW.titre, NULL, '/gestion/rapports');
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS rapports_notifier ON public.rapports;
CREATE TRIGGER rapports_notifier AFTER INSERT ON public.rapports
  FOR EACH ROW EXECUTE FUNCTION public.notifier_rapport();

-- -------------------------------------------------------------
-- 12. DEMANDES DE COMPTE : le DG et l'administration sont prévenus
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notifier_profil_complet() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.profil_complet AND NOT COALESCE(OLD.profil_complet, FALSE) AND NEW.statut = 'en_attente' THEN
    PERFORM public.notifier_roles(ARRAY['dg', 'admin'], 'Nouvelle demande de compte',
      trim(COALESCE(NEW.prenom, '') || ' ' || COALESCE(NEW.nom, '')) || ' — ' || COALESCE(NEW.type_demandeur, ''),
      '/gestion/comptes');
  END IF;
  IF NEW.statut IS DISTINCT FROM OLD.statut AND NEW.statut IN ('valide', 'refuse') THEN
    PERFORM public.notifier_profil(NEW.id,
      CASE WHEN NEW.statut = 'valide' THEN 'Votre compte est validé' ELSE 'Votre demande de compte n''a pas été retenue' END,
      NULL, '/mon-espace');
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS profils_notifier ON public.profils;
CREATE TRIGGER profils_notifier AFTER UPDATE ON public.profils
  FOR EACH ROW EXECUTE FUNCTION public.notifier_profil_complet();

-- -------------------------------------------------------------
-- 13. JOURNALISATION AUTOMATIQUE (le DG voit toutes les actions)
-- -------------------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['profils', 'inscriptions', 'apprenants', 'professeurs', 'filieres', 'matieres',
                           'presences', 'publications', 'messages', 'rapports', 'parents_apprenants'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', t || '_journal', t);
    EXECUTE format('CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON public.%I
                    FOR EACH ROW EXECUTE FUNCTION public.journaliser()', t || '_journal', t);
  END LOOP;
END $$;
