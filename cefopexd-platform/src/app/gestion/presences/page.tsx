import type { Metadata } from "next";
import ActionForm from "@/components/forms/ActionForm";
import { requireGestion } from "@/lib/session";
import { STATUTS_PRESENCE } from "@/lib/roles";
import { enregistrerPresences } from "../actions";

export const metadata: Metadata = { title: "Présences" };

type Props = { searchParams: Promise<{ filiere?: string; jour?: string }> };

/* =============================================
   PRÉSENCES — appel du jour par filière ; les parents voient les absences
   ============================================= */
export default async function PresencesPage({ searchParams }: Props) {
  const params = await searchParams;
  const jour = params.jour || new Date().toISOString().slice(0, 10);
  const { supabase } = await requireGestion("presences");
  const { data: filieres } = await supabase.from("filieres").select("id, nom").order("nom");
  const filiere = params.filiere || filieres?.[0]?.id || "";

  const { data: apprenants } = filiere
    ? await supabase.from("apprenants").select("id, matricule, nom, prenom").eq("filiere_id", filiere).eq("statut", "actif").order("nom")
    : { data: [] };
  const ids = (apprenants ?? []).map((a) => a.id);
  const { data: existantes } = ids.length
    ? await supabase.from("presences").select("apprenant_id, statut, motif").eq("jour", jour).in("apprenant_id", ids)
    : { data: [] };
  const deja = new Map((existantes ?? []).map((p) => [p.apprenant_id, p]));

  return (
    <>
      <div className="g-page-head">
        <h1>Présences</h1>
        <p>Faites l&#39;appel par filière. Les absences et retards apparaissent dans l&#39;espace des parents rattachés et de l&#39;apprenant.</p>
      </div>

      <form className="g-search">
        <select name="filiere" defaultValue={filiere}>
          {(filieres ?? []).map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
        </select>
        <input type="date" name="jour" defaultValue={jour} />
        <button type="submit" className="btn-hero-primary btn-sm">Afficher la liste</button>
      </form>

      <div className="g-card">
        {(apprenants ?? []).length === 0 ? <p className="g-empty">Aucun apprenant actif dans cette filière.</p> : (
          <ActionForm action={enregistrerPresences} submitLabel="Enregistrer l'appel" className="g-form" submitClassName="btn-hero-primary btn-sm">
            <input type="hidden" name="jour" value={jour} />
            <div className="g-table-wrap">
              <table className="g-table">
                <thead><tr><th>Apprenant</th>{STATUTS_PRESENCE.map((s) => <th key={s.value}>{s.label}</th>)}<th>Motif / heure d&#39;arrivée</th></tr></thead>
                <tbody>
                  {(apprenants ?? []).map((a) => {
                    const actuel = deja.get(a.id)?.statut ?? "present";
                    return (
                      <tr key={a.id}>
                        <td><input type="hidden" name="apprenant_id" value={a.id} /><strong>{a.nom} {a.prenom}</strong><br /><small>{a.matricule}</small></td>
                        {STATUTS_PRESENCE.map((s) => (
                          <td key={s.value} className="g-radio">
                            <input type="radio" name={`statut_${a.id}`} value={s.value} defaultChecked={actuel === s.value} aria-label={`${s.label} — ${a.prenom} ${a.nom}`} />
                          </td>
                        ))}
                        <td><input className="g-input" name={`motif_${a.id}`} defaultValue={deja.get(a.id)?.motif ?? ""} placeholder="Facultatif" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ActionForm>
        )}
      </div>
    </>
  );
}
