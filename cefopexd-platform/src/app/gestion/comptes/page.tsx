import type { Metadata } from "next";
import { Network, ShieldCheck, UserPlus } from "lucide-react";
import ActionForm from "@/components/forms/ActionForm";
import { Field } from "@/components/forms/SupabaseForm";
import { requireGestion, nomComplet } from "@/lib/session";
import {
  FAMILLES, ROLES, ROLES_RESPONSABLES, SECTIONS_GESTION, dateHeure, droitsDuRole, familleDuRole, roleLabel,
  rolesDeFamille, typeLabel, type Famille, type Role,
} from "@/lib/roles";
import { urlsPhotos } from "@/lib/fichiers";
import { adminClient } from "@/lib/supabase/admin";
import { creerResponsable, majAdressesDirection, majCompte, reinitialiserMotDePasse } from "../actions";

export const metadata: Metadata = { title: "Comptes & rôles" };

type Props = { searchParams: Promise<{ filtre?: string }> };
type Profil = {
  id: string; email: string; pseudo: string; nom: string | null; prenom: string | null; date_naissance: string | null;
  lieu_naissance: string | null; telephone: string | null; type_demandeur: string | null; motif: string | null;
  role: Role; statut: string; sections: string[] | null; profil_complet: boolean; created_at: string;
  photo_path: string | null; photo_url: string | null; valide_le: string | null; fonction?: string | null;
};

const FILTRES: { key: string; label: string }[] = [
  { key: "attente", label: "À valider" },
  ...FAMILLES.map((f) => ({ key: f.cle as string, label: f.label })),
  { key: "refuse", label: "Refusés" },
  { key: "tous", label: "Tous" },
];

/* =============================================
   COMPTES & RÔLES — organigramme du centre.
   Chaque compte est classé dans sa famille : Direction, Administration & services,
   Corps enseignant, Apprenants & familles, Candidats & visiteurs.
   ============================================= */
