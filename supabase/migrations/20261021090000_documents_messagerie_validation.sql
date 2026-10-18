-- =============================================================
-- CeFoPExD — Photos & documents, gestionnaire pédagogique,
-- validation des publications par le DG, demandes (permissions,
-- absences, retards), messagerie interne en direct, statistiques,
-- recherche globale et notifications du DG. Script idempotent.
-- =============================================================

-- -------------------------------------------------------------
-- 1. NOUVEAU RÔLE : gestionnaire pédagogique
-- -------------------------------------------------------------
ALTER TABLE public.profils DROP CONSTRAINT IF EXISTS profils_role_check;
ALTER TABLE public.profils ADD CONSTRAINT profils_role_check
  CHECK (role IN ('visiteur', 'apprenant', 'parent', 'professeur', 'secretaire', 'pedagogique', 'admin', 'dg'));

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_cible_role_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_cible_role_check
  CHECK (cible_role IN ('apprenant', 'parent', 'professeur', 'secretaire', 'pedagogique', 'admin', 'dg', 'tous'));

-- Personnel (accès à l'espace de gestion)
CREATE OR REPLACE FUNCTION public.est_personnel() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.a_role(ARRAY['dg', 'admin', 'secretaire', 'pedagogique', 'professeur'])
$$;

-- Le gestionnaire pédagogique rejoint les règles des apprenants, présences, professeurs, matières, rapports
DROP POLICY IF EXISTS "Apprenants : lecture" ON public.apprenants;
CREATE POLICY "Apprenants : lecture" ON public.apprenants FOR SELECT TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'pedagogique', 'professeur'])
         OR profil_id = auth.uid() OR public.est_parent_de(id));
DROP POLICY IF EXISTS "Présences : lecture" ON public.presences;
CREATE POLICY "Présences : lecture" ON public.presences FOR SELECT TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'pedagogique', 'professeur'])
         OR public.est_parent_de(apprenant_id)
         OR EXISTS (SELECT 1 FROM public.apprenants a WHERE a.id = apprenant_id AND a.profil_id = auth.uid()));
DROP POLICY IF EXISTS "Présences : saisie" ON public.presences;
CREATE POLICY "Présences : saisie" ON public.presences FOR ALL TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'pedagogique', 'professeur']))
  WITH CHECK (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'pedagogique', 'professeur']));
DROP POLICY IF EXISTS "Professeurs : lecture" ON public.professeurs;
CREATE POLICY "Professeurs : lecture" ON public.professeurs FOR SELECT TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'pedagogique']) OR profil_id = auth.uid());
DROP POLICY IF EXISTS "Professeurs : gestion" ON public.professeurs;
CREATE POLICY "Professeurs : gestion" ON public.professeurs FOR ALL TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'pedagogique'])) WITH CHECK (public.a_role(ARRAY['dg', 'admin', 'pedagogique']));
DROP POLICY IF EXISTS "Prof-matières : gestion" ON public.professeur_matieres;
CREATE POLICY "Prof-matières : gestion" ON public.professeur_matieres FOR ALL TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'pedagogique'])) WITH CHECK (public.a_role(ARRAY['dg', 'admin', 'pedagogique']));
DROP POLICY IF EXISTS "Matières : gestion" ON public.matieres;
CREATE POLICY "Matières : gestion" ON public.matieres FOR ALL TO authenticated
  USING (public.a_role(ARRAY['dg', 'admin', 'pedagogique'])) WITH CHECK (public.a_role(ARRAY['dg', 'admin', 'pedagogique']));
DROP POLICY IF EXISTS "Rapports : envoi" ON public.rapports;
CREATE POLICY "Rapports : envoi" ON public.rapports FOR INSERT TO authenticated
  WITH CHECK (auteur_id = auth.uid() AND public.est_personnel());
DROP POLICY IF EXISTS "Messages : envoi" ON public.messages;
CREATE POLICY "Messages : envoi" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    expediteur_id = auth.uid() AND public.mon_role() IS NOT NULL
    AND (cible_role IS NULL OR cible_role IN ('secretaire', 'admin', 'dg') OR public.est_personnel())
  );

