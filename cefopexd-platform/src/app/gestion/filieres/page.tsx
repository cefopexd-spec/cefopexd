import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import ActionForm from "@/components/forms/ActionForm";
import { Field } from "@/components/forms/SupabaseForm";
import { requireGestion } from "@/lib/session";
import { ajouterMatiere, supprimerMatiere } from "../actions";

export const metadata: Metadata = { title: "Filières & matières" };

type Filiere = { id: string; nom: string; duree: string | null; matieres: { id: string; nom: string; coefficient: number | null; volume_horaire: number | null }[] };

/* =============================================
   FILIÈRES & MATIÈRES
   ============================================= */
export default async function FilieresPage() {
  const { supabase } = await requireGestion("filieres");
  const { data } = await supabase.from("filieres").select("id, nom, duree, matieres(id, nom, coefficient, volume_horaire)").order("nom");
  const filieres = (data ?? []) as Filiere[];

  return (
    <>
      <div className="g-page-head">
        <h1>Filières & matières</h1>
        <p>Les matières de chaque filière, utilisées pour attribuer les cours aux professeurs.</p>
      </div>
      <div className="g-grid-2">
        {filieres.map((f) => (
          <div key={f.id} className="g-card">
            <div className="g-card-head"><h2>{f.nom}</h2><span className="field-hint">{f.duree ?? ""}</span></div>
            {f.matieres.length === 0 ? <p className="g-empty">Aucune matière.</p> : (
              <ul className="g-notifs">
                {f.matieres.map((m) => (
                  <li key={m.id}>
                    <div><strong>{m.nom}</strong><span>{m.coefficient ? `Coef. ${m.coefficient}` : ""} {m.volume_horaire ? `· ${m.volume_horaire} h` : ""}</span></div>
                    <form action={supprimerMatiere.bind(null, m.id)}><button className="g-icon-btn" aria-label={`Supprimer ${m.nom}`}><Trash2 size={15} /></button></form>
                  </li>
                ))}
              </ul>
            )}
            <ActionForm action={ajouterMatiere} submitLabel="Ajouter la matière" className="g-form g-inline-form" submitClassName="btn-hero-ghost btn-sm">
              <input type="hidden" name="filiere_id" value={f.id} />
              <div className="form-grid">
                <Field label="Matière" name="nom" required />
                <Field label="Coefficient" name="coefficient" type="number" />
                <Field label="Volume horaire (h)" name="volume_horaire" type="number" />
              </div>
            </ActionForm>
          </div>
        ))}
      </div>
    </>
  );
}
