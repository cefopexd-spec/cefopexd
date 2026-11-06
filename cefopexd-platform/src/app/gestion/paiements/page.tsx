import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Printer } from "lucide-react";
import ActionForm from "@/components/forms/ActionForm";
import { Field } from "@/components/forms/SupabaseForm";
import { requireGestion } from "@/lib/session";
import { fcfa, MODES_PAIEMENT, MOTIFS_PAIEMENT } from "@/lib/paiements";
import { enregistrerPaiement } from "../actions";

export const metadata: Metadata = { title: "Paiements & reçus" };

type Props = { searchParams: Promise<{ apprenant?: string; du?: string; au?: string; q?: string }> };
type Paiement = {
  id: string; numero: string; montant: number; motif: string; mode: string; date_paiement: string;
  annule: boolean; apprenant_id: string; apprenants: { matricule: string | null; nom: string; prenom: string } | null;
};

/* =============================================
   PAIEMENTS & REÇUS — encaissements de la caisse, reçus numérotés imprimables
   ============================================= */
export default async function PaiementsPage({ searchParams }: Props) {
  const { apprenant = "", du = "", au = "", q = "" } = await searchParams;
  const { supabase, role } = await requireGestion("paiements");
  const peutEncaisser = ["dg", "admin", "comptable"].includes(role);

  let requete = supabase
    .from("paiements")
    .select("id, numero, montant, motif, mode, date_paiement, annule, apprenant_id, apprenants(matricule, nom, prenom)")
    .order("date_paiement", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(300);
  if (apprenant) requete = requete.eq("apprenant_id", apprenant);
  if (du) requete = requete.gte("date_paiement", du);
  if (au) requete = requete.lte("date_paiement", au);

  const [{ data, error }, { data: apprenants }] = await Promise.all([
    requete,
    supabase.from("apprenants").select("id, matricule, nom, prenom, annee_academique").order("nom").limit(1000),
  ]);
  let paiements = (data ?? []) as unknown as Paiement[];
  if (q) {
    const r = q.toLowerCase();
    paiements = paiements.filter((p) => [p.numero, p.motif, p.apprenants?.nom, p.apprenants?.prenom, p.apprenants?.matricule].some((x) => x?.toLowerCase().includes(r)));
  }
  const valides = paiements.filter((p) => !p.annule);
  const total = valides.reduce((s, p) => s + Number(p.montant), 0);
  const choisi = (apprenants ?? []).find((a) => a.id === apprenant);

  return (
    <>
      <div className="g-page-head">
        <h1>Paiements & reçus</h1>
        <p>Enregistrez chaque encaissement : un reçu numéroté est créé automatiquement, prêt à imprimer. Un reçu n&#39;est jamais supprimé, il peut seulement être annulé avec un motif.</p>
      </div>

      {error && <p className="st-erreur">Module indisponible : {error.message}. La mise à jour Supabase « organigramme » doit être appliquée.</p>}

      {peutEncaisser && (
        <details className="g-card g-details" open={!!apprenant}>
          <summary><Plus size={16} /> Enregistrer un paiement</summary>
          <ActionForm action={enregistrerPaiement} submitLabel="Enregistrer et imprimer le reçu" className="g-form" submitClassName="btn-hero-primary btn-sm">
            <div className="form-grid">
              <label className="field"><span>Apprenant *</span>
                <select name="apprenant_id" required defaultValue={apprenant}>
                  <option value="">— Choisir —</option>
                  {(apprenants ?? []).map((a) => <option key={a.id} value={a.id}>{a.nom.toUpperCase()} {a.prenom} {a.matricule ? `(${a.matricule})` : ""}</option>)}
                </select>
              </label>
              <Field label="Montant (F CFA)" name="montant" required placeholder="25 000" />
              <label className="field"><span>Motif *</span>
                <select name="motif" required defaultValue="">
                  <option value="">— Choisir —</option>
                  {MOTIFS_PAIEMENT.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label className="field"><span>Mode de paiement</span>
                <select name="mode" defaultValue="especes">
                  {Object.entries(MODES_PAIEMENT).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
              <Field label="Référence (n° de transaction, chèque…)" name="reference" />
              <Field label="Date du paiement" name="date_paiement" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              <Field label="Année académique" name="annee_academique" defaultValue={choisi?.annee_academique ?? ""} placeholder="2026-2027" />
              <Field label="Observations" name="observations" />
            </div>
          </ActionForm>
        </details>
      )}

      <form className="g-filtres" method="get">
        <label className="field"><span>Apprenant</span>
          <select name="apprenant" defaultValue={apprenant}>
            <option value="">Tous</option>
            {(apprenants ?? []).map((a) => <option key={a.id} value={a.id}>{a.nom.toUpperCase()} {a.prenom}</option>)}
          </select>
        </label>
        <label className="field"><span>Du</span><input type="date" name="du" defaultValue={du} /></label>
        <label className="field"><span>Au</span><input type="date" name="au" defaultValue={au} /></label>
        <label className="field"><span>Recherche</span><input type="search" name="q" defaultValue={q} placeholder="N° de reçu, nom, motif…" /></label>
        <button type="submit" className="btn-hero-primary btn-sm">Filtrer</button>
      </form>

      <div className="g-stats">
        <div className="g-stat"><strong>{fcfa(total)}</strong><span>Total encaissé{apprenant || du || au || q ? " (sélection)" : ""}</span></div>
        <div className="g-stat"><strong>{valides.length}</strong><span>Reçus valides</span></div>
        <div className="g-stat"><strong>{paiements.length - valides.length}</strong><span>Reçus annulés</span></div>
      </div>

      <div className="g-card">
        {paiements.length === 0 ? <p className="g-empty">Aucun paiement enregistré.</p> : (
          <table className="g-table">
            <thead><tr><th>Reçu</th><th>Date</th><th>Apprenant</th><th>Motif</th><th>Mode</th><th style={{ textAlign: "right" }}>Montant</th><th /></tr></thead>
            <tbody>
              {paiements.map((p) => (
                <tr key={p.id} className={p.annule ? "is-annule" : ""}>
                  <td><strong>{p.numero}</strong>{p.annule && <span className="statut is-ko">annulé</span>}</td>
                  <td>{new Date(p.date_paiement).toLocaleDateString("fr-FR")}</td>
                  <td><Link href={`/gestion/paiements?apprenant=${p.apprenant_id}`}>{p.apprenants ? `${p.apprenants.nom.toUpperCase()} ${p.apprenants.prenom}` : "—"}</Link></td>
                  <td>{p.motif}</td>
                  <td>{MODES_PAIEMENT[p.mode] ?? p.mode}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{fcfa(p.montant)}</td>
                  <td><Link href={`/gestion/paiements/${p.id}/recu`} target="_blank" className="g-link-btn"><Printer size={14} /> Reçu</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
