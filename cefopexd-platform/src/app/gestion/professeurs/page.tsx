import type { Metadata } from "next";
import ActionForm from "@/components/forms/ActionForm";
import { Field, TextAreaField } from "@/components/forms/SupabaseForm";
import { requireGestion } from "@/lib/session";
import { enregistrerProfesseur } from "../actions";

export const metadata: Metadata = { title: "Professeurs" };

type Prof = {
  id: string; nom: string; prenom: string; email: string | null; telephone: string | null; specialite: string | null;
  diplome: string | null; date_embauche: string | null; dossier: string | null; actif: boolean; profil_id: string | null;
  professeur_matieres: { matiere_id: string; matieres: { nom: string; filieres: { nom: string } | null } | null }[];
};
type Matiere = { id: string; nom: string; filieres: { nom: string } | null };

/* =============================================
   PROFESSEURS — profils, matières enseignées et dossier
   ============================================= */
export default async function ProfesseursPage() {
  const { supabase } = await requireGestion("professeurs");
  const [{ data: profs }, { data: matieres }] = await Promise.all([
    supabase.from("professeurs").select("*, professeur_matieres(matiere_id, matieres(nom, filieres(nom)))").order("nom"),
    supabase.from("matieres").select("id, nom, filieres(nom)").order("nom"),
  ]);
  const liste = (profs ?? []) as unknown as Prof[];
  const toutes = (matieres ?? []) as unknown as Matiere[];

  return (
    <>
      <div className="g-page-head">
        <h1>Professeurs</h1>
        <p>Profils des enseignants, matières attribuées et dossier administratif. Si l&#39;e-mail correspond à un compte Google du site, le professeur est relié automatiquement à son compte.</p>
      </div>

      <div className="g-list">
        {liste.length === 0 && <p className="g-empty">Aucun professeur enregistré.</p>}
        {liste.map((p) => (
          <details key={p.id} className="g-card g-account">
            <summary>
              <div>
                <strong>{p.prenom} {p.nom}</strong>
                <span>{p.specialite ?? "Spécialité non renseignée"} · {p.professeur_matieres.map((m) => m.matieres?.nom).filter(Boolean).join(", ") || "aucune matière"}</span>
              </div>
              <span className={`statut ${p.actif ? "is-ok" : "is-pending"}`}>{p.actif ? (p.profil_id ? "Actif · compte relié" : "Actif") : "Inactif"}</span>
            </summary>
            <ProfForm p={p} matieres={toutes} />
          </details>
        ))}
      </div>

      <details className="g-card g-details" open={liste.length === 0}>
        <summary>Ajouter un professeur</summary>
        <ProfForm matieres={toutes} />
      </details>
    </>
  );
}

function ProfForm({ p, matieres }: { p?: Prof; matieres: Matiere[] }) {
  const choisies = new Set(p?.professeur_matieres.map((m) => m.matiere_id));
  return (
    <ActionForm action={enregistrerProfesseur} submitLabel={p ? "Enregistrer" : "Ajouter le professeur"} className="g-form" submitClassName="btn-hero-primary btn-sm">
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="form-grid">
        <Field label="Nom" name="nom" required defaultValue={p?.nom ?? ""} />
        <Field label="Prénom(s)" name="prenom" required defaultValue={p?.prenom ?? ""} />
        <Field label="E-mail (compte Google)" name="email" type="email" defaultValue={p?.email ?? ""} />
        <Field label="Téléphone" name="telephone" defaultValue={p?.telephone ?? ""} />
        <Field label="Spécialité" name="specialite" defaultValue={p?.specialite ?? ""} />
        <Field label="Diplôme" name="diplome" defaultValue={p?.diplome ?? ""} />
        <Field label="Date d'embauche" name="date_embauche" type="date" defaultValue={p?.date_embauche ?? ""} />
        <label className="field"><span>Statut</span>
          <select name="actif" defaultValue={p?.actif === false ? "off" : "on"}><option value="on">Actif</option><option value="off">Inactif</option></select>
        </label>
      </div>
      <fieldset className="g-sections">
        <legend>Matières enseignées</legend>
        {matieres.length === 0 && <span className="field-hint">Ajoutez d&#39;abord des matières dans « Filières & matières ».</span>}
        {matieres.map((m) => (
          <label key={m.id}><input type="checkbox" name="matieres" value={m.id} defaultChecked={choisies.has(m.id)} /> {m.nom} <small>({m.filieres?.nom ?? "—"})</small></label>
        ))}
      </fieldset>
      <TextAreaField label="Dossier (contrat, documents, observations)" name="dossier" defaultValue={p?.dossier ?? ""} rows={3} />
    </ActionForm>
  );
}