-- Rapports : date et heure de lecture par le DG ; personne d'autre ne modifie un rapport soumis
ALTER TABLE public.rapports
  ADD COLUMN IF NOT EXISTS lu_le TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lu_par UUID REFERENCES public.profils (id);
CREATE OR REPLACE FUNCTION public.horodater_rapport() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.statut IS DISTINCT FROM OLD.statut AND NEW.statut <> 'soumis' AND OLD.lu_le IS NULL THEN
    NEW.lu_le := now();
    NEW.lu_par := auth.uid();
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS rapports_horodater ON public.rapports;
CREATE TRIGGER rapports_horodater BEFORE UPDATE ON public.rapports
  FOR EACH ROW EXECUTE FUNCTION public.horodater_rapport();

-- -------------------------------------------------------------
-- 2. PHOTOS D'IDENTITÉ ET DOCUMENTS (stockage privé)
-- -------------------------------------------------------------
ALTER TABLE public.profils ADD COLUMN IF NOT EXISTS photo_path TEXT;
ALTER TABLE public.inscriptions ADD COLUMN IF NOT EXISTS photo_path TEXT;
ALTER TABLE public.apprenants ADD COLUMN IF NOT EXISTS photo_path TEXT;
ALTER TABLE public.professeurs ADD COLUMN IF NOT EXISTS photo_path TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('photos', 'photos', FALSE, 5242880,
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']),
  ('documents', 'documents', FALSE, 10485760,
   ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Chaque personne dépose ses fichiers dans son propre dossier : <son id>/...
DROP POLICY IF EXISTS "Fichiers : dépôt dans son dossier" ON storage.objects;
CREATE POLICY "Fichiers : dépôt dans son dossier" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('photos', 'documents') AND (storage.foldername(name))[1] = auth.uid()::TEXT);

-- Photos : visibles par leur propriétaire et par les comptes validés (identification, messagerie)
DROP POLICY IF EXISTS "Photos : lecture" ON storage.objects;
CREATE POLICY "Photos : lecture" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'photos' AND ((storage.foldername(name))[1] = auth.uid()::TEXT OR public.mon_role() IS NOT NULL));

-- Documents : propriétaire, DG ; administration et secrétariat sauf les rapports (réservés au DG)
DROP POLICY IF EXISTS "Documents : lecture" ON storage.objects;
CREATE POLICY "Documents : lecture" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND (
    (storage.foldername(name))[1] = auth.uid()::TEXT
    OR public.a_role(ARRAY['dg'])
    OR (public.a_role(ARRAY['admin', 'secretaire']) AND COALESCE((storage.foldername(name))[2], '') <> 'rapports')
  ));

-- Seul le DG peut modifier ou supprimer un fichier déposé
DROP POLICY IF EXISTS "Fichiers : modification DG" ON storage.objects;
CREATE POLICY "Fichiers : modification DG" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('photos', 'documents') AND public.a_role(ARRAY['dg']));
DROP POLICY IF EXISTS "Fichiers : suppression DG" ON storage.objects;
CREATE POLICY "Fichiers : suppression DG" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('photos', 'documents') AND public.a_role(ARRAY['dg']));

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proprietaire_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profils (id) ON DELETE CASCADE,
  categorie TEXT NOT NULL CHECK (categorie IN ('photo', 'cv', 'lettre_motivation', 'diplome', 'acte_naissance',
    'piece_identite', 'attestation', 'bulletin', 'rapport', 'justificatif', 'autre')),
  titre TEXT,
  bucket TEXT NOT NULL DEFAULT 'documents' CHECK (bucket IN ('photos', 'documents')),
  chemin TEXT NOT NULL UNIQUE,
  nom_fichier TEXT,
  taille INT,
  type_mime TEXT,
  inscription_id UUID REFERENCES public.inscriptions (id) ON DELETE SET NULL,
  apprenant_id UUID REFERENCES public.apprenants (id) ON DELETE SET NULL,
  rapport_id UUID REFERENCES public.rapports (id) ON DELETE SET NULL,
  demande_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS documents_proprietaire_idx ON public.documents (proprietaire_id);
