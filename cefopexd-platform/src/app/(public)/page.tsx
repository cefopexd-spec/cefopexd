import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import Accueil, { type Actu } from "@/components/accueil/Accueil";
import ContentBlocks, { contexteBlocs } from "@/components/ContentBlocks";
import { getSite } from "@/lib/site";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

/* Dernières publications publiques du secrétariat (rafraîchies toutes les 5 minutes) */
const dernieresPublications = unstable_cache(
  async (): Promise<Actu[]> => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
    try {
      const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data } = await sb
        .from("publications")
        .select("id, titre, resume, contenu, image_url, date_evenement, created_at")
        .eq("publie", true)
        .eq("public", true)
        .order("created_at", { ascending: false })
        .limit(3);
      return (data ?? []).map((p) => ({
        titre: p.titre,
        date: new Date(p.date_evenement ?? p.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
        extrait: p.resume ?? String(p.contenu ?? "").slice(0, 140),
        image: p.image_url ?? "",
        href: `/informations/actualites#${p.id}`,
      }));
    } catch {
      return [];
    }
  },
  ["accueil-publications"],
  { revalidate: 300, tags: ["publications"] }
);

const FONDS: Record<string, string> = { blanc: "white", doux: "var(--bg-soft)", sombre: "var(--primary-dark)" };

/* =============================================
   PAGE D'ACCUEIL — sections, ordre et contenus réglés dans le Studio du site
   ============================================= */
export default async function HomePage() {
  const site = await getSite();
  const { accueil } = site;
  const pubs = accueil.actualites.publicationsAuto ? await dernieresPublications() : [];
  const actualites = pubs.length ? pubs : accueil.actualites.items;
  const ctx = contexteBlocs(site);

  // Sections personnalisées (blocs libres) rendues ici, placées selon l'ordre choisi
  const sectionsPerso = Object.fromEntries(
    accueil.sectionsPerso
      .filter((s) => s.visible !== false && s.cle)
      .map((s) => [
        s.cle,
        <section key={s.cle} className={`section section-perso fond-${s.fond}`} style={{ background: FONDS[s.fond] ?? "white" }}>
          <div className="container">
            {(s.surtitre || s.titre || s.sousTitre) && (
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                {s.surtitre && <span className="section-label">{s.surtitre}</span>}
                {s.titre && <h2 className="section-title">{s.titre}</h2>}
                {s.sousTitre && <p className="section-subtitle" style={{ margin: "0 auto" }}>{s.sousTitre}</p>}
              </div>
            )}
            <ContentBlocks blocks={s.blocs ?? []} ctx={ctx} />
          </div>
        </section>,
      ])
  );

  return (
    <Accueil
      accueil={accueil}
      filieres={site.filieres}
      directeur={site.directeur}
      identite={site.identite}
      actualites={actualites}
      sectionsPerso={sectionsPerso}
    />
  );
}
