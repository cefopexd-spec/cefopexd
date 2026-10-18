import type { Metadata } from "next";
import Link from "next/link";
import { requireGestion } from "@/lib/session";
import { STATUTS_INSCRIPTION, typeLabel } from "@/lib/roles";

export const metadata: Metadata = { title: "Inscriptions" };

type Props = { searchParams: Promise<{ statut?: string; q?: string }> };
type Ligne = { id: string; nom: string; prenom: string; filiere: string; niveau_etude: string | null; telephone: string; type_demandeur: string | null; statut: string; created_at: string };

/* =============================================
   INSCRIPTIONS — liste filtrable selon l'étape du circuit
   ============================================= */
export default async function InscriptionsPage({ searchParams }: Props) {
  const { statut = "", q = "" } = await searchParams;
  const { supabase } = await requireGestion("inscriptions");
  let requete = supabase.from("inscriptions").select("id, nom, prenom, filiere, niveau_etude, telephone, type_demandeur, statut, created_at").order("created_at", { ascending: false }).limit(300);
  if (statut) requete = requete.eq("statut", statut);
  if (q) requete = requete.or(`nom.ilike.%${q.replace(/[%,()]/g, "")}%,prenom.ilike.%${q.replace(/[%,()]/g, "")}%,telephone.ilike.%${q.replace(/[%,()]/g, "")}%`);
  const { data } = await requete;
  const lignes = (data ?? []) as Ligne[];

  return (
    <>
      <div className="g-page-head">
        <h1>Inscriptions</h1>
        <p>Pré-inscriptions reçues en ligne : le secrétariat les traite et les transmet, l&#39;administration complète le dossier, le DG valide.</p>
      </div>

      <div className="g-tabs">
        <Link href="/gestion/inscriptions" className={!statut ? "is-active" : ""}>Toutes</Link>
        {Object.entries(STATUTS_INSCRIPTION).map(([cle, s]) => (
          <Link key={cle} href={`/gestion/inscriptions?statut=${cle}`} className={statut === cle ? "is-active" : ""}>{s.label}</Link>
        ))}
      </div>

      <form className="g-search">
        {statut && <input type="hidden" name="statut" value={statut} />}
        <input type="search" name="q" defaultValue={q} placeholder="Rechercher un nom, un prénom ou un téléphone…" />
        <button type="submit" className="btn-hero-primary btn-sm">Rechercher</button>
      </form>

      <div className="g-card g-table-wrap">
        {lignes.length === 0 ? <p className="g-empty">Aucune inscription.</p> : (
          <table className="g-table">
            <thead>
              <tr><th>Référence</th><th>Demandeur</th><th>Profil</th><th>Filière</th><th>Téléphone</th><th>Reçue le</th><th>Étape</th></tr>
            </thead>
            <tbody>
              {lignes.map((l) => {
                const s = STATUTS_INSCRIPTION[l.statut] ?? STATUTS_INSCRIPTION.en_attente;
                return (
                  <tr key={l.id}>
                    <td><Link href={`/gestion/inscriptions/${l.id}`} className="g-ref">INS-{l.id.slice(0, 8).toUpperCase()}</Link></td>
                    <td><Link href={`/gestion/inscriptions/${l.id}`}><strong>{l.prenom} {l.nom}</strong></Link></td>
                    <td>{typeLabel(l.type_demandeur)}</td>
                    <td>{l.filiere}<br /><small>{l.niveau_etude}</small></td>
                    <td><a href={`tel:${l.telephone}`}>{l.telephone}</a></td>
                    <td>{new Date(l.created_at).toLocaleDateString("fr-FR")}</td>
                    <td><span className={`statut ${s.className}`}>{s.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