CREATE INDEX IF NOT EXISTS documents_inscription_idx ON public.documents (inscription_id);

DROP POLICY IF EXISTS "Documents : lecture" ON public.documents;
CREATE POLICY "Documents : lecture" ON public.documents FOR SELECT TO authenticated
  USING (proprietaire_id = auth.uid() OR public.a_role(ARRAY['dg'])
         OR (public.a_role(ARRAY['admin', 'secretaire']) AND categorie <> 'rapport'));
DROP POLICY IF EXISTS "Documents : dépôt" ON public.documents;
CREATE POLICY "Documents : dépôt" ON public.documents FOR INSERT TO authenticated
  WITH CHECK (proprietaire_id = auth.uid() AND split_part(chemin, '/', 1) = auth.uid()::TEXT);
DROP POLICY IF EXISTS "Documents : modification DG" ON public.documents;
CREATE POLICY "Documents : modification DG" ON public.documents FOR UPDATE TO authenticated
  USING (public.a_role(ARRAY['dg'])) WITH CHECK (public.a_role(ARRAY['dg']));
DROP POLICY IF EXISTS "Documents : suppression DG" ON public.documents;
CREATE POLICY "Documents : suppression DG" ON public.documents FOR DELETE TO authenticated
  USING (public.a_role(ARRAY['dg']));

-- -------------------------------------------------------------
-- 3. DEMANDES : permission, absence, retard (traitées par le secrétariat)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.demandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demandeur_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profils (id) ON DELETE CASCADE,
  apprenant_id UUID REFERENCES public.apprenants (id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('permission', 'absence', 'retard', 'autre')),
  date_debut DATE NOT NULL,
  date_fin DATE,
  heure TIME,
  motif TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'soumise' CHECK (statut IN ('soumise', 'approuvee', 'refusee')),
  reponse TEXT,
  traite_par UUID REFERENCES public.profils (id),
  traite_le TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.demandes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Demandes : lecture" ON public.demandes;
CREATE POLICY "Demandes : lecture" ON public.demandes FOR SELECT TO authenticated
  USING (demandeur_id = auth.uid() OR public.a_role(ARRAY['dg', 'admin', 'secretaire', 'pedagogique']));
DROP POLICY IF EXISTS "Demandes : dépôt" ON public.demandes;
CREATE POLICY "Demandes : dépôt" ON public.demandes FOR INSERT TO authenticated
  WITH CHECK (
    demandeur_id = auth.uid() AND public.mon_role() IS NOT NULL
    AND (apprenant_id IS NULL OR public.est_parent_de(apprenant_id)
         OR EXISTS (SELECT 1 FROM public.apprenants a WHERE a.id = apprenant_id AND a.profil_id = auth.uid()))
  );
DROP POLICY IF EXISTS "Demandes : traitement" ON public.demandes;
CREATE POLICY "Demandes : traitement" ON public.demandes FOR UPDATE TO authenticated
  USING (public.a_role(ARRAY['dg', 'secretaire'])) WITH CHECK (public.a_role(ARRAY['dg', 'secretaire']));

CREATE OR REPLACE FUNCTION public.horodater_demande() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.statut IS DISTINCT FROM OLD.statut THEN
    NEW.traite_par := auth.uid();
    NEW.traite_le := now();
    PERFORM public.notifier_profil(NEW.demandeur_id,
      CASE WHEN NEW.statut = 'approuvee' THEN 'Votre demande est acceptée' ELSE 'Votre demande est refusée' END,
      COALESCE(NEW.reponse, ''), '/mon-espace');
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS demandes_horodater ON public.demandes;
CREATE TRIGGER demandes_horodater BEFORE UPDATE ON public.demandes
  FOR EACH ROW EXECUTE FUNCTION public.horodater_demande();

