import type { SupabaseClient } from "@supabase/supabase-js";

/* =============================================
   FICHIERS DÉPOSÉS : lecture des références envoyées par <FileUpload>
   et liens de téléchargement temporaires (stockage privé)
   ============================================= */
export type FichierDepose = { bucket: "photos" | "documents"; chemin: string; nom: string; taille: number; type: string; categorie: string };

/* Récupère les fichiers d'un formulaire ; n'accepte que ceux déposés dans le dossier de l'utilisateur */
export function lireFichiers(entries: Iterable<[string, FormDataEntryValue]>, userId: string): FichierDepose[] {
  const fichiers: FichierDepose[] = [];
  for (const [cle, valeur] of entries) {
    if (!cle.startsWith("fichier:") || typeof valeur !== "string" || !valeur) continue;
    try {
      const f = JSON.parse(valeur) as FichierDepose;
      if ((f.bucket === "photos" || f.bucket === "documents") && f.chemin.startsWith(`${userId}/`)) fichiers.push(f);
    } catch {
      /* référence invalide ignorée */
    }
  }
  return fichiers;
}

export const versDocuments = (fichiers: FichierDepose[], lien: Record<string, string | null> = {}) =>
  fichiers.map((f) => ({
    categorie: f.categorie,
    bucket: f.bucket,
    chemin: f.chemin,
    nom_fichier: f.nom,
    taille: f.taille,
    type_mime: f.type,
    titre: f.nom,
    ...lien,
  }));

/* Liens temporaires (1 h) vers des photos privées, en une seule requête */
export async function urlsPhotos(supabase: SupabaseClient, chemins: (string | null | undefined)[]) {
  const uniques = [...new Set(chemins.filter((c): c is string => !!c))];
  if (!uniques.length) return new Map<string, string>();
  const { data } = await supabase.storage.from("photos").createSignedUrls(uniques, 3600);
  return new Map((data ?? []).filter((d) => d.signedUrl && d.path).map((d) => [d.path as string, d.signedUrl]));
}

export const tailleLisible = (o: number | null | undefined) =>
  !o ? "" : o > 1024 * 1024 ? `${(o / 1024 / 1024).toFixed(1)} Mo` : `${Math.max(1, Math.round(o / 1024))} Ko`;
