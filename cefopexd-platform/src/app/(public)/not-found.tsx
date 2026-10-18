import Link from "next/link";
import { ArrowRight } from "lucide-react";

/* Page introuvable (dans le gabarit public : header + footer) */
export default function NotFound() {
  return (
    <section className="section" style={{ textAlign: "center", padding: "120px 0" }}>
      <div className="container" style={{ maxWidth: "560px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "4rem", color: "var(--secondary-text)", lineHeight: 1 }}>404</div>
        <h1 className="section-title" style={{ marginTop: "12px" }}>Page introuvable</h1>
        <p style={{ color: "var(--muted)", marginBottom: "28px" }}>
          La page demandée n&#39;existe pas ou a été déplacée.
        </p>
        <Link href="/" className="btn-hero-primary">Retour à l&#39;accueil <ArrowRight size={17} /></Link>
      </div>
    </section>
  );
}
