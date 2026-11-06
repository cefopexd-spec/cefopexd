import Image from "next/image";
import type { ReactNode } from "react";
import { getSite } from "@/lib/site";
import { nonOptimise } from "@/lib/site/images";

/* =============================================
   MODÈLE DE DOCUMENT OFFICIEL IMPRIMABLE (format A4)
   En-tête au logo, titre, contenu, signatures et pied de page.
   Mise en forme réglée dans le Studio du site (onglet « Documents PDF »).
   ============================================= */
export default async function DocumentOfficiel({
  titre,
  reference,
  children,
  signatures,
}: {
  titre: string;
  reference?: string;
  children: ReactNode;
  signatures?: string[];
}) {
  const site = await getSite();
  const { documents: d, contact, identite } = site;
  const signataires = signatures ?? d.signaturesFiche;

  return (
    <article className={`doc-a4 ${d.cadre ? "doc-cadre" : ""}`} style={{ "--doc-couleur": d.couleur } as React.CSSProperties}>
      <header className="doc-head">
        <div className="doc-logo">
          <Image src={identite.logo} unoptimized={nonOptimise(identite.logo)} alt={identite.nom} fill sizes="200px" style={{ objectFit: "contain", objectPosition: "left center" }} />
        </div>
        <div className="doc-ident">
          <strong>{d.nomEtablissement}</strong>
          <span>{contact.localisation} — {contact.adresse}</span>
          <span>{contact.telephones.join(" / ")} — {contact.email}</span>
        </div>
      </header>
      <div className="doc-title">
        <h1>{titre}</h1>
        {reference && <span>{reference}</span>}
      </div>
      <div className="doc-body">{children}</div>
      <footer className="doc-sign">
        <span>Fait à {d.lieu}, le {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
        <div className="doc-sign-grid">
          {signataires.map((s) => (
            <div key={s}><strong>{s}</strong><span>Signature et cachet</span></div>
          ))}
        </div>
      </footer>
      {d.piedDePage && <p className="doc-foot">{d.piedDePage}</p>}
    </article>
  );
}

export function DocLigne({ label, valeur }: { label: string; valeur?: string | null }) {
  return (
    <div className="doc-line">
      <span>{label}</span>
      <strong>{valeur || "…………………………………………"}</strong>
    </div>
  );
}
