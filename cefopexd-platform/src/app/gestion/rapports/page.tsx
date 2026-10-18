import type { Metadata } from "next";
import ActionForm from "@/components/forms/ActionForm";
import { Field, TextAreaField } from "@/components/forms/SupabaseForm";
import { requireGestion, nomComplet } from "@/lib/session";
import { soumettreRapport, traiterRapport } from "../actions";

export const metadata: Metadata = { title: "Rapports" };

type Rapport = {
  id: string; titre: string; periode: string | null; contenu: string; statut: string; commentaire_dg: string | null; created_at: string;
  auteur: { prenom: string | null; nom: string | null; pseudo: string; role: string } | null;
};

/* =============================================
   RAPPORTS — chaque responsable rédige et soumet ; le DG lit et commente
   ============================================= */
export default async function RapportsPage() {
  const { supabase, role } = await requireGestion("rapports");
  const { data } = await supabase.from("rapports").select("*, auteur:profils!rapports_auteur_id_fkey(prenom, nom, pseudo, role)").order("created_at", { ascending: false });
  const rapports = (data ?? []) as unknown as Rapport[];

  return (
    <>
      <div className="g-page-head">
        <h1>Rapports</h1>
        <p>{role === "dg" ? "Tous les rapports soumis par vos équipes." : "Rédigez vos rapports : ils sont transmis directement au Directeur Général."}</p>
      </div>

      <details className="g-card g-details" open={role !== "dg"}>
        <summary>Rédiger un rapport</summary>
        <ActionForm action={soumettreRapport} submitLabel="Soumettre au DG" className="g-form" submitClassName="btn-hero-primary btn-sm">
          <div className="form-grid">
            <Field label="Titre" name="titre" required />
            <Field label="Période" name="periode" placeholder="Ex. : semaine du 14 au 18 octobre" />
            <TextAreaField label="Contenu du rapport" name="contenu" required rows={8} />
          </div>
        </ActionForm>
      </details>

      <div className="g-list">
        {rapports.length === 0 && <p className="g-empty">Aucun rapport.</p>}
        {rapports.map((r) => (
          <details key={r.id} className="g-card g-account" open={role === "dg" && r.statut === "soumis"}>
            <summary>
              <div>
                <strong>{r.titre}</strong>
                <span>{nomComplet(r.auteur)} · {r.periode ?? ""} · {new Date(r.created_at).toLocaleDateString("fr-FR")}</span>
              </div>
              <span className={`statut ${r.statut === "soumis" ? "is-pending" : "is-ok"}`}>{r.statut === "soumis" ? "Non lu" : r.statut === "lu" ? "Lu" : "Archivé"}</span>
            </summary>
            <p className="g-rapport">{r.contenu}</p>
            {r.commentaire_dg && <p className="g-motif"><strong>Commentaire du DG :</strong> {r.commentaire_dg}</p>}
            {role === "dg" && (
              <ActionForm action={traiterRapport} submitLabel="Enregistrer" className="g-form" submitClassName="btn-hero-ghost btn-sm">
                <input type="hidden" name="id" value={r.id} />
                <div className="form-grid">
                  <label className="field"><span>Statut</span>
                    <select name="statut" defaultValue={r.statut === "soumis" ? "lu" : r.statut}><option value="lu">Lu</option><option value="archive">Archivé</option></select>
                  </label>
                  <TextAreaField label="Commentaire (visible par l'auteur)" name="commentaire_dg" defaultValue={r.commentaire_dg ?? ""} rows={3} />
                </div>
              </ActionForm>
            )}
          </details>
        ))}
      </div>
    </>
  );
}
