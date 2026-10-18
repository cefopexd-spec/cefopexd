import type { Metadata } from "next";
import { requireGestion, nomComplet } from "@/lib/session";

export const metadata: Metadata = { title: "Journal des actions" };

type Props = { searchParams: Promise<{ table?: string }> };
type Ligne = { id: number; action: string; table_cible: string; cible_id: string | null; details: Record<string, unknown> | null; created_at: string; acteur: { prenom: string | null; nom: string | null; pseudo: string } | null };

const TABLES: Record<string, string> = {
  profils: "Comptes", inscriptions: "Inscriptions", apprenants: "Apprenants", professeurs: "Professeurs",
  filieres: "Filières", matieres: "Matières", presences: "Présences", publications: "Publications",
  messages: "Messages", rapports: "Rapports", parents_apprenants: "Liens parents",
};
const ACTIONS: Record<string, string> = { insert: "Création", update: "Modification", delete: "Suppression" };

/* Résumé lisible des champs modifiés */
function resume(details: Record<string, unknown> | null, action: string) {
  if (!details) return "";
  const champs = Object.keys(details).filter((k) => !["id", "created_at", "updated_at"].includes(k));
  if (action === "update") {
    return champs.slice(0, 4).map((k) => `${k} → ${String(details[k] ?? "∅").slice(0, 40)}`).join(" · ");
  }
  const nom = [details.prenom, details.nom].filter(Boolean).join(" ") || details.titre || details.sujet || details.matricule || "";
  return String(nom);
}

/* =============================================
   JOURNAL — toutes les actions effectuées sur la plateforme (DG)
   ============================================= */
export default async function JournalPage({ searchParams }: Props) {
  const { table = "" } = await searchParams;
  const { supabase } = await requireGestion("journal");
  let requete = supabase.from("journal").select("*, acteur:profils!journal_acteur_id_fkey(prenom, nom, pseudo)").order("created_at", { ascending: false }).limit(300);
  if (table) requete = requete.eq("table_cible", table);
  const { data } = await requete;
  const lignes = (data ?? []) as unknown as Ligne[];

  return (
    <>
      <div className="g-page-head">
        <h1>Journal des actions</h1>
        <p>Qui a fait quoi, et quand : toutes les créations, modifications et suppressions sont enregistrées automatiquement.</p>
      </div>
      <div className="g-tabs">
        <a href="/gestion/journal" className={!table ? "is-active" : ""}>Tout</a>
        {Object.entries(TABLES).map(([k, l]) => <a key={k} href={`/gestion/journal?table=${k}`} className={table === k ? "is-active" : ""}>{l}</a>)}
      </div>
      <div className="g-card g-table-wrap">
        {lignes.length === 0 ? <p className="g-empty">Aucune action enregistrée.</p> : (
          <table className="g-table">
            <thead><tr><th>Date</th><th>Par</th><th>Action</th><th>Rubrique</th><th>Détail</th></tr></thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.id}>
                  <td>{new Date(l.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td>{l.acteur ? nomComplet(l.acteur) : "Système"}</td>
                  <td>{ACTIONS[l.action] ?? l.action}</td>
                  <td>{TABLES[l.table_cible] ?? l.table_cible}</td>
                  <td className="g-detail">{resume(l.details, l.action)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
