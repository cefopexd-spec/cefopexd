import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DocumentOfficiel, { DocLigne } from "@/components/DocumentOfficiel";
import PrintButton from "@/components/PrintButton";
import ActionForm from "@/components/forms/ActionForm";
import { Field } from "@/components/forms/SupabaseForm";
import { requireGestion, nomComplet } from "@/lib/session";
import { enLettres, fcfa, MODES_PAIEMENT } from "@/lib/paiements";
import { annulerPaiement } from "../../../actions";

export const metadata: Metadata = { title: "Reçu de paiement" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ nouveau?: string }> };

/* =============================================
   REÇU DE PAIEMENT — imprimable / PDF (uniquement les informations enregistrées)
   ============================================= */
export default async function Recu({ params, searchParams }: Props) {
  const [{ id }, { nouveau }] = await Promise.all([params, searchParams]);
  const { supabase, role } = await requireGestion("paiements");
  const { data: p } = await supabase
    .from("paiements")
    .select("*, apprenants(matricule, nom, prenom, annee_academique, filieres(nom)), caissier:profils!paiements_enregistre_par_fkey(prenom, nom, pseudo)")
    .eq("id", id)
    .maybeSingle();
  if (!p) notFound();
  const a = p.apprenants as { matricule: string | null; nom: string; prenom: string; annee_academique: string | null; filieres: { nom: string } | null } | null;
  const caissier = p.caissier as { prenom: string | null; nom: string | null; pseudo: string } | null;
  const peutAnnuler = ["dg", "admin", "comptable"].includes(role) && !p.annule;

  return (
    <div className="doc-page">
      <div className="doc-toolbar no-print">
        <Link href="/gestion/paiements" className="g-back">← Paiements</Link>
        <PrintButton label="Imprimer le reçu / PDF" />
      </div>
      {nouveau && <p className="st-succes no-print">Paiement enregistré : reçu n° {p.numero}.</p>}

      <DocumentOfficiel titre="Reçu de paiement" reference={`N° ${p.numero}${p.annule ? " — ANNULÉ" : ""}`} signatures={["Le caissier / la comptabilité", "Le payeur"]}>
        {p.annule && <p className="doc-annule">REÇU ANNULÉ{p.motif_annulation ? ` — ${p.motif_annulation}` : ""}</p>}
        <h2 className="doc-section">Apprenant</h2>
        <div className="doc-grid">
          <DocLigne label="Nom et prénom(s)" valeur={a ? `${a.nom.toUpperCase()} ${a.prenom}` : null} />
          <DocLigne label="Matricule" valeur={a?.matricule} />
          <DocLigne label="Filière" valeur={a?.filieres?.nom} />
          <DocLigne label="Année académique" valeur={p.annee_academique ?? a?.annee_academique} />
        </div>
        <h2 className="doc-section">Paiement</h2>
        <div className="doc-grid">
          <DocLigne label="Date" valeur={new Date(p.date_paiement).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} />
          <DocLigne label="Motif" valeur={p.motif} />
          <DocLigne label="Mode de paiement" valeur={MODES_PAIEMENT[p.mode] ?? p.mode} />
          {p.reference && <DocLigne label="Référence" valeur={p.reference} />}
          {caissier && <DocLigne label="Encaissé par" valeur={nomComplet(caissier)} />}
        </div>
        <div className="doc-montant">
          <span>Montant reçu</span>
          <strong>{fcfa(p.montant)}</strong>
          <em>Arrêté le présent reçu à la somme de : {enLettres(Number(p.montant))} francs CFA.</em>
        </div>
        {p.observations && <p className="doc-text"><strong>Observations :</strong> {p.observations}</p>}
      </DocumentOfficiel>

      {peutAnnuler && (
        <details className="g-card g-details no-print" style={{ maxWidth: "210mm", width: "100%" }}>
          <summary>Annuler ce reçu</summary>
          <ActionForm action={annulerPaiement} submitLabel="Annuler le reçu" className="g-form" submitClassName="btn-hero-red btn-sm">
            <input type="hidden" name="id" value={p.id} />
            <Field label="Motif de l'annulation" name="motif_annulation" required />
          </ActionForm>
        </details>
      )}
    </div>
  );
}
