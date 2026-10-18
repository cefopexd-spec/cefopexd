import Image from "next/image";
import type { ReactNode } from "react";
import { CONTACT } from "@/lib/site-content";

/* =============================================
   MODÈLE DE DOCUMENT OFFICIEL IMPRIMABLE (format A4)
   En-tête au logo, titre, contenu, signatures et pied de page.
   ============================================= */
export default function DocumentOfficiel({
  titre,
  reference,
  children,
  signatures = ["L'administration", "Le Directeur Général"],
}: {
  titre: string;
  reference?: string;
  children: ReactNode;
  signatures?: string[];
}) {
  return (
    <article className="doc-a4">
      <header className="doc-head">
        <div className="doc-logo">
          <Image src="/logo-cefopexd.png" alt="CeFoPExD" fill sizes="200px" style={{ objectFit: "contain", objectPosition: "left center" }} />
        </div>
        <div className="doc-ident">
          <strong>Centre de Formation Professionnelle d&#39;Excellence de Dévikinmé</strong>
          <span>{CONTACT.localisation} — {CONTACT.adresse}</span>
          <span>{CONTACT.telephones.join(" / ")} — {CONTACT.email}</span>
        </div>
      </header>
      <div className="doc-title">
        <h1>{titre}</h1>
        {reference && <span>{reference}</span>}
      </div>
      <div className="doc-body">{children}</div>
      <footer className="doc-sign">
        <span>Fait à Dévikinmé, le {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
        <div className="doc-sign-grid">
          {signatures.map((s) => (
            <div key={s}><strong>{s}</strong><span>Signature et cachet</span></div>
          ))}
        </div>
      </footer>
      <p className="doc-foot">Document généré par la plateforme de gestion du CeFoPExD — www.cefopexd.com</p>
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