CREATE OR REPLACE FUNCTION public.notifier_demande() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.notifier_roles(ARRAY['secretaire'], 'Nouvelle demande : ' || NEW.type, NEW.motif, '/gestion/demandes');
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS demandes_notifier ON public.demandes;
CREATE TRIGGER demandes_notifier AFTER INSERT ON public.demandes
  FOR EACH ROW EXECUTE FUNCTION public.notifier_demande();

-- Une demande approuvée d'absence ou de retard est reportée dans les présences
CREATE OR REPLACE FUNCTION public.reporter_demande() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.statut = 'approuvee' AND OLD.statut IS DISTINCT FROM 'approuvee' AND NEW.apprenant_id IS NOT NULL THEN
    INSERT INTO public.presences (apprenant_id, jour, statut, motif, saisi_par)
    SELECT NEW.apprenant_id, d::DATE, CASE WHEN NEW.type = 'retard' THEN 'retard' ELSE 'excuse' END,
           NEW.type || ' accordée : ' || NEW.motif, auth.uid()
    FROM generate_series(NEW.date_debut, COALESCE(NEW.date_fin, NEW.date_debut), INTERVAL '1 day') d
    ON CONFLICT (apprenant_id, jour) DO UPDATE SET statut = EXCLUDED.statut, motif = EXCLUDED.motif;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS demandes_reporter ON public.demandes;
CREATE TRIGGER demandes_reporter AFTER UPDATE ON public.demandes
  FOR EACH ROW EXECUTE FUNCTION public.reporter_demande();

-- -------------------------------------------------------------
-- 4. PUBLICATIONS : soumises par le personnel, publiées par le DG
-- -------------------------------------------------------------
ALTER TABLE public.publications
  ADD COLUMN IF NOT EXISTS statut TEXT NOT NULL DEFAULT 'soumise',
  ADD COLUMN IF NOT EXISTS valide_par UUID REFERENCES public.profils (id),
  ADD COLUMN IF NOT EXISTS valide_le TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS motif_refus TEXT;
ALTER TABLE public.publications DROP CONSTRAINT IF EXISTS publications_statut_check;
ALTER TABLE public.publications ADD CONSTRAINT publications_statut_check
  CHECK (statut IN ('brouillon', 'soumise', 'publiee', 'refusee'));
UPDATE public.publications SET statut = CASE WHEN publie THEN 'publiee' ELSE 'brouillon' END WHERE statut = 'soumise' AND valide_le IS NULL AND publie;

CREATE OR REPLACE FUNCTION public.controler_publication() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  IF auth.uid() IS NOT NULL AND NOT public.a_role(ARRAY['dg']) THEN
    -- Le personnel prépare ou soumet ; seule la direction publie
    IF NEW.statut NOT IN ('brouillon', 'soumise') THEN NEW.statut := 'soumise'; END IF;
    NEW.publie := FALSE;
    NEW.valide_par := NULL;
    NEW.valide_le := NULL;
  ELSE
    NEW.publie := NEW.statut = 'publiee';
    IF NEW.statut = 'publiee' AND (TG_OP = 'INSERT' OR OLD.statut IS DISTINCT FROM 'publiee') THEN
      NEW.valide_par := auth.uid();
      NEW.valide_le := now();
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS publications_controler ON public.publications;
CREATE TRIGGER publications_controler BEFORE INSERT OR UPDATE ON public.publications
  FOR EACH ROW EXECUTE FUNCTION public.controler_publication();

DROP POLICY IF EXISTS "Publications : gestion" ON public.publications;
DROP POLICY IF EXISTS "Publications : création" ON public.publications;
CREATE POLICY "Publications : création" ON public.publications FOR INSERT TO authenticated
  WITH CHECK (public.a_role(ARRAY['dg', 'admin', 'secretaire', 'pedagogique']) AND auteur_id = auth.uid());
DROP POLICY IF EXISTS "Publications : modification" ON public.publications;
CREATE POLICY "Publications : modification" ON public.publications FOR UPDATE TO authenticated
  USING (public.a_role(ARRAY['dg']) OR (auteur_id = auth.uid() AND statut = 'brouillon'))
  WITH CHECK (public.a_role(ARRAY['dg']) OR auteur_id = auth.uid());
