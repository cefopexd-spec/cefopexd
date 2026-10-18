import type { Metadata } from "next";
import Link from "next/link";
import ActionForm from "@/components/forms/ActionForm";
import { requireGestion } from "@/lib/session";
import ApprenantChamps from "./ApprenantForm";
import { creerApprenant } from "../actions";

export const metadata: Metadata = { title: "Apprenants" };

type Props = { searchParams: Promise<{ q?: string; filiere?: string; statut?: string }> };
type Ligne = { id: string; matricule: string; nom: string; prenom: string; telephone: string | null; niveau_etude: string | null; statut: string; filieres: { nom: string } | null };

/* =============================================
   APPRENANTS — liste, recherche par nom ou matricule, ajout manuel
   ============================================= */
export default async function ApprenantsPage({ searchParams }: Props) {
  const { q = "", filiere = "", statut = "actif" } = await searchParams;
  const { supabase, role } = await requireGestion("apprenants");
  const { data: filieres } = await supabase.from("filieres").select("id, nom").order("nom");

  let requete = supabase.from("apprenants").select("id, matricule, nom, prenom, telephone, niveau_etude, statut, filieres(nom)").order("nom").limit(500);
  if (statut) requete = requete.eq("statut", statut);
  if (filiere) requete = requete.eq("filiere_id", filiere);
  if (q) {
    const s = q.replace(/[%,()]/g, "");
    requete = requete.or(`nom.ilike.%${s}%,prenom.ilike.%${s}%,matricule.ilike.%${s}%`);
  }
  const { data } = await requete;
  const lignes = (data ?? []) as unknown as Ligne[];
  const peutModifier = ["dg", "admin", "secretaire"].includes(role);

  return (
    <>
      <div className="g-page-head">
        <h1>Apprenants</h1>
        <p>Tous les apprenants inscrits, avec leur matricule attribué automatiquement.</p>
      </div>

      <form className="g-search">
        <input type="search" name="q" defaultValue={q} placeholder="Nom, prénom ou matricule…" />
        <select name="filiere" defaultValue={filiere}>
          <option value="">Toutes les filières</option>
          {(filieres ?? []).map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
        </select>
        <select name="statut" defaultValue={statut}>
          <option value="actif">Actifs</option>
          <option value="suspendu">Suspendus</option>
          <option value="diplome">Diplômés</option>
          <option value="abandon">Abandons</option>
          <option value="">Tous</option>
        </select>
        <button type="submit" className="btn-hero-primary btn-sm">Filtrer</button>
      </form>

      <div className="g-card g-table-wrap">
        <p className="field-hint">{lignes.length} apprenant(s)</p>
        {lignes.length === 0 ? <p className="g-empty">Aucun apprenant.</p> : (
          <table className="g-table">
            <thead><tr><th>Matricule</th><th>Nom</th><th>Filière</th><th>Niveau</th><th>Téléphone</th><th>Statut</th></tr></thead>
            <tbody>
              {lignes.map((a) => (
                <tr key={a.id}>
                  <td><Link href={`/gestion/apprenants/${a.id}`} className="g-ref">{a.matricule}</Link></td>
                  <td><Link href={`/gestion/apprenants/${a.id}`}><strong>{a.nom} {a.prenom}</strong></Link></td>
                  <td>{a.filieres?.nom ?? "—"}</td>
                  <td>{a.niveau_etude ?? "—"}</td>
                  <td>{a.telephone ?? "—"}</td>
                  <td><span className={`statut ${a.statut === "actif" ? "is-ok" : "is-pending"}`}>{a.statut}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {peutModifier && (
        <details className="g-card g-details">
          <summary>Ajouter un apprenant manuellement</summary>
          <p className="field-hint">Les inscriptions validées par le DG créent automatiquement l&#39;apprenant. Utilisez ce formulaire pour les inscriptions faites directement au centre.</p>
          <ActionForm action={creerApprenant} submitLabel="Créer l'apprenant" className="g-form" submitClassName="btn-hero-primary btn-sm">
            <ApprenantChamps filieres={filieres ?? []} />
          </ActionForm>
        </details>
      )}
    </>
  );
}
