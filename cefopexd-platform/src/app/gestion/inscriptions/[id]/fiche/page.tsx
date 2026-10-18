import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DocumentOfficiel, { DocLigne } from "@/components/DocumentOfficiel";
import PrintButton from "@/components/PrintButton";
import { requireGestion } from "@/lib/session";
import { PIECES, STATUTS_INSCRIPTION } from "@/lib/roles";

export const metadata: Metadata = { title: "Fiche d'inscription" };

type Props = { params: Promise<{ id: string }> };
const dateFr = (d?: string | null) => (d ? new Date(d).toLocaleDateString("fr-FR") : "");

/* =============================================
   FICHE D'INSCRIPTION DÉFINITIVE — imprimable / PDF
   ============================================= */
export default async function FicheInscription({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireGestion("inscriptions");
  const { data: ins } = await supabase.from("inscriptions").select("*").eq("id", id).maybeSingle();
  if (!ins) notFound();
  const [{ data: apprenant }, { data: filiere }] = await Promise.all([
    ins.apprenant_id ? supabase.from("apprenants").select("matricule").eq("id", ins.apprenant_id).maybeSingle() : { data: null },
    supabase.from("filieres").select("nom, duree").eq("slug", (ins.dossier?.filiere_slug as string) ?? "").maybeSingle(),
  ]);
  const d = (ins.dossier ?? {}) as Record<string, string | string[] | null>;
  const pieces = (d.pieces as string[] | undefined) ?? [];

  return (
    <div className="doc-page">
      <div className="doc-toolbar no-print">
        <Link href={`/gestion/inscriptions/${id}`} className="g-back">← Retour au dossier</Link>
        <PrintButton />
      </div>

      <DocumentOfficiel
        titre="Fiche d'inscription"
        reference={`Réf. INS-${ins.id.slice(0, 8).toUpperCase()}${apprenant?.matricule ? ` — Matricule ${apprenant.matricule}` : ""} — ${STATUTS_INSCRIPTION[ins.statut]?.label ?? ""}`}
      >
        <h2 className="doc-section">Identité de l&#39;apprenant(e)</h2>
        <div className="doc-grid">
          <DocLigne label="Nom" valeur={ins.nom} />
          <DocLigne label="Prénom(s)" valeur={ins.prenom} />
          <DocLigne label="Sexe" valeur={d.sexe === "F" ? "Féminin" : d.sexe === "M" ? "Masculin" : ""} />
          <DocLigne label="Nationalité" valeur={d.nationalite as string} />
          <DocLigne label="Date de naissance" valeur={dateFr(ins.date_naissance)} />
          <DocLigne label="Lieu de naissance" valeur={ins.lieu_naissance} />
          <DocLigne label="Téléphone" valeur={ins.telephone} />
          <DocLigne label="E-mail" valeur={ins.email} />
          <DocLigne label="Adresse" valeur={d.adresse as string} />
        </div>

        <h2 className="doc-section">Formation</h2>
        <div className="doc-grid">
          <DocLigne label="Filière" valeur={filiere?.nom ?? ins.filiere} />
          <DocLigne label="Durée" valeur={filiere?.duree} />
          <DocLigne label="Niveau d'étude" valeur={(d.niveau_etude as string) ?? ins.niveau_etude} />
          <DocLigne label="Année académique" valeur={d.annee_academique as string} />
          <DocLigne label="Matricule" valeur={apprenant?.matricule} />
          <DocLigne label="Date de la demande" valeur={dateFr(ins.created_at)} />
        </div>

        <h2 className="doc-section">Parent / tuteur</h2>
        <div className="doc-grid">
          <DocLigne label="Nom complet" valeur={d.tuteur_nom as string} />
          <DocLigne label="Lien" valeur={d.tuteur_lien as string} />
          <DocLigne label="Téléphone" valeur={d.tuteur_telephone as string} />
          <DocLigne label="E-mail" valeur={d.tuteur_email as string} />
        </div>

        <h2 className="doc-section">Pièces du dossier</h2>
        <ul className="doc-checks">
          {PIECES.map((p) => (
            <li key={p}><span className="doc-box">{pieces.includes(p) ? "✔" : ""}</span>{p}</li>
          ))}
        </ul>

        {d.observations && (
          <>
            <h2 className="doc-section">Observations</h2>
            <p className="doc-text">{d.observations as string}</p>
          </>
        )}
        {ins.valide_le && <p className="doc-text"><strong>Inscription validée par le Directeur Général le {dateFr(ins.valide_le)}.</strong></p>}
      </DocumentOfficiel>
    </div>
  );
}
