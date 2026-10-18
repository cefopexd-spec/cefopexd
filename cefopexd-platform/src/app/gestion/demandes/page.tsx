import type { Metadata } from "next";
import Link from "next/link";
import ActionForm from "@/components/forms/ActionForm";
import { TextAreaField } from "@/components/forms/SupabaseForm";
import { requireGestion, nomComplet } from "@/lib/session";
import { dateHeure } from "@/lib/roles";
import { traiterDemande } from "../actions";

export const metadata: Metadata = { title: "Permissions & retards" };

type Props = { searchParams: Promise<{ statut?: string }> };
type Demande = {
  id: string; type: string; date_debut: string; date_fin: string | null; heure: string | null; motif: string; statut: string;
  reponse: string | null; traite_le: string | null; created_at: string;
  demandeur: { prenom: string | null; nom: string | null; pseudo: string; role: string } | null;
  traiteur: { prenom: string | null; nom: string | null; pseudo: string } | null;
  apprenants: { id: string; prenom: string; nom: string; matricule: string } | null;
};
const TYPES: Record<string, string> = { permission: "Permission", absence: "Absence", retard: "Retard", autre: "Autre" };
const STATUTS: Record<string, [string, string]> = { soumise: ["À traiter", "is-pending"], approuvee: ["Acceptée", "is-ok"], refusee: ["Refusée", "is-ko"] };

/* =============================================
   DEMANDES DE PERMISSION, D'ABSENCE OU DE RETARD
   Déposées par les parents et apprenants ; traitées par le secrétariat,
   le DG est notifié et peut revoir la décision.
   ============================================= */
export default async function DemandesPage({ searchParams }: Props) {
  const { statut = "soumise" } = await searchParams;
  const { supabase, role } = await requireGestion("demandes");
  let requete = supabase
    .from("demandes")
    .select("*, demandeur:profils!demandes_demandeur_id_fkey(prenom, nom, pseudo, role), traiteur:profils!demandes_traite_par_fkey(prenom, nom, pseudo), apprenants(id, prenom, nom, matricule)")
    .order("created_at", { ascending: false })
    .limit(300);
  if (statut) requete = requete.eq("statut", statut);
  const { data } = await requete;
  const demandes = (data ?? []) as unknown as Demande[];
  const peutDecider = role === "dg" || role === "secretaire";

  return (
    <>
      <div className="g-page-head">
        <h1>Permissions, absences & retards</h1>
        <p>Demandes envoyées par les parents et les apprenants depuis leur espace. Une demande acceptée est reportée automatiquement dans les présences.</p>
      </div>
      <div className="g-tabs">
        {[["soumise", "À traiter"], ["approuvee", "Acceptées"], ["refusee", "Refusées"], ["", "Toutes"]].map(([v, l]) => (
          <Link key={v} href={`/gestion/demandes?statut=${v}`} className={statut === v ? "is-active" : ""}>{l}</Link>
        ))}
      </div>
      <div className="g-list">
        {demandes.length === 0 && <p className="g-empty">Aucune demande.</p>}
        {demandes.map((d) => {
          const [label, classe] = STATUTS[d.statut] ?? STATUTS.soumise;
          return (
            <details key={d.id} className="g-card g-account" open={d.statut === "soumise"}>
              <summary>
                <div>
                  <strong>{TYPES[d.type]} — {d.apprenants ? `${d.apprenants.prenom} ${d.apprenants.nom}` : nomComplet(d.demandeur)}</strong>
                  <span>
                    Du {new Date(d.date_debut).toLocaleDateString("fr-FR")}{d.date_fin && d.date_fin !== d.date_debut ? ` au ${new Date(d.date_fin).toLocaleDateString("fr-FR")}` : ""}
                    {d.heure ? ` à ${d.heure.slice(0, 5)}` : ""} · envoyée le {dateHeure(d.created_at)} par {nomComplet(d.demandeur)}
                  </span>
                </div>
                <span className={`statut ${classe}`}>{label}</span>
              </summary>
              <p className="g-motif"><strong>Motif :</strong> {d.motif}</p>
              {d.apprenants && <p className="field-hint">Apprenant : <Link href={`/gestion/apprenants/${d.apprenants.id}`}>{d.apprenants.matricule}</Link></p>}
              {d.traite_le && (
                <p className="g-validation">
                  {label} le {dateHeure(d.traite_le)} par {nomComplet(d.traiteur)}{d.reponse ? ` — « ${d.reponse} »` : ""}
                </p>
              )}
              {peutDecider && (
                <ActionForm action={traiterDemande} submitLabel={d.statut === "soumise" ? "Enregistrer la décision" : "Modifier la décision"} className="g-form" submitClassName="btn-hero-primary btn-sm">
                  <input type="hidden" name="id" value={d.id} />
                  <div className="g-checks">
                    <label><input type="radio" name="decision" value="approuvee" defaultChecked={d.statut === "approuvee"} required /> Accepter</label>
                    <label><input type="radio" name="decision" value="refusee" defaultChecked={d.statut === "refusee"} /> Refuser</label>
                  </div>
                  <TextAreaField label="Réponse à la famille (facultatif)" name="reponse" defaultValue={d.reponse ?? ""} rows={2} />
                </ActionForm>
              )}
            </details>
          );
        })}
      </div>
    </>
  );
}
