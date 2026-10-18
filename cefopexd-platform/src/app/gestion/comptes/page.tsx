import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import ActionForm from "@/components/forms/ActionForm";
import { Field } from "@/components/forms/SupabaseForm";
import { requireGestion, nomComplet } from "@/lib/session";
import { ROLES, ROLES_RESPONSABLES, SECTIONS_GESTION, dateHeure, roleLabel, typeLabel } from "@/lib/roles";
import { urlsPhotos } from "@/lib/fichiers";
import { creerResponsable, majCompte, reinitialiserMotDePasse } from "../actions";

export const metadata: Metadata = { title: "Comptes & rôles" };

type Props = { searchParams: Promise<{ filtre?: string }> };
type Profil = {
  id: string; email: string; pseudo: string; nom: string | null; prenom: string | null; date_naissance: string | null;
  lieu_naissance: string | null; telephone: string | null; type_demandeur: string | null; motif: string | null;
  role: string; statut: string; sections: string[] | null; profil_complet: boolean; created_at: string;
  photo_path: string | null; photo_url: string | null; valide_le: string | null;
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
  const photos = await urlsPhotos(supabase, profils.map((p) => p.photo_path));

  return (
    <>
      <div className="g-page-head">
        <h1>Comptes & rôles</h1>
        <p>Validez les comptes créés avec Google, attribuez un rôle et, si besoin, choisissez précisément les rubriques ouvertes à chaque personne.</p>
      </div>

      {/* Les responsables (administration, secrétariat, pédagogie, professeurs) reçoivent un compte direct */}
      <details className="g-card g-details" open={profils.length === 0}>
        <summary><UserPlus size={16} /> Créer le compte d&#39;un responsable</summary>
        <p className="field-hint">
          Le compte est créé immédiatement avec son rôle. La personne se connecte sur la page Connexion (« Personnel du centre ») avec
          son e-mail ou son pseudo et le mot de passe provisoire, qu&#39;elle change ensuite dans « Mon espace ».
        </p>
        <ActionForm action={creerResponsable} submitLabel="Créer le compte" className="g-form" submitClassName="btn-hero-primary btn-sm">
          <div className="form-grid">
            <Field label="Nom" name="nom" required />
            <Field label="Prénom(s)" name="prenom" required />
            <Field label="E-mail" name="email" type="email" required />
            <Field label="Téléphone" name="telephone" type="tel" />
            <label className="field"><span>Responsabilité</span>
              <select name="role" required defaultValue="secretaire">
                {ROLES.filter((r) => ROLES_RESPONSABLES.includes(r.value)).map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </label>
            <Field label="Pseudo de connexion (facultatif)" name="pseudo" placeholder="ex. secretariat" />
            <Field label="Mot de passe provisoire (facultatif)" name="mot_de_passe" hint="Laissé vide : un mot de passe sûr est généré." />
          </div>
        </ActionForm>
      </details>

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
            <div className="g-account-id">
              {photos.get(p.photo_path ?? "") || p.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photos.get(p.photo_path ?? "") ?? p.photo_url ?? ""} alt={`Photo de ${nomComplet(p)}`} referrerPolicy="no-referrer" />
              ) : <span className="profile-initial">{(p.prenom || p.pseudo).charAt(0).toUpperCase()}</span>}
              <div>
                {p.valide_le && <p className="g-validation">Compte validé le {dateHeure(p.valide_le)}</p>}
                <p className="field-hint">Compte créé le {dateHeure(p.created_at)}</p>
              </div>
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
            {ROLES_RESPONSABLES.includes(p.role as never) && (
              <ActionForm action={reinitialiserMotDePasse} submitLabel="Générer un nouveau mot de passe" className="g-form" submitClassName="g-link-btn">
                <input type="hidden" name="id" value={p.id} />
              </ActionForm>
            )}
          </details>
        ))}
      </div>
    </>
  );
}