DROP POLICY IF EXISTS "Publications : suppression" ON public.publications;
CREATE POLICY "Publications : suppression" ON public.publications FOR DELETE TO authenticated
  USING (public.a_role(ARRAY['dg']) OR (auteur_id = auth.uid() AND statut = 'brouillon'));
DROP POLICY IF EXISTS "Publications : internes" ON public.publications;
CREATE POLICY "Publications : internes" ON public.publications FOR SELECT TO authenticated
  USING (
    public.a_role(ARRAY['dg', 'admin', 'secretaire', 'pedagogique'])
    OR (publie AND (
      cible = 'tous'
      OR (cible = 'apprenants' AND public.a_role(ARRAY['apprenant']))
      OR (cible = 'parents' AND public.a_role(ARRAY['parent']))
      OR (cible = 'professeurs' AND public.a_role(ARRAY['professeur']))
      OR (cible = 'personnel' AND public.est_personnel())
    ))
  );

CREATE OR REPLACE FUNCTION public.notifier_publication() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.statut = 'soumise' AND (TG_OP = 'INSERT' OR OLD.statut IS DISTINCT FROM 'soumise') THEN
    PERFORM public.notifier_roles(ARRAY['dg'], 'Publication à valider : ' || NEW.titre, NULL, '/gestion/publications');
  ELSIF TG_OP = 'UPDATE' AND NEW.statut IS DISTINCT FROM OLD.statut AND NEW.statut IN ('publiee', 'refusee') THEN
    PERFORM public.notifier_profil(NEW.auteur_id,
      CASE WHEN NEW.statut = 'publiee' THEN 'Publication validée par le DG : ' ELSE 'Publication refusée : ' END || NEW.titre,
      NEW.motif_refus, '/gestion/publications');
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS publications_notifier ON public.publications;
CREATE TRIGGER publications_notifier AFTER INSERT OR UPDATE ON public.publications
  FOR EACH ROW EXECUTE FUNCTION public.notifier_publication();

-- -------------------------------------------------------------
-- 5. MESSAGERIE INTERNE (conversations en direct)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT,
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'groupe')),
  cree_par UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profils (id) ON DELETE CASCADE,
  dernier_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.conversation_membres (
  conversation_id UUID NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  profil_id UUID NOT NULL REFERENCES public.profils (id) ON DELETE CASCADE,
  dernier_lu_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ajoute_le TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, profil_id)
);
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  auteur_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profils (id) ON DELETE CASCADE,
  contenu TEXT NOT NULL CHECK (length(contenu) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_messages_conv_idx ON public.chat_messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS conversation_membres_profil_idx ON public.conversation_membres (profil_id);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_membres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.est_membre(p_conv UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversation_membres WHERE conversation_id = p_conv AND profil_id = auth.uid())
$$;

DROP POLICY IF EXISTS "Conversations : lecture" ON public.conversations;
CREATE POLICY "Conversations : lecture" ON public.conversations FOR SELECT TO authenticated
  USING (public.est_membre(id) OR cree_par = auth.uid());
DROP POLICY IF EXISTS "Conversations : création" ON public.conversations;
CREATE POLICY "Conversations : création" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (cree_par = auth.uid() AND public.mon_role() IS NOT NULL
              AND (type = 'direct' OR public.est_personnel()));
DROP POLICY IF EXISTS "Conversations : mise à jour" ON public.conversations;
CREATE POLICY "Conversations : mise à jour" ON public.conversations FOR UPDATE TO authenticated
  USING (cree_par = auth.uid() OR public.a_role(ARRAY['dg'])) WITH CHECK (cree_par = auth.uid() OR public.a_role(ARRAY['dg']));

DROP POLICY IF EXISTS "Membres : lecture" ON public.conversation_membres;
CREATE POLICY "Membres : lecture" ON public.conversation_membres FOR SELECT TO authenticated
  USING (public.est_membre(conversation_id));
DROP POLICY IF EXISTS "Membres : ajout par le créateur" ON public.conversation_membres;
CREATE POLICY "Membres : ajout par le créateur" ON public.conversation_membres FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.cree_par = auth.uid()));
DROP POLICY IF EXISTS "Membres : lecture des messages" ON public.conversation_membres;
CREATE POLICY "Membres : lecture des messages" ON public.conversation_membres FOR UPDATE TO authenticated
  USING (profil_id = auth.uid()) WITH CHECK (profil_id = auth.uid());
