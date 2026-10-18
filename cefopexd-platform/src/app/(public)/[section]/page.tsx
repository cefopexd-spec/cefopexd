import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ContentBlocks from "@/components/ContentBlocks";
import { SECTIONS, sectionCards } from "@/lib/site-content";

/* =============================================
   PAGE D'UNE SECTION DU MENU (À propos, Nos filières, …)
   ============================================= */
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(SECTIONS).map((section) => ({ section }));
}

type Props = { params: Promise<{ section: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  const data = SECTIONS[section];
  return data ? { title: data.title, description: data.intro } : {};
}

export default async function SectionPage({ params }: Props) {
  const { section } = await params;
  const data = SECTIONS[section];
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
          <ContentBlocks blocks={cards.length ? [{ type: "cards", items: cards }, ...data.blocks] : data.blocks} />
        </div>
      </section>
    </>
  );
}
