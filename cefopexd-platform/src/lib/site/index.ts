import { cache } from "react";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { createClient as clientSimple } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Block, Section } from "@/lib/site-content";
import { SITE_DEFAUT } from "./defaut";
import { fusion } from "./fusion";
import type { FiliereSite, SiteConfig } from "./types";

export type { SiteConfig } from "./types";
export { SITE_DEFAUT } from "./defaut";

/* =============================================
   CHARGEMENT DU SITE (serveur)
   Version publiée : mise en cache, rafraîchie à chaque publication (étiquette « site »).
   Mode aperçu (Studio) : le brouillon est lu directement, sans cache.
   ============================================= */
export const TAG_SITE = "site";

const lirePublie = unstable_cache(
  async (): Promise<unknown> => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
    try {
      const sb = clientSimple(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data, error } = await sb.from("site_contenu").select("donnees").eq("id", "publie").maybeSingle();
      if (error || !data) return null;
      return data.donnees;
    } catch {
      return null;
    }
  },
  ["site-publie"],
  { tags: [TAG_SITE], revalidate: 3600 }
);

/* Version publiée uniquement (utilisable hors requête, ex. generateStaticParams) */
export async function getSitePublie(): Promise<SiteConfig> {
  return fusion(SITE_DEFAUT, await lirePublie());
}

/* Site affiché pour la requête en cours (brouillon si l'aperçu est activé) */
export const getSite = cache(async (): Promise<SiteConfig> => {
  let apercu = false;
  try {
    apercu = (await draftMode()).isEnabled;
  } catch {
    apercu = false;
  }
  if (apercu) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.from("site_contenu").select("donnees").eq("id", "brouillon").maybeSingle();
      if (data?.donnees) return fusion(SITE_DEFAUT, data.donnees);
    } catch {
      /* brouillon illisible : on affiche la version publiée */
    }
  }
  return getSitePublie();
});

export async function estApercu() {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

/* ---------- Conversion vers la structure des pages ---------- */
const CTA_INSCRIPTION: Block = {
  type: "cta",
  title: "Prêt à rejoindre le CeFoPExD ?",
  text: "Déposez votre pré-inscription en ligne : notre équipe d'admission vous recontacte pour finaliser votre dossier.",
  primary: { label: "Pré-inscription en ligne", href: "/inscription/formulaire" },
  secondary: { label: "Nous contacter", href: "/contact" },
};

/* Page d'une filière : durée, compétences, débouchés, blocs libres, appel à l'inscription */
export function blocsFiliere(f: FiliereSite): Block[] {
  const blocs: Block[] = [];
  const faits = [
    { label: "Durée", value: f.duree },
    { label: "Diplôme", value: f.diplome },
    { label: "Admission", value: f.admission },
  ].filter((x) => x.value);
  if (faits.length) blocs.push({ type: "facts", items: faits });
  if (f.competences?.length) blocs.push({ type: "list", title: "Ce que vous apprendrez", items: f.competences });
  if (f.debouches?.length) blocs.push({ type: "list", title: "Débouchés", items: f.debouches });
  return [...blocs, ...(f.blocs ?? []), CTA_INSCRIPTION];
}

/* Toutes les sections du site au format utilisé par les pages */
export function sectionsDuSite(site: SiteConfig): Record<string, Section> {
  const resultat: Record<string, Section> = {};
  for (const s of site.pages) {
    if (!s.slug || s.visible === false) continue;
    const sousPages =
      s.slug === "filieres"
        ? site.filieres.filter((f) => f.visible !== false && f.slug).map((f) => [f.slug, { title: f.titre, intro: f.intro, image: f.image, color: f.couleur, blocks: blocsFiliere(f) }] as const)
        : (s.sousPages ?? []).filter((p) => p.slug && p.visible !== false).map((p) => [p.slug, { title: p.titre, intro: p.intro, image: p.image || undefined, blocks: p.blocs ?? [] }] as const);
    resultat[s.slug] = {
      title: s.titre,
      intro: s.intro,
      image: s.image || undefined,
      blocks: s.blocs ?? [],
      pages: sousPages.length ? Object.fromEntries(sousPages) : undefined,
    };
  }
  return resultat;
}

export const premierTelephone = (site: SiteConfig) => site.contact.telephones[0] ?? "";
export const telLien = (t: string) => `tel:${t.replace(/\s/g, "")}`;
