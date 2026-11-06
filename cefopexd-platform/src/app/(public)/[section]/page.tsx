import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ContentBlocks, { contexteBlocs } from "@/components/ContentBlocks";
import { sectionCards } from "@/lib/site-content";
import { getSite, getSitePublie, sectionsDuSite } from "@/lib/site";

/* =============================================
   PAGE D'UNE SECTION DU MENU (À propos, Nos filières, …)
   Les pages créées dans le Studio du site sont servies ici aussi.
   ============================================= */
export async function generateStaticParams() {
  return Object.keys(sectionsDuSite(await getSitePublie())).map((section) => ({ section }));
}

type Props = { params: Promise<{ section: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  const data = sectionsDuSite(await getSite())[section];
  return data ? { title: data.title, description: data.intro } : {};
}

export default async function SectionPage({ params }: Props) {
  const { section } = await params;
  const site = await getSite();
  const data = sectionsDuSite(site)[section];
  if (!data) notFound();

  const cards = sectionCards(data).map((p) => ({
    title: p.title,
    desc: p.intro,
    href: `/${section}/${p.slug}`,
    image: p.image,
    color: (p as { color?: string }).color,
  }));

  return (
    <>
      <PageHeader title={data.title} intro={data.intro} crumbs={[{ label: data.title }]} />
      <section className="section">
        <div className="container">
          <ContentBlocks blocks={cards.length ? [{ type: "cards", items: cards }, ...data.blocks] : data.blocks} ctx={contexteBlocs(site)} />
        </div>
      </section>
    </>
  );
}
