import type { Metadata } from "next";
import ListeDocuments, { type DocumentDb } from "@/components/ListeDocuments";
import { requireGestion } from "@/lib/session";
import { CATEGORIES_DOCUMENT } from "@/lib/roles";

export const metadata: Metadata = { title: "Documents" };

type Props = { searchParams: Promise<{ q?: string; categorie?: string }> };

/* =============================================
   DOCUMENTS — photos, CV, diplômes, rapports… déposés dans le système
   Le DG voit tout ; administration et secrétariat voient tout sauf les rapports.
   ============================================= */
export default async function DocumentsPage({ searchParams }: Props) {
  const { q = "", categorie = "" } = await searchParams;
  const { supabase, role } = await requireGestion("documents");
  let requete = supabase
    .from("documents")
    .select("id, categorie, titre, nom_fichier, taille, type_mime, created_at, proprietaire:profils!documents_proprietaire_id_fkey(prenom, nom, pseudo)")
    .order("created_at", { ascending: false })
    .limit(300);
  if (categorie) requete = requete.eq("categorie", categorie);
  if (q) {
    const s = q.replace(/[%,()]/g, "");
    requete = requete.or(`titre.ilike.%${s}%,nom_fichier.ilike.%${s}%`);
  }
  const { data } = await requete;
  const docs = (data ?? []) as unknown as DocumentDb[];

  return (
    <>
      <div className="g-page-head">
        <h1>Documents</h1>
        <p>
          {role === "dg"
            ? "Tous les documents déposés dans le système : photos d'identité, CV, diplômes, rapports… Consultez-les ou téléchargez-les."
            : "Documents déposés par les demandeurs (les rapports sont réservés au Directeur Général)."}
          {" "}Seul le DG peut modifier ou supprimer un document.
        </p>
      </div>
      <form className="g-search">
        <input type="search" name="q" defaultValue={q} placeholder="Nom du fichier ou titre…" />
        <select name="categorie" defaultValue={categorie}>
          <option value="">Toutes les catégories</option>
          {Object.entries(CATEGORIES_DOCUMENT).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button type="submit" className="btn-hero-primary btn-sm">Filtrer</button>
      </form>
      <div className="g-card">
        <p className="field-hint">{docs.length} document(s)</p>
        <ListeDocuments documents={docs} avecAuteur />
      </div>
    </>
  );
}
