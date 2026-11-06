import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DocumentOfficiel from "@/components/DocumentOfficiel";
import PrintButton from "@/components/PrintButton";
import { requireGestion } from "@/lib/session";
import { getSite } from "@/lib/site";

export const metadata: Metadata = { title: "Attestation d'inscription" };

type Props = { params: Promise<{ id: string }> };

/* =============================================
   ATTESTATION D'INSCRIPTION — modèle imprimable / PDF
   ============================================= */
export default async function Attestation({ params }: Props) {
  const { id } = await params;
  const [{ supabase }, site] = await Promise.all([requireGestion("apprenants"), getSite()]);
  const D = site.documents;
  const { data: a } = await supabase.from("apprenants").select("*, filieres(nom, duree)").eq("id", id).maybeSingle();
  if (!a) notFound();
  const naissance = a.date_naissance ? new Date(a.date_naissance).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "…………";

  return (
    <div className="doc-page">
      <div className="doc-toolbar no-print">
        <Link href={`/gestion/apprenants/${id}`} className="g-back">← Retour à la fiche</Link>
        <PrintButton />
      </div>
      <DocumentOfficiel titre={D.titreAttestation} reference={`Matricule ${a.matricule}`} signatures={D.signaturesAttestation}>
        <p className="doc-text doc-attest">
          {D.introAttestation}
          {" "}<strong>{a.sexe === "F" ? "Mademoiselle / Madame" : a.sexe === "M" ? "Monsieur" : ""} {a.prenom} {a.nom.toUpperCase()}</strong>,
          né{a.sexe === "F" ? "e" : ""} le <strong>{naissance}</strong>{a.lieu_naissance ? <> à <strong>{a.lieu_naissance}</strong></> : null},
          est régulièrement inscrit{a.sexe === "F" ? "e" : ""} au {site.identite.nom}
          {a.filieres?.nom ? <> en filière <strong>{a.filieres.nom}</strong></> : null}
          {a.annee_academique ? <> pour l&#39;année académique <strong>{a.annee_academique}</strong></> : null},
          sous le matricule <strong>{a.matricule}</strong>.
        </p>
        <p className="doc-text">{D.finAttestation}</p>
      </DocumentOfficiel>
    </div>
  );
}
