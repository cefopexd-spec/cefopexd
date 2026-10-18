import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import ActionForm from "@/components/forms/ActionForm";
import { Field, TextAreaField } from "@/components/forms/SupabaseForm";
import { requireGestion } from "@/lib/session";
import { enregistrerPublication, supprimerPublication } from "../actions";

export const metadata: Metadata = { title: "Publications" };

type Pub = {
  id: string; titre: string; resume: string | null; contenu: string; categorie: string; public: boolean; cible: string;
  date_evenement: string | null; image_url: string | null; publie: boolean; created_at: string;
};

const CATEGORIES = [["actualite", "Actualité"], ["annonce", "Annonce"], ["evenement", "Événement"], ["formation", "Formation / session"]];
const CIBLES = [["tous", "Tout le monde"], ["apprenants", "Apprenants"], ["parents", "Parents"], ["professeurs", "Professeurs"], ["personnel", "Personnel"]];

/* =============================================
   PUBLICATIONS — actualités du site public et annonces internes
   ============================================= */
export default async function PublicationsPage() {
  const { supabase } = await requireGestion("publications");
  const { data } = await supabase.from("publications").select("*").order("created_at", { ascending: false });
  const pubs = (data ?? []) as Pub[];

  return (
    <>
      <div className="g-page-head">
        <h1>Publications</h1>
        <p>Publiez des actualités et événements sur le site (rubrique « Actualités & annonces ») ou des annonces internes visibles seulement dans les espaces des apprenants, parents, professeurs ou du personnel.</p>
      </div>

      <details className="g-card g-details" open={pubs.length === 0}>
        <summary>Nouvelle publication</summary>
        <PubForm />
      </details>

      <div className="g-list">
        {pubs.map((p) => (
          <details key={p.id} className="g-card g-account">
            <summary>
              <div>
                <strong>{p.titre}</strong>
                <span>{CATEGORIES.find((c) => c[0] === p.categorie)?.[1]} · {new Date(p.created_at).toLocaleDateString("fr-FR")} · {p.public ? "Site public" : `Interne (${CIBLES.find((c) => c[0] === p.cible)?.[1]})`}</span>
              </div>
              <span className={`statut ${p.publie ? "is-ok" : "is-pending"}`}>{p.publie ? "Publié" : "Brouillon"}</span>
            </summary>
            <PubForm p={p} />
            <form action={supprimerPublication.bind(null, p.id)} className="g-danger-zone">
              <button className="g-link-btn g-danger"><Trash2 size={14} /> Supprimer cette publication</button>
            </form>
          </details>
        ))}
      </div>
    </>
  );
}

function PubForm({ p }: { p?: Pub }) {
  return (
    <ActionForm action={enregistrerPublication} submitLabel={p ? "Enregistrer" : "Publier"} className="g-form" submitClassName="btn-hero-primary btn-sm">
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="form-grid">
        <Field label="Titre" name="titre" required defaultValue={p?.titre ?? ""} />
        <label className="field"><span>Catégorie</span>
          <select name="categorie" defaultValue={p?.categorie ?? "actualite"}>{CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </label>
        <Field label="Date de l'événement (facultatif)" name="date_evenement" type="datetime-local" defaultValue={p?.date_evenement?.slice(0, 16) ?? ""} />
        <Field label="Image (adresse, facultatif)" name="image_url" defaultValue={p?.image_url ?? ""} placeholder="/images/campus-cefopexd.jpg" />
        <Field label="Résumé (affiché dans la liste)" name="resume" defaultValue={p?.resume ?? ""} />
        <label className="field"><span>Destinataires des annonces internes</span>
          <select name="cible" defaultValue={p?.cible ?? "tous"}>{CIBLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </label>
        <TextAreaField label="Contenu" name="contenu" required defaultValue={p?.contenu ?? ""} rows={6} />
      </div>
      <div className="g-checks">
        <label><input type="checkbox" name="public" defaultChecked={p ? p.public : true} /> Visible sur le site public</label>
        <label><input type="checkbox" name="publie" defaultChecked={p ? p.publie : true} /> Publier maintenant (sinon : brouillon)</label>
      </div>
    </ActionForm>
  );
}
