import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ContentBlocks, { contexteBlocs } from "@/components/ContentBlocks";
import { getSite, getSitePublie, sectionsDuSite } from "@/lib/site";
import { nonOptimise } from "@/lib/site/images";

/* =============================================
   SOUS-PAGE D'UNE SECTION (ex. /filieres/informatique)
   ============================================= */

/* Pages ayant leur propre route (contenu dynamique depuis la base) */
const ROUTES_DEDIEES = new Set(["informations/actualites", "inscription/formulaire"]);

export async function generateStaticParams() {
  return Object.entries(sectionsDuSite(await getSitePublie())).flatMap(([section, data]) =>
    Object.keys(data.pages ?? {})
      .filter((slug) => !ROUTES_DEDIEES.has(`${section}/${slug}`))
      .map((slug) => ({ section, slug }))
  );
}

type Props = { params: Promise<{ section: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section, slug } = await params;
  const page = sectionsDuSite(await getSite())[section]?.pages?.[slug];
  return page ? { title: page.title, description: page.intro } : {};
}

export default async function SubPage({ params }: Props) {
  const { section, slug } = await params;
  const site = await getSite();
  const parent = sectionsDuSite(site)[section];
  const page = parent?.pages?.[slug];
  if (!parent || !page) notFound();

  // Autres pages de la même section, pour la colonne latérale
  const siblings = Object.entries(parent.pages ?? {});

  return (
    <>
      <PageHeader
        title={page.title}
        intro={page.intro}
        crumbs={[{ label: parent.title, href: `/${section}` }, { label: page.title }]}
      />
      <section className="section">
        <div className="container page-layout">
          <div style={{ minWidth: 0 }}>
            {page.image && (
              <div className="page-image">
                <Image src={page.image} unoptimized={nonOptimise(page.image)} alt={page.title} fill priority sizes="(max-width: 1023px) 100vw, 820px" style={{ objectFit: "cover" }} />
              </div>
            )}
            <ContentBlocks blocks={page.blocks} ctx={contexteBlocs(site)} />
          </div>

          <aside className="side-nav" aria-label={parent.title}>
            <div className="side-nav-title">{parent.title}</div>
            {siblings.map(([s, p]) => (
              <Link key={s} href={`/${section}/${s}`} className={s === slug ? "is-active" : ""}>
                {p.title}
              </Link>
            ))}
          </aside>
        </div>
      </section>
    </>
  );
}
