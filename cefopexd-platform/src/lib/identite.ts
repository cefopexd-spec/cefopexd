/* Cookie temporaire : identité saisie avant « Continuer avec Google » (voir CreationCompte) */
export const COOKIE_IDENTITE = "cefopexd_identite";

export type Identite = { nom: string; prenom: string; date_naissance: string; lieu_naissance: string };

/* Relit et valide le contenu du cookie (null si absent ou incorrect) */
export function lireIdentite(valeur: string | undefined): Identite | null {
  if (!valeur) return null;
  try {
    const brut = JSON.parse(decodeURIComponent(valeur)) as Record<string, unknown>;
    const champ = (k: string) => (typeof brut[k] === "string" ? (brut[k] as string).trim().slice(0, 120) : "");
    const identite = { nom: champ("nom"), prenom: champ("prenom"), date_naissance: champ("date_naissance"), lieu_naissance: champ("lieu_naissance") };
    if (!identite.nom || !identite.prenom || !identite.lieu_naissance || !/^\d{4}-\d{2}-\d{2}$/.test(identite.date_naissance)) return null;
    return identite;
  } catch {
    return null;
  }
}
