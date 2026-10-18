import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ContentBlocks from "@/components/ContentBlocks";
import { SECTIONS } from "@/lib/site-content";

/* =============================================
   SOUS-PAGE D'UNE SECTION (ex. /filieres/informatique)
   ============================================= */
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.entries(SECTIONS).flatMap(([section, data]) =>
    Object.keys(data.pages ?? {}).map((slug) => ({ section, slug }))
  );
}

type Props = { params: Promise<{ section: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section, slug } = await params;
  const page = SECTIONS[section]?.pages?.[slug];
  return page ? { title: page.title, description: page.intro } : {};
}

export default async function SubPage({ params }: Props) {
  const { section, slug } = await params;
  const parent = SECTIONS[section];
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
                <Image src={page.image} alt={page.title} fill priority sizes="(max-width: 1023px) 100vw, 820px" style={{ objectFit: "cover" }} />
              </div>
            )}
            <ContentBlocks blocks={page.blocks} />
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
