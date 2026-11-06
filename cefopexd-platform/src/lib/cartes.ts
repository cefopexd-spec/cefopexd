import type { SupabaseClient } from "@supabase/supabase-js";
import { urlsPhotos } from "@/lib/fichiers";
import type { ApprenantCarte } from "@/components/CarteEtudiant";

/* =============================================
   DONNÉES DES CARTES D'ÉTUDIANT
   Photo : celle de la fiche apprenant, sinon celle de son inscription,
   sinon celle de son compte (liens temporaires vers le stockage privé).
   ============================================= */
type LigneApprenant = {
  id: string; matricule: string | null; nom: string; prenom: string; sexe: string | null;
  date_naissance: string | null; lieu_naissance: string | null; annee_academique: string | null;
  photo_path: string | null; inscription_id: string | null; profil_id: string | null;
  filieres: { nom: string } | null;
};

export const CHAMPS_CARTE =
  "id, matricule, nom, prenom, sexe, date_naissance, lieu_naissance, annee_academique, photo_path, inscription_id, profil_id, filieres(nom)";

export async function preparerCartes(supabase: SupabaseClient, lignes: unknown[]): Promise<ApprenantCarte[]> {
  const apprenants = lignes as LigneApprenant[];
  const sansPhoto = apprenants.filter((a) => !a.photo_path);
  const idsIns = sansPhoto.map((a) => a.inscription_id).filter((x): x is string => !!x);
  const idsProfils = sansPhoto.map((a) => a.profil_id).filter((x): x is string => !!x);

  const [{ data: ins }, { data: profils }] = await Promise.all([
    idsIns.length ? supabase.from("inscriptions").select("id, photo_path").in("id", idsIns) : Promise.resolve({ data: [] as { id: string; photo_path: string | null }[] }),
    idsProfils.length ? supabase.from("profils").select("id, photo_path").in("id", idsProfils) : Promise.resolve({ data: [] as { id: string; photo_path: string | null }[] }),
  ]);
  const photoIns = new Map((ins ?? []).map((i) => [i.id, i.photo_path]));
  const photoProfil = new Map((profils ?? []).map((p) => [p.id, p.photo_path]));

  const chemin = (a: LigneApprenant) =>
    a.photo_path || (a.inscription_id && photoIns.get(a.inscription_id)) || (a.profil_id && photoProfil.get(a.profil_id)) || null;
  const urls = await urlsPhotos(supabase, apprenants.map(chemin));

  return apprenants.map((a) => {
    const c = chemin(a);
    return {
      id: a.id,
      matricule: a.matricule,
      nom: a.nom,
      prenom: a.prenom,
      sexe: a.sexe,
      date_naissance: a.date_naissance,
      lieu_naissance: a.lieu_naissance,
      annee_academique: a.annee_academique,
      filiere: a.filieres?.nom ?? null,
      photo: c ? urls.get(c) ?? null : null,
    };
  });
}