DROP POLICY IF EXISTS "Membres : quitter" ON public.conversation_membres;
CREATE POLICY "Membres : quitter" ON public.conversation_membres FOR DELETE TO authenticated
  USING (profil_id = auth.uid());

DROP POLICY IF EXISTS "Chat : lecture" ON public.chat_messages;
CREATE POLICY "Chat : lecture" ON public.chat_messages FOR SELECT TO authenticated
  USING (public.est_membre(conversation_id));
DROP POLICY IF EXISTS "Chat : envoi" ON public.chat_messages;
CREATE POLICY "Chat : envoi" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (auteur_id = auth.uid() AND public.est_membre(conversation_id));

CREATE OR REPLACE FUNCTION public.chat_apres_message() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations SET dernier_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  UPDATE public.conversation_membres SET dernier_lu_at = NEW.created_at
    WHERE conversation_id = NEW.conversation_id AND profil_id = NEW.auteur_id;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS chat_messages_apres ON public.chat_messages;
CREATE TRIGGER chat_messages_apres AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.chat_apres_message();

-- Diffusion en temps réel des nouveaux messages
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- Annuaire : qui peut-on contacter ? (le personnel voit tout le monde ; les familles voient le personnel
-- et les membres de leurs conversations). Colonnes limitées : aucune donnée personnelle sensible.
CREATE OR REPLACE FUNCTION public.annuaire()
RETURNS TABLE (id UUID, pseudo TEXT, prenom TEXT, nom TEXT, role TEXT, photo_path TEXT, photo_url TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.pseudo, p.prenom, p.nom, p.role, p.photo_path, p.photo_url
  FROM public.profils p
  WHERE p.statut = 'valide' AND public.mon_role() IS NOT NULL AND (
    public.est_personnel()
    OR p.role IN ('dg', 'admin', 'secretaire', 'pedagogique', 'professeur')
    OR p.id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.conversation_membres a JOIN public.conversation_membres b
               ON a.conversation_id = b.conversation_id WHERE a.profil_id = auth.uid() AND b.profil_id = p.id)
  )
  ORDER BY p.nom, p.prenom
$$;
GRANT EXECUTE ON FUNCTION public.annuaire() TO authenticated;

