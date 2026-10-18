import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import ActionForm from "@/components/forms/ActionForm";
import { Field, TextAreaField } from "@/components/forms/SupabaseForm";
import { requireGestion, nomComplet } from "@/lib/session";
import { dateHeure } from "@/lib/roles";
import { enregistrerPublication, refuserPublication, supprimerPublication, validerPublication } from "../actions";

export const metadata: Metadata = { title: "Publications" };

type Props = { searchParams: Promise<{ statut?: string }> };
type Pub = {
  id: string; titre: string; resume: string | null; contenu: string; categorie: string; public: boolean; cible: string;
  date_evenement: string | null; image_url: string | null; statut: string; motif_refus: string | null;
  valide_le: string | null; created_at: string; auteur_id: string;
  auteur: { prenom: string | null; nom: string | null; pseudo: string } | null;
  validateur: { prenom: string | null; nom: string | null; pseudo: string } | null;
};

const CATEGORIES = [["actualite", "Actualité"], ["annonce", "Annonce"], ["evenement", "Événement"], ["formation", "Formation / session"]];
const CIBLES = [["tous", "Tout le monde"], ["apprenants", "Apprenants"], ["parents", "Parents"], ["professeurs", "Professeurs"], ["personnel", "Personnel"]];
const STATUTS: Record<string, [string, string]> = {
  brouillon: ["Brouillon", "is-pending"], soumise: ["En attente du DG", "is-progress"], publiee: ["Publiée", "is-ok"], refusee: ["Refusée", "is-ko"],
};

/* =============================================
   PUBLICATIONS — annonces, événements, formations
   Le personnel prépare et soumet ; rien n'est publié sans l'accord du DG.
   ============================================= */
export default async function PublicationsPage({ searchParams }: Props) {
  const { statut = "" } = await searchParams;
  const { supabase, role, user } = await requireGestion("publications");
  let requete = supabase
    .from("publications")
    .select("*, auteur:profils!publications_auteur_id_fkey(prenom, nom, pseudo), validateur:profils!publications_valide_par_fkey(prenom, nom, pseudo)")
    .order("created_at", { ascending: false });
  if (statut) requete = requete.eq("statut", statut);
  const { data } = await requete;
  const pubs = (data ?? []) as unknown as Pub[];
  const estDG = role === "dg";

  return (
    <>
      <div className="g-page-head">
        <h1>Publications</h1>
        <p>
          {estDG
            ? "Validez les annonces, événements et formations préparés par vos équipes : rien n'apparaît sur le site ou dans les espaces sans votre accord."
            : "Préparez une annonce, un événement ou une formation, puis soumettez-la : elle sera publiée après validation du Directeur Général."}
        </p>
      </div>

      <div className="g-tabs">
        {[["", "Toutes"], ["soumise", "En attente du DG"], ["publiee", "Publiées"], ["brouillon", "Brouillons"], ["refusee", "Refusées"]].map(([v, l]) => (
          <Link key={v} href={`/gestion/publications?statut=${v}`} className={statut === v ? "is-active" : ""}>{l}</Link>
        ))}
      </div>

      <details className="g-card g-details" open={pubs.length === 0}>
        <summary>Nouvelle publication</summary>
        <PubForm estDG={estDG} />
      </details>

      <div className="g-list">
        {pubs.map((p) => {
          const [label, classe] = STATUTS[p.statut] ?? STATUTS.soumise;
          const modifiable = estDG || (p.auteur_id === user!.id && p.statut === "brouillon");
          return (
            <details key={p.id} className="g-card g-account" open={estDG && p.statut === "soumise"}>
              <summary>
                <div>
                  <strong>{p.titre}</strong>
                  <span>
                    {CATEGORIES.find((c) => c[0] === p.categorie)?.[1]} · par {nomComplet(p.auteur)} le {dateHeure(p.created_at)} ·{" "}
                    {p.public ? "site public" : `interne (${CIBLES.find((c) => c[0] === p.cible)?.[1]})`}
                  </span>
                </div>
                <span className={`statut ${classe}`}>{label}</span>
              </summary>

              {p.valide_le && <p className="g-validation">Publiée le {dateHeure(p.valide_le)} par {nomComplet(p.validateur)}</p>}
              {p.statut === "refusee" && p.motif_refus && <p className="g-motif"><strong>Motif du refus :</strong> {p.motif_refus}</p>}

              {estDG && p.statut === "soumise" && (
                <div className="g-actions">
                  <form action={validerPublication.bind(null, p.id)}><button className="btn-hero-primary btn-sm">Valider et publier</button></form>
                  <details className="g-details">
                    <summary>Refuser</summary>
                    <ActionForm action={refuserPublication} submitLabel="Confirmer le refus" className="g-form" submitClassName="btn-hero-red btn-sm">
                      <input type="hidden" name="id" value={p.id} />
                      <TextAreaField label="Motif (transmis à l'auteur)" name="motif_refus" rows={2} />
                    </ActionForm>
                  </details>
                </div>
              )}

              {modifiable ? (
                <PubForm p={p} estDG={estDG} />
              ) : (
                <>
                  {p.resume && <p className="pub-resume">{p.resume}</p>}
                  <p className="g-rapport">{p.contenu}</p>
                </>
              )}
              {modifiable && (
                <form action={supprimerPublication.bind(null, p.id)} className="g-danger-zone">
                  <button className="g-link-btn g-danger"><Trash2 size={14} /> Supprimer</button>
                </form>
              )}
            </details>
          );
        })}
      </div>
    </>
  );
}

function PubForm({ p, estDG }: { p?: Pub; estDG: boolean }) {
  return (
    <ActionForm action={enregistrerPublication} submitLabel={estDG ? "Publier maintenant" : "Soumettre au DG"} className="g-form" submitClassName="btn-hero-primary btn-sm">
      {p && <input type="hidden" name="id" value={p.id} />}
      <input type="hidden" name="intention" value={estDG ? "publier" : "soumettre"} />
      <div className="form-grid">
        <Field label="Titre" name="titre" required defaultValue={p?.titre ?? ""} />
        <label className="field"><span>Catégorie</span>
          <select name="categorie" defaultValue={p?.categorie ?? "annonce"}>{CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </label>
        <Field label="Date et heure de l'événement (facultatif)" name="date_evenement" type="datetime-local" defaultValue={p?.date_evenement?.slice(0, 16) ?? ""} />
        <Field label="Image (adresse, facultatif)" name="image_url" defaultValue={p?.image_url ?? ""} placeholder="/images/campus-cefopexd.jpg" />
        <Field label="Résumé (affiché dans la liste)" name="resume" defaultValue={p?.resume ?? ""} />
        <label className="field"><span>Destinataires des annonces internes</span>
          <select name="cible" defaultValue={p?.cible ?? "tous"}>{CIBLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </label>
        <TextAreaField label="Contenu" name="contenu" required defaultValue={p?.contenu ?? ""} rows={6} />
      </div>
      <div className="g-checks">
        <label><input type="checkbox" name="public" defaultChecked={p ? p.public : true} /> Visible sur le site public</label>
      </div>
      <p className="field-hint">
        {estDG ? "Vous publiez directement." : "Pour enregistrer sans envoyer, cochez « Brouillon » :"}{" "}
        {!estDG && <label><input type="checkbox" name="intention" value="brouillon" /> Brouillon (non transmis au DG)</label>}
      </p>
    </ActionForm>
  );
}
