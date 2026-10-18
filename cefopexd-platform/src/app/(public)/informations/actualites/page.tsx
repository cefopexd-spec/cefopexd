import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ContentBlocks from "@/components/ContentBlocks";
import { createClient } from "@/lib/supabase/server";
import { SECTIONS } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Actualités & annonces",
  description: "Les actualités, annonces et événements du CeFoPExD.",
};

type Pub = { id: string; titre: string; resume: string | null; contenu: string; categorie: string; date_evenement: string | null; image_url: string | null; created_at: string };
const CATEGORIES: Record<string, string> = { actualite: "Actualité", annonce: "Annonce", evenement: "Événement", formation: "Formation" };

/* =============================================
   ACTUALITÉS — publications du secrétariat (base) + contenus du site
   ============================================= */
export default async function ActualitesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("publications")
    .select("id, titre, resume, contenu, categorie, date_evenement, image_url, created_at")
    .eq("publie", true)
    .eq("public", true)
    .order("created_at", { ascending: false })
    .limit(30);
  const pubs = (data ?? []) as Pub[];
  const page = SECTIONS.informations.pages!.actualites;

  return (
    <>
      <PageHeader
        title={page.title}
        intro={page.intro}
        crumbs={[{ label: SECTIONS.informations.title, href: "/informations" }, { label: page.title }]}
      />
      <section className="section">
        <div className="container">
          {pubs.length > 0 && (
            <div className="pub-list">
              {pubs.map((p) => (
                <article key={p.id} className="pub-card" id={p.id}>
                  {p.image_url && (
                    <div className="pub-img"><Image src={p.image_url} alt="" fill sizes="(max-width: 700px) 100vw, 360px" style={{ objectFit: "cover" }} unoptimized={!p.image_url.startsWith("/")} /></div>
                  )}
                  <div className="pub-body">
                    <span className="pub-meta">
                      <span className="pub-cat">{CATEGORIES[p.categorie] ?? p.categorie}</span>
                      <CalendarDays size={14} />
                      {p.date_evenement
                        ? `Le ${new Date(p.date_evenement).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}`
                        : new Date(p.created_at).toLocaleDateString("fr-FR", { dateStyle: "long" })}
                    </span>
                    <h2>{p.titre}</h2>
                    {p.resume && <p className="pub-resume">{p.resume}</p>}
                    <p className="pub-contenu">{p.contenu}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
          <ContentBlocks blocks={page.blocks} />
          <p className="field-hint" style={{ marginTop: 24 }}>
            Pour recevoir les annonces réservées aux apprenants et aux parents, <Link href="/connexion">connectez-vous à votre espace</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
