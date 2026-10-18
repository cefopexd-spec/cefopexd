import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { requireGestion } from "@/lib/session";
import { dateHeure } from "@/lib/roles";

export const metadata: Metadata = { title: "Recherche" };

type Props = { searchParams: Promise<{ q?: string }> };
type Resultat = { type: string; id: string; titre: string; detail: string | null; lien: string; date: string };

/* =============================================
   RECHERCHE GLOBALE — apprenants, inscriptions, comptes, professeurs,
   documents, rapports, publications, demandes (selon les droits de chacun)
   ============================================= */
export default async function RecherchePage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const { supabase } = await requireGestion("recherche");
  const terme = q.trim();
  const { data } = terme.length >= 2 ? await supabase.rpc("recherche_globale", { q: terme }) : { data: [] };
  const resultats = (data ?? []) as Resultat[];
  const groupes = resultats.reduce<Record<string, Resultat[]>>((acc, r) => ((acc[r.type] ??= []).push(r), acc), {});

  return (
    <>
      <div className="g-page-head">
        <h1>Recherche</h1>
        <p>Tapez un nom, un matricule, un téléphone, un pseudo, un titre de document ou de rapport…</p>
      </div>
      <form className="g-search g-search-big">
        <input type="search" name="q" defaultValue={q} placeholder="Rechercher dans tout le système…" autoFocus />
        <button type="submit" className="btn-hero-primary btn-sm"><Search size={16} /> Rechercher</button>
      </form>
      {terme.length >= 2 && resultats.length === 0 && <p className="g-empty">Aucun résultat pour « {terme} ».</p>}
      {Object.entries(groupes).map(([type, items]) => (
        <div key={type} className="g-card">
          <div className="g-card-head"><h2>{type}s <span className="g-badge g-badge-neutre">{items.length}</span></h2></div>
          <ul className="g-notifs">
            {items.map((r) => (
              <li key={r.type + r.id}>
                <div><strong>{r.titre}</strong><span>{r.detail} · {dateHeure(r.date)}</span></div>
                <Link href={r.lien}>Ouvrir</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
