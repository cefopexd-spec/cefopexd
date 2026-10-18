import { Field } from "@/components/forms/SupabaseForm";

export type ApprenantDb = {
  id: string; matricule: string; nom: string; prenom: string; sexe: string | null; date_naissance: string | null;
  lieu_naissance: string | null; nationalite: string | null; telephone: string | null; email: string | null;
  adresse: string | null; filiere_id: string | null; niveau_etude: string | null; annee_academique: string | null;
  tuteur_nom: string | null; tuteur_lien: string | null; tuteur_telephone: string | null; tuteur_email: string | null;
  statut: string; created_at: string;
};

/* Champs communs à la création et à la modification d'un apprenant */
export default function ApprenantChamps({ a, filieres }: { a?: Partial<ApprenantDb>; filieres: { id: string; nom: string }[] }) {
  return (
    <>
      <h3 className="form-section-title">Identité</h3>
      <div className="form-grid">
        <Field label="Nom" name="nom" required defaultValue={a?.nom ?? ""} />
        <Field label="Prénom(s)" name="prenom" required defaultValue={a?.prenom ?? ""} />
        <label className="field"><span>Sexe</span>
          <select name="sexe" defaultValue={a?.sexe ?? ""}><option value="">—</option><option value="F">Féminin</option><option value="M">Masculin</option></select>
        </label>
        <Field label="Nationalité" name="nationalite" defaultValue={a?.nationalite ?? "Togolaise"} />
        <Field label="Date de naissance" name="date_naissance" type="date" defaultValue={a?.date_naissance ?? ""} />
        <Field label="Lieu de naissance" name="lieu_naissance" defaultValue={a?.lieu_naissance ?? ""} />
        <Field label="Téléphone" name="telephone" defaultValue={a?.telephone ?? ""} />
        <Field label="E-mail" name="email" type="email" defaultValue={a?.email ?? ""} />
        <Field label="Adresse" name="adresse" defaultValue={a?.adresse ?? ""} />
      </div>
      <h3 className="form-section-title">Formation</h3>
      <div className="form-grid">
        <label className="field"><span>Filière</span>
          <select name="filiere_id" defaultValue={a?.filiere_id ?? ""}>
            <option value="">—</option>
            {filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
          </select>
        </label>
        <Field label="Niveau d'étude" name="niveau_etude" defaultValue={a?.niveau_etude ?? ""} />
        <Field label="Année académique" name="annee_academique" defaultValue={a?.annee_academique ?? ""} placeholder="2026-2027" />
      </div>
      <h3 className="form-section-title">Parent / tuteur</h3>
      <div className="form-grid">
        <Field label="Nom complet" name="tuteur_nom" defaultValue={a?.tuteur_nom ?? ""} />
        <Field label="Lien" name="tuteur_lien" defaultValue={a?.tuteur_lien ?? ""} placeholder="Père, mère, tuteur…" />
        <Field label="Téléphone" name="tuteur_telephone" defaultValue={a?.tuteur_telephone ?? ""} />
        <Field label="E-mail" name="tuteur_email" type="email" defaultValue={a?.tuteur_email ?? ""} />
      </div>
    </>
  );
}
