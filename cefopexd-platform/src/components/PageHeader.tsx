import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

/* =============================================
   BANDEAU EN-TÊTE DES PAGES INTÉRIEURES
   Même fond que le hero : vert clair + photo du campus en filigrane
   ============================================= */
export default function PageHeader({
  title,
  intro,
  crumbs,
  actions,
}: {
  title: string;
  intro?: string;
  crumbs: { label: string; href?: string }[];
  actions?: React.ReactNode;
}) {
  return (
    <section className="page-header">
      <div className="hero-bg" aria-hidden="true">
        <Image src="/images/campus-cefopexd.jpg" alt="" fill sizes="100vw" quality={60} style={{ objectFit: "cover" }} />
      </div>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <nav className="breadcrumb" aria-label="Fil d'Ariane">
          <Link href="/">Accueil</Link>
          {crumbs.map((c) => (
            <span key={c.label} style={{ display: "contents" }}>
              <ChevronRight size={14} />
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            </span>
          ))}
        </nav>
        <h1 className="page-title">{title}</h1>
        {intro && <p className="page-intro">{intro}</p>}
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </section>
  );
}
