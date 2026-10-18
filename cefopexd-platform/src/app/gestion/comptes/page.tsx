import type { Metadata } from "next";
import ActionForm from "@/components/forms/ActionForm";
import { requireGestion, nomComplet } from "@/lib/session";
import { ROLES, SECTIONS_GESTION, roleLabel, typeLabel } from "@/lib/roles";
import { majCompte } from "../actions";

export const metadata: Metadata = { title: "Comptes & rôles" };

type Props = { searchParams: Promise<{ filtre?: string }> };
type Profil = {
  id: string; email: string; pseudo: string; nom: string | null; prenom: string | null; date_naissance: string | null;
  lieu_naissance: string | null; telephone: string | null; type_demandeur: string | null; motif: string | null;
  role: string; statut: string; sections: string[] | null; profil_complet: boolean; created_at: string;
};

const FILTRES = [
  { key: "attente", label: "À valider" },
  { key: "valide", label: "Validés" },
  { key: "refuse", label: "Refusés" },
  { key: "tous", label: "Tous" },
];

/* =============================================
   COMPTES & RÔLES — le DG valide les comptes et attribue rôles et rubriques
   ============================================= */
export default async function ComptesPage({ searchParams }: Props) {
  const { filtre = "attente" } = await searchParams;
  const { supabase } = await requireGestion("comptes");
  let requete = supabase.from("profils").select("*").order("created_at", { ascending: false });
  if (filtre === "attente") requete = requete.eq("statut", "en_attente");
  if (filtre === "valide" || filtre === "refuse") requete = requete.eq("statut", filtre);
  const { data } = await requete;
  const profils = (data ?? []) as Profil[];

  return (
    <>
      <div className="g-page-head">
        <h1>Comptes & rôles</h1>
        <p>Validez les comptes créés avec Google, attribuez un rôle et, si besoin, choisissez précisément les rubriques ouvertes à chaque personne.</p>
      </div>

      <div className="g-tabs">
        {FILTRES.map((f) => (
          <a key={f.key} href={`/gestion/comptes?filtre=${f.key}`} className={filtre === f.key ? "is-active" : ""}>{f.label}</a>
        ))}
      </div>

      {profils.length === 0 && <p className="g-empty">Aucun compte dans cette catégorie.</p>}

      <div className="g-list">
        {profils.map((p) => (
          <details key={p.id} className="g-card g-account" open={filtre === "attente"}>
            <summary>
              <div>
                <strong>{nomComplet(p) || p.email}</strong>
                <span>@{p.pseudo} · {p.email}</span>
              </div>
              <span className={`statut ${p.statut === "valide" ? "is-ok" : p.statut === "refuse" ? "is-ko" : "is-pending"}`}>
                {p.statut === "valide" ? roleLabel(p.role) : p.statut === "refuse" ? "Refusé" : p.profil_complet ? "À valider" : "Profil incomplet"}
              </span>
            </summary>

            <div className="g-kv">
              <div><span>Se présente comme</span><strong>{typeLabel(p.type_demandeur)}</strong></div>
              <div><span>Naissance</span><strong>{p.date_naissance ? new Date(p.date_naissance).toLocaleDateString("fr-FR") : "—"} {p.lieu_naissance ? `à ${p.lieu_naissance}` : ""}</strong></div>
              <div><span>Téléphone</span><strong>{p.telephone ?? "—"}</strong></div>
              <div><span>Compte créé le</span><strong>{new Date(p.created_at).toLocaleDateString("fr-FR")}</strong></div>
            </div>
            {p.motif && <p className="g-motif"><strong>Motif :</strong> {p.motif}</p>}

            <ActionForm action={majCompte} submitLabel="Enregistrer" className="g-form" submitClassName="btn-hero-primary btn-sm">
              <input type="hidden" name="id" value={p.id} />
              <div className="form-grid">
                <label className="field">
                  <span>Rôle attribué</span>
                  <select name="role" defaultValue={p.role}>
                    {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Statut du compte</span>
                  <select name="statut" defaultValue={p.statut === "en_attente" ? "valide" : p.statut}>
                    <option value="valide">Validé</option>
                    <option value="en_attente">En attente</option>
                    <option value="refuse">Refusé</option>
                  </select>
                </label>
              </div>
              <fieldset className="g-sections">
                <legend>
                  <label><input type="checkbox" name="sections_perso" defaultChecked={!!p.sections} /> Choisir les rubriques une par une (sinon : rubriques par défaut du rôle)</label>
                </legend>
                {SECTIONS_GESTION.filter((s) => s.key !== "tableau").map((s) => (
                  <label key={s.key}>
                    <input type="checkbox" name="sections" value={s.key} defaultChecked={p.sections ? p.sections.includes(s.key) : (s.roles as readonly string[]).includes(p.role)} />
                    {s.label}
                  </label>
                ))}
              </fieldset>
            </ActionForm>
          </details>
        ))}
      </div>
    </>
  );
}
