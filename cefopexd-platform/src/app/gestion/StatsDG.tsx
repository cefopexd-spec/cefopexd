import Link from "next/link";
import MiniBarres from "@/components/MiniBarres";
import type { SupabaseClient } from "@supabase/supabase-js";

/* =============================================
   STATISTIQUES DU DG — activité de tout le système
   par jour (30 j), semaine (12), mois (12) ou année (5)
   ============================================= */
const PERIODES = {
  day: { label: "Par jour", nombre: 30, format: (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) },
  week: { label: "Par semaine", nombre: 12, format: (d: Date) => `sem. ${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}` },
  month: { label: "Par mois", nombre: 12, format: (d: Date) => d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }) },
  year: { label: "Par année", nombre: 5, format: (d: Date) => String(d.getFullYear()) },
} as const;
export type Periode = keyof typeof PERIODES;

type Ligne = { periode: string; actions: number; inscriptions: number; visites: number; comptes: number; messages: number };

export default async function StatsDG({ supabase, periode }: { supabase: SupabaseClient; periode: Periode }) {
  const conf = PERIODES[periode] ?? PERIODES.day;
  const { data, error } = await supabase.rpc("stats_activite", { p_unite: periode, p_nombre: conf.nombre });
  if (error) return <p className="g-empty">Statistiques indisponibles : {error.message}</p>;
  const lignes = (data ?? []) as Ligne[];
  const serie = (cle: keyof Omit<Ligne, "periode">) =>
    lignes.map((l) => ({ label: conf.format(new Date(`${l.periode}T12:00:00`)), valeur: Number(l[cle]) }));
  const total = (cle: keyof Omit<Ligne, "periode">) => lignes.reduce((s, l) => s + Number(l[cle]), 0);

  return (
    <div className="g-card">
      <div className="g-card-head">
        <h2>Activité du système</h2>
        <div className="g-tabs g-tabs-small">
          {(Object.keys(PERIODES) as Periode[]).map((p) => (
            <Link key={p} href={`/gestion?periode=${p}`} className={p === periode ? "is-active" : ""} scroll={false}>{PERIODES[p].label}</Link>
          ))}
        </div>
      </div>
      <div className="mini-charts">
        <MiniBarres titre="Visites du site" points={serie("visites")} total={total("visites")} />
        <MiniBarres titre="Pré-inscriptions reçues" points={serie("inscriptions")} total={total("inscriptions")} />
        <MiniBarres titre="Comptes créés" points={serie("comptes")} total={total("comptes")} />
        <MiniBarres titre="Actions des équipes" points={serie("actions")} total={total("actions")} />
        <MiniBarres titre="Messages échangés" points={serie("messages")} total={total("messages")} />
      </div>
    </div>
  );
}