export default async function ComptesPage({ searchParams }: Props) {
  const { filtre = "attente" } = await searchParams;
  const { supabase, profil: moi } = await requireGestion("comptes");
  const admin = adminClient();
  const [{ data }, parametres] = await Promise.all([
    supabase.from("profils").select("*").order("nom", { ascending: true }),
    admin ? admin.from("parametres").select("cle, valeur").eq("cle", "dg_emails") : Promise.resolve({ data: null }),
  ]);
  const estPrincipal = moi.role === "principal";
  // L'accès principal technique n'apparaît pas dans l'organigramme (sauf pour lui-même)
  const visibles = ((data ?? []) as Profil[]).filter((p) => p.role !== "principal" || estPrincipal);

  const dansFiltre = (p: Profil, cle: string) => {
    if (cle === "attente") return p.statut === "en_attente";
    if (cle === "refuse") return p.statut === "refuse";
    if (cle === "tous") return true;
    return p.statut === "valide" && familleDuRole(p.role) === cle
      // Les candidats et visiteurs en attente sont aussi classés dans leur famille
      || (cle === "public" && p.statut === "en_attente" && ["candidat", "visiteur"].includes(p.role));
  };
  const profils = visibles.filter((p) => dansFiltre(p, filtre));
  const photos = await urlsPhotos(supabase, profils.map((p) => p.photo_path));
  const effectif = (role: string) => visibles.filter((p) => p.role === role && p.statut === "valide").length;

  const adressesDirection = ((parametres as { data: { valeur: string }[] | null }).data ?? [])[0]?.valeur ?? "";
  const groupesRoles = FAMILLES.map((f) => ({ ...f, roles: ROLES.filter((r) => r.famille === f.cle && (r.value !== "principal" || estPrincipal)) }));
  const famille = FAMILLES.find((f) => f.cle === filtre);

  return (
    <>
      <div className="g-page-head">
        <h1>Comptes & rôles</h1>
        <p>Validez les comptes, attribuez à chacun son poste dans l&#39;organigramme et, si besoin, choisissez précisément les rubriques qui lui sont ouvertes.</p>
      </div>

      {/* Organigramme : chaque famille, ses postes, leurs missions et leurs effectifs */}
      <details className="g-card g-details">
        <summary><Network size={16} /> Organigramme du centre et missions de chaque poste</summary>
        <div className="g-organigramme">
          {FAMILLES.map((f) => (
            <section key={f.cle} className={`g-famille is-${f.cle}`}>
              <h3>{f.label}</h3>
              <ul>
                {ROLES.filter((r) => r.famille === f.cle && r.value !== "principal").map((r) => (
                  <li key={r.value}>
                    <div><strong>{r.label}</strong><span className="g-effectif" title="Comptes validés">{effectif(r.value)}</span></div>
                    <p>{r.mission}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </details>

      {/* Adresses qui reçoivent automatiquement le poste de Président Fondateur */}
      <details className="g-card g-details">
        <summary><ShieldCheck size={16} /> Adresses de la Direction (accès total automatique)</summary>
        <p className="field-hint">
          Une personne qui se connecte avec l&#39;une de ces adresses devient automatiquement <strong>Président Fondateur</strong>, avec un accès total.
          Séparez les adresses par des virgules. L&#39;accès principal technique du système est conservé à part et ne peut pas être retiré ici.
        </p>
        <ActionForm action={majAdressesDirection} submitLabel="Enregistrer les adresses" className="g-form" submitClassName="btn-hero-primary btn-sm">
          <Field label="Adresses e-mail de la Direction" name="emails" defaultValue={adressesDirection} placeholder="president@exemple.com" />
        </ActionForm>
      </details>

      {/* Les responsables reçoivent un compte direct (e-mail ou pseudo + mot de passe) */}
      <details className="g-card g-details">
        <summary><UserPlus size={16} /> Créer le compte d&#39;un membre du personnel</summary>
        <p className="field-hint">
          Le compte est créé immédiatement avec son poste. La personne se connecte sur la page Connexion (« Personnel du centre ») avec
          son e-mail ou son pseudo et le mot de passe provisoire, qu&#39;elle change ensuite dans « Mon espace ».
        </p>
        <ActionForm action={creerResponsable} submitLabel="Créer le compte" className="g-form" submitClassName="btn-hero-primary btn-sm">
          <div className="form-grid">
            <Field label="Nom" name="nom" required />
            <Field label="Prénom(s)" name="prenom" required />
            <Field label="E-mail" name="email" type="email" required />
            <Field label="Téléphone" name="telephone" type="tel" />
            <label className="field"><span>Poste</span>
              <select name="role" required defaultValue="secretaire">
                {groupesRoles.map((g) => {
                  const roles = g.roles.filter((r) => ROLES_RESPONSABLES.includes(r.value));
                  return roles.length ? (
                    <optgroup key={g.cle} label={g.label}>
                      {roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </optgroup>
                  ) : null;
                })}
              </select>
            </label>
            <Field label="Pseudo de connexion (facultatif)" name="pseudo" placeholder="ex. secretariat" />
            <Field label="Mot de passe provisoire (facultatif)" name="mot_de_passe" hint="Laissé vide : un mot de passe sûr est généré." />
          </div>
        </ActionForm>
      </details>

      <div className="g-tabs">
        {FILTRES.map((f) => (
          <a key={f.key} href={`/gestion/comptes?filtre=${f.key}`} className={filtre === f.key ? "is-active" : ""}>
            {f.label} <span className="g-effectif">{visibles.filter((p) => dansFiltre(p, f.key)).length}</span>
          </a>
        ))}
      </div>

      {famille && (
        <p className="field-hint">{famille.aide} — postes : {rolesDeFamille(famille.cle as Famille).map(roleLabel).join(", ")}.</p>
      )}
      {profils.length === 0 && <p className="g-empty">Aucun compte dans cette catégorie.</p>}

      <div className="g-list">
        {profils.map((p) => {
          const verrouille = p.role === "principal" && !estPrincipal;
          return (
            <details key={p.id} className="g-card g-account" open={filtre === "attente"}>
              <summary>
                <div>
                  <strong>{nomComplet(p) || p.email}</strong>
                  <span>@{p.pseudo} · {p.email}</span>
                </div>
                <span className={`statut ${p.statut === "valide" ? "is-ok" : p.statut === "refuse" ? "is-ko" : "is-pending"}`}>
                  {p.statut === "valide"
                    ? p.fonction || roleLabel(p.role)
                    : p.statut === "refuse"
                      ? "Refusé"
                      : p.role === "candidat"
                        ? "Candidat — à valider"
                        : p.profil_complet ? "À valider" : "Profil incomplet"}
                </span>
              </summary>

              <div className="g-kv">
                <div><span>Poste</span><strong>{roleLabel(p.role)}</strong></div>
                <div><span>Se présente comme</span><strong>{typeLabel(p.type_demandeur)}</strong></div>
                <div><span>Naissance</span><strong>{p.date_naissance ? new Date(p.date_naissance).toLocaleDateString("fr-FR") : "—"} {p.lieu_naissance ? `à ${p.lieu_naissance}` : ""}</strong></div>
                <div><span>Téléphone</span><strong>{p.telephone ?? "—"}</strong></div>
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

              {verrouille ? (
                <p className="field-hint">Accès principal du système : ce compte ne peut pas être modifié ici.</p>
              ) : (
                <ActionForm action={majCompte} submitLabel="Enregistrer" className="g-form" submitClassName="btn-hero-primary btn-sm">
                  <input type="hidden" name="id" value={p.id} />
                  <div className="form-grid">
                    <label className="field">
                      <span>Poste attribué</span>
                      <select name="role" defaultValue={p.role}>
                        {groupesRoles.map((g) => (
                          <optgroup key={g.cle} label={g.label}>
                            {g.roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </optgroup>
                        ))}
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
                      <label><input type="checkbox" name="sections_perso" defaultChecked={!!p.sections} /> Choisir les rubriques une par une (sinon : rubriques par défaut du poste)</label>
                    </legend>
                    {SECTIONS_GESTION.filter((s) => !["tableau", "profil", "recherche"].includes(s.key)).map((s) => (
                      <label key={s.key}>
                        <input
                          type="checkbox"
                          name="sections"
                          value={s.key}
                          defaultChecked={p.sections ? p.sections.includes(s.key) : (s.roles as readonly string[]).includes(droitsDuRole(p.role))}
                        />
                        {s.label}
                      </label>
                    ))}
                  </fieldset>
                </ActionForm>
              )}
              {!verrouille && ROLES_RESPONSABLES.includes(p.role) && (
                <ActionForm action={reinitialiserMotDePasse} submitLabel="Générer un nouveau mot de passe" className="g-form" submitClassName="g-link-btn">
                  <input type="hidden" name="id" value={p.id} />
                </ActionForm>
              )}
            </details>
          );
        })}
      </div>
    </>
  );
}