-- -------------------------------------------------------------
-- 6. VISITES DU SITE (statistiques)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.visites (
  id BIGSERIAL PRIMARY KEY,
  chemin TEXT NOT NULL CHECK (length(chemin) <= 300),
  jour DATE NOT NULL DEFAULT current_date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.visites ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS visites_jour_idx ON public.visites (jour);
DROP POLICY IF EXISTS "Visites : enregistrement" ON public.visites;
CREATE POLICY "Visites : enregistrement" ON public.visites FOR INSERT TO anon, authenticated
  WITH CHECK (jour = current_date);
DROP POLICY IF EXISTS "Visites : DG" ON public.visites;
CREATE POLICY "Visites : DG" ON public.visites FOR SELECT TO authenticated USING (public.a_role(ARRAY['dg']));

-- -------------------------------------------------------------
-- 7. STATISTIQUES DU DG (par jour, semaine, mois, année)
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.stats_activite(p_unite TEXT, p_nombre INT)
RETURNS TABLE (periode DATE, actions BIGINT, inscriptions BIGINT, visites BIGINT, comptes BIGINT, messages BIGINT)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  pas INTERVAL := ('1 ' || p_unite)::INTERVAL;
  debut TIMESTAMPTZ;
BEGIN
  IF NOT public.a_role(ARRAY['dg']) THEN RAISE EXCEPTION 'Statistiques réservées au Directeur Général.'; END IF;
  IF p_unite NOT IN ('day', 'week', 'month', 'year') THEN RAISE EXCEPTION 'Unité invalide.'; END IF;
  debut := date_trunc(p_unite, now()) - pas * (LEAST(GREATEST(p_nombre, 1), 60) - 1);
  RETURN QUERY
  SELECT s::DATE,
    (SELECT count(*) FROM public.journal j WHERE j.created_at >= s AND j.created_at < s + pas),
    (SELECT count(*) FROM public.inscriptions i WHERE i.created_at >= s AND i.created_at < s + pas),
    (SELECT count(*) FROM public.visites v WHERE v.created_at >= s AND v.created_at < s + pas),
    (SELECT count(*) FROM public.profils p WHERE p.created_at >= s AND p.created_at < s + pas),
    (SELECT count(*) FROM public.chat_messages m WHERE m.created_at >= s AND m.created_at < s + pas)
         + (SELECT count(*) FROM public.messages m2 WHERE m2.created_at >= s AND m2.created_at < s + pas)
  FROM generate_series(debut, date_trunc(p_unite, now()), pas) s
  ORDER BY s;
END $$;
GRANT EXECUTE ON FUNCTION public.stats_activite(TEXT, INT) TO authenticated;

-- -------------------------------------------------------------
-- 8. RECHERCHE GLOBALE (respecte les droits de chacun : RLS)
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recherche_globale(q TEXT)
RETURNS TABLE (type TEXT, id TEXT, titre TEXT, detail TEXT, lien TEXT, date TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  WITH t AS (SELECT '%' || replace(replace(trim(q), '%', ''), '_', '') || '%' AS m)
  (SELECT 'Apprenant', a.id::TEXT, a.prenom || ' ' || a.nom, a.matricule, '/gestion/apprenants/' || a.id, a.created_at
   FROM public.apprenants a, t WHERE a.nom ILIKE t.m OR a.prenom ILIKE t.m OR a.matricule ILIKE t.m OR a.telephone ILIKE t.m LIMIT 10)
  UNION ALL
  (SELECT 'Inscription', i.id::TEXT, i.prenom || ' ' || i.nom, i.filiere || ' · ' || i.statut, '/gestion/inscriptions/' || i.id, i.created_at
   FROM public.inscriptions i, t WHERE i.nom ILIKE t.m OR i.prenom ILIKE t.m OR i.telephone ILIKE t.m OR i.email ILIKE t.m LIMIT 10)
  UNION ALL
  (SELECT 'Compte', p.id::TEXT, COALESCE(p.prenom || ' ' || p.nom, p.pseudo), '@' || p.pseudo || ' · ' || p.role, '/gestion/comptes?filtre=tous#' || p.id, p.created_at
   FROM public.profils p, t WHERE p.nom ILIKE t.m OR p.prenom ILIKE t.m OR p.pseudo ILIKE t.m OR p.email ILIKE t.m LIMIT 10)
  UNION ALL
  (SELECT 'Professeur', pr.id::TEXT, pr.prenom || ' ' || pr.nom, COALESCE(pr.specialite, ''), '/gestion/professeurs', pr.created_at
   FROM public.professeurs pr, t WHERE pr.nom ILIKE t.m OR pr.prenom ILIKE t.m OR pr.specialite ILIKE t.m LIMIT 10)
  UNION ALL
  (SELECT 'Document', d.id::TEXT, COALESCE(d.titre, d.nom_fichier), d.categorie, '/gestion/documents?q=' || COALESCE(d.nom_fichier, ''), d.created_at
   FROM public.documents d, t WHERE d.titre ILIKE t.m OR d.nom_fichier ILIKE t.m LIMIT 10)
  UNION ALL
  (SELECT 'Rapport', r.id::TEXT, r.titre, COALESCE(r.periode, ''), '/gestion/rapports', r.created_at
   FROM public.rapports r, t WHERE r.titre ILIKE t.m OR r.contenu ILIKE t.m LIMIT 10)
  UNION ALL
  (SELECT 'Publication', pu.id::TEXT, pu.titre, pu.statut, '/gestion/publications', pu.created_at
   FROM public.publications pu, t WHERE pu.titre ILIKE t.m OR pu.contenu ILIKE t.m LIMIT 10)
  UNION ALL
  (SELECT 'Demande', de.id::TEXT, de.type || ' — ' || left(de.motif, 60), de.statut, '/gestion/demandes', de.created_at
   FROM public.demandes de, t WHERE de.motif ILIKE t.m LIMIT 10)
$$;
GRANT EXECUTE ON FUNCTION public.recherche_globale(TEXT) TO authenticated;

-- -------------------------------------------------------------
-- 9. LE DG EST NOTIFIÉ DE CHAQUE ACTION DE SES COLLABORATEURS
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notifier_dg_action() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  qui TEXT;
  rubrique TEXT;
  lien TEXT;
BEGIN
  IF NEW.acteur_id IS NULL OR NEW.table_cible IN ('presences', 'messages', 'notifications', 'parents_apprenants') THEN
    RETURN NEW;
  END IF;
  -- Les actions du DG lui-même ne lui sont pas notifiées
  IF EXISTS (SELECT 1 FROM public.profils WHERE id = NEW.acteur_id AND role = 'dg') THEN RETURN NEW; END IF;
  SELECT trim(COALESCE(prenom, '') || ' ' || COALESCE(nom, '')) || ' (' || role || ')' INTO qui FROM public.profils WHERE id = NEW.acteur_id;
  rubrique := CASE NEW.table_cible
    WHEN 'inscriptions' THEN 'inscriptions' WHEN 'apprenants' THEN 'apprenants' WHEN 'professeurs' THEN 'professeurs'
    WHEN 'filieres' THEN 'filières' WHEN 'matieres' THEN 'matières' WHEN 'publications' THEN 'publications'
    WHEN 'rapports' THEN 'rapports' WHEN 'documents' THEN 'documents' WHEN 'demandes' THEN 'demandes'
    WHEN 'profils' THEN 'comptes' ELSE NEW.table_cible END;
  lien := CASE NEW.table_cible
    WHEN 'inscriptions' THEN '/gestion/inscriptions/' || NEW.cible_id
    WHEN 'apprenants' THEN '/gestion/apprenants/' || NEW.cible_id
    WHEN 'profils' THEN '/gestion/comptes'
    WHEN 'documents' THEN '/gestion/documents'
    ELSE '/gestion/' || CASE NEW.table_cible WHEN 'matieres' THEN 'filieres' ELSE NEW.table_cible END END;
  PERFORM public.notifier_roles(ARRAY['dg'],
    initcap(CASE NEW.action WHEN 'insert' THEN 'ajout' WHEN 'update' THEN 'modification' ELSE 'suppression' END) || ' — ' || rubrique,
    COALESCE(qui, 'Un utilisateur'), lien);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS journal_notifier_dg ON public.journal;
CREATE TRIGGER journal_notifier_dg AFTER INSERT ON public.journal
  FOR EACH ROW EXECUTE FUNCTION public.notifier_dg_action();

-- Un appel de présences = une seule notification
CREATE OR REPLACE FUNCTION public.notifier_appel() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.a_role(ARRAY['dg']) THEN
    PERFORM public.notifier_roles(ARRAY['dg'], 'Appel des présences enregistré',
      (SELECT trim(COALESCE(prenom, '') || ' ' || COALESCE(nom, '')) FROM public.profils WHERE id = auth.uid()), '/gestion/presences');
  END IF;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS presences_notifier_appel ON public.presences;
CREATE TRIGGER presences_notifier_appel AFTER INSERT OR UPDATE ON public.presences
  FOR EACH STATEMENT EXECUTE FUNCTION public.notifier_appel();

-- Journalisation des nouvelles tables
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['documents', 'demandes'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', t || '_journal', t);
    EXECUTE format('CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON public.%I
                    FOR EACH ROW EXECUTE FUNCTION public.journaliser()', t || '_journal', t);
  END LOOP;
END $$;
