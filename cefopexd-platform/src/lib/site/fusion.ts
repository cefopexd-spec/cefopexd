/* =============================================
   FUSION DU CONTENU ENREGISTRÉ AVEC LE CONTENU PAR DÉFAUT
   - objets : fusion champ par champ (un nouveau réglage ajouté plus tard
     dans le code apparaît automatiquement avec sa valeur par défaut) ;
   - listes : la liste enregistrée remplace entièrement celle par défaut
     (un élément supprimé dans le Studio ne revient pas).
   ============================================= */
const estObjet = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export function fusion<T>(defaut: T, enregistre: unknown): T {
  if (enregistre === undefined || enregistre === null) return defaut;
  if (Array.isArray(defaut)) return (Array.isArray(enregistre) ? enregistre : defaut) as T;
  if (estObjet(defaut)) {
    if (!estObjet(enregistre)) return defaut;
    const resultat: Record<string, unknown> = { ...defaut };
    for (const [cle, valeur] of Object.entries(enregistre)) {
      resultat[cle] = cle in defaut ? fusion((defaut as Record<string, unknown>)[cle], valeur) : valeur;
    }
    return resultat as T;
  }
  // Valeur simple : on garde l'enregistrée si elle est du même type
  return (typeof enregistre === typeof defaut ? enregistre : defaut) as T;
}
