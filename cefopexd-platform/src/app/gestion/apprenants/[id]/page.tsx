import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Printer } from "lucide-react";
import ActionForm from "@/components/forms/ActionForm";
import { requireGestion, nomComplet } from "@/lib/session";
import ApprenantChamps, { type ApprenantDb } from "../ApprenantForm";
import { majApprenant } from "../../actions";

export const metadata: Metadata = { title: "Fiche apprenant" };

type Props = { params: Promise<{ id: string }> };
const STATUT: Record<string, string> = { present: "Présent", absent: "Absent", retard: "En retard", excuse: "Excusé" };

/* =============================================
   FICHE APPRENANT — identité, présences, parents rattachés
   ============================================= */
export default async function ApprenantDetail({ params }: Props) {
  const { id } = await params;
  const { supabase, role } = await requireGestion("apprenants");
  const [{ data: a }, { data: filieres }, { data: presences }, { data: parents }] = await Promise.all([
    supabase.from("apprenants").select("*, filieres(nom)").eq("id", id).maybeSingle<ApprenantDb & { filieres: { nom: string } | null }>(),
    supabase.from("filieres").select("id, nom").order("nom"),
    supabase.from("presences").select("jour, statut, motif").eq("apprenant_id", id).order("jour", { ascending: false }).limit(60),
    supabase.from("parents_apprenants").select("lien, profils(prenom, nom, pseudo, email, telephone)").eq("apprenant_id", id),
  ]);
  if (!a) notFound();

  const totaux = { absent: 0, retard: 0, excuse: 0 } as Record<string, number>;
  for (const p of presences ?? []) if (p.statut in totaux) totaux[p.statut]++;
  const peutModifier = ["dg", "admin", "secretaire"].includes(role);

  return (
    <>
      <div className="g-page-head">
        <Link href="/gestion/apprenants" className="g-back">← Tous les apprenants</Link>
        <h1>{a.prenom} {a.nom}</h1>
        <p>Matricule <strong>{a.matricule}</strong> · {a.filieres?.nom ?? "Filière non définie"} · <span className="statut is-ok">{a.statut}</span></p>
        <div className="g-actions">
          <Link href={`/gestion/apprenants/${a.id}/attestation`} target="_blank" className="btn-hero-ghost btn-sm"><Printer size={15} /> Attestation d&#39;inscription (PDF)</Link>
        </div>
      </div>

      <div className="g-stats">
        <div className="g-stat"><strong>{totaux.absent}</strong><span>Absences</span></div>
        <div className="g-stat"><strong>{totaux.retard}</strong><span>Retards</span></div>
        <div className="g-stat"><strong>{totaux.excuse}</strong><span>Absences excusées</span></div>
      </div>

      <div className="g-grid-2">
        <div className="g-card">
          <div className="g-card-head"><h2>Présences récentes</h2><Link href="/gestion/presences" className="g-link-btn">Faire l&#39;appel</Link></div>
          {(presences ?? []).length === 0 ? <p className="g-empty">Aucune présence enregistrée.</p> : (
            <table className="g-table g-table-compact">
              <thead><tr><th>Date</th><th>Statut</th><th>Motif</th></tr></thead>
              <tbody>
                {(presences ?? []).map((p) => (
                  <tr key={p.jour}><td>{new Date(p.jour).toLocaleDateString("fr-FR")}</td><td>{STATUT[p.statut]}</td><td>{p.motif ?? "—"}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="g-card">
          <div className="g-card-head"><h2>Parents rattachés</h2></div>
          {(parents ?? []).length === 0 ? (
            <p className="g-empty">Aucun parent rattaché. Le parent peut se rattacher depuis son espace avec le matricule {a.matricule} et la date de naissance de l&#39;élève.</p>
          ) : (
            <ul className="g-notifs">
              {((parents ?? []) as unknown as { lien: string | null; profils: { prenom: string | null; nom: string | null; pseudo: string; email: string; telephone: string | null } }[]).map((p) => (
                <li key={p.profils.email}>
                  <div><strong>{nomComplet(p.profils)}</strong><span>{p.lien ?? "Parent"} · {p.profils.email} {p.profils.telephone ? `· ${p.profils.telephone}` : ""}</span></div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {peutModifier && (
        <div className="g-card">
          <div className="g-card-head"><h2>Modifier la fiche</h2></div>
          <ActionForm action={majApprenant} submitLabel="Enregistrer" className="g-form" submitClassName="btn-hero-primary btn-sm">
            <input type="hidden" name="id" value={a.id} />
            <ApprenantChamps a={a} filieres={filieres ?? []} />
            <label className="field" style={{ maxWidth: 280 }}><span>Statut</span>
              <select name="statut" defaultValue={a.statut}>
                <option value="actif">Actif</option><option value="suspendu">Suspendu</option>
                <option value="diplome">Diplômé</option><option value="abandon">Abandon</option>
              </select>
            </label>
          </ActionForm>
        </div>
      )}
    </>
  );
}
