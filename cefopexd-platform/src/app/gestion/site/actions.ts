"use server";

import { revalidatePath, updateTag } from "next/cache";
import { assertGestion } from "@/lib/session";
import { SITE_DEFAUT, TAG_SITE } from "@/lib/site";
import { fusion } from "@/lib/site/fusion";
import type { SiteConfig } from "@/lib/site/types";

export type EtatStudio = { erreur?: string; ok?: string; donnees?: SiteConfig; le?: string };

const TAILLE_MAX = 900_000; // caractères (≈ 900 Ko de texte)
const echec = (e: unknown): EtatStudio => ({ erreur: e instanceof Error ? e.message : "Action impossible." });

const slug = (s: unknown) =>
  String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/* Nettoyage avant enregistrement : adresses des pages valides, sections connues */
function normaliser(brut: unknown): SiteConfig {
  if (typeof brut !== "object" || brut === null || Array.isArray(brut)) throw new Error("Contenu invalide.");
  const site = fusion(SITE_DEFAUT, brut);
  site.filieres = site.filieres.map((f) => ({ ...f, slug: slug(f.slug || f.titre) }));
  site.pages = site.pages.map((p) => ({
    ...p,
    slug: slug(p.slug || p.titre),
    sousPages: (p.sousPages ?? []).map((sp) => ({ ...sp, slug: slug(sp.slug || sp.titre) })),
  }));
  site.accueil.sectionsPerso = site.accueil.sectionsPerso.map((s, i) => ({ ...s, cle: slug(s.cle || s.titre) || `section-${i + 1}` }));
  const cles = new Set(site.accueil.sectionsPerso.map((s) => `perso:${s.cle}`));
  const fixes = new Set(["hero", "stats", "atouts", "filieres", "apropos", "directeur", "pourquoi", "appel"]);
  site.accueil.ordre = [...new Set(site.accueil.ordre)].filter((c) => fixes.has(c) || cles.has(c));
  // Les nouvelles sections personnalisées sont placées à la fin si elles ne sont pas déjà dans l'ordre
  for (const c of cles) if (!site.accueil.ordre.includes(c)) site.accueil.ordre.push(c);

  const doublon = (liste: string[]) => liste.find((s, i) => s && liste.indexOf(s) !== i);
  const d1 = doublon(site.filieres.map((f) => f.slug));
  if (d1) throw new Error(`Deux filières ont la même adresse « ${d1} ».`);
  const d2 = doublon(site.pages.map((p) => p.slug));
  if (d2) throw new Error(`Deux sections ont la même adresse « ${d2} ».`);
  for (const p of site.pages) {
    const d3 = doublon(p.sousPages.map((sp) => sp.slug));
    if (d3) throw new Error(`Deux sous-pages de « ${p.titre} » ont la même adresse « ${d3} ».`);
  }
  if (JSON.stringify(site).length > TAILLE_MAX) throw new Error("Le contenu est trop volumineux.");
  return site;
}

async function enregistrer(id: "brouillon" | "publie", donnees: SiteConfig) {
  const { supabase, user } = await assertGestion("site");
  const le = new Date().toISOString();
  const { error } = await supabase.from("site_contenu").upsert({ id, donnees, maj_par: user!.id, maj_le: le });
  if (error) {
    if (/relation|does not exist|schema cache/i.test(error.message)) {
      throw new Error("La base de données n'est pas encore prête pour le Studio : la mise à jour Supabase « studio_site » doit être appliquée.");
    }
    throw new Error(error.message);
  }
  return { supabase, user: user!, le };
}

/* Enregistre le brouillon (invisible pour le public) */
export async function enregistrerBrouillon(brut: unknown): Promise<EtatStudio> {
  try {
    const donnees = normaliser(brut);
    const { le } = await enregistrer("brouillon", donnees);
    return { ok: "Brouillon enregistré.", donnees, le };
  } catch (e) {
    return echec(e);
  }
}

/* Publie : le site officiel est mis à jour immédiatement */
export async function publierSite(brut: unknown, note: string): Promise<EtatStudio> {
  try {
    const donnees = normaliser(brut);
    await enregistrer("brouillon", donnees);
    const { supabase, user, le } = await enregistrer("publie", donnees);
    await supabase.from("site_versions").insert({ donnees, note: note.trim().slice(0, 300) || null, publie_par: user.id });
    updateTag(TAG_SITE);
    revalidatePath("/", "layout");
    return { ok: "Site publié : les modifications sont en ligne.", donnees, le };
  } catch (e) {
    return echec(e);
  }
}

/* Recharge une ancienne publication dans le brouillon (à republier ensuite) */
export async function restaurerVersion(id: number): Promise<EtatStudio> {
  try {
    const { supabase } = await assertGestion("site");
    const { data, error } = await supabase.from("site_versions").select("donnees").eq("id", id).maybeSingle();
    if (error || !data) return { erreur: "Version introuvable." };
    const donnees = normaliser(data.donnees);
    const { le } = await enregistrer("brouillon", donnees);
    return { ok: "Version chargée dans le brouillon. Vérifiez puis publiez pour la remettre en ligne.", donnees, le };
  } catch (e) {
    return echec(e);
  }
}

/* Abandonne le brouillon : repart de la version actuellement en ligne */
export async function abandonnerBrouillon(): Promise<EtatStudio> {
  try {
    const { supabase } = await assertGestion("site");
    const { data } = await supabase.from("site_contenu").select("donnees").eq("id", "publie").maybeSingle();
    const donnees = normaliser(data?.donnees ?? {});
    const { le } = await enregistrer("brouillon", donnees);
    return { ok: "Brouillon remplacé par la version en ligne.", donnees, le };
  } catch (e) {
    return echec(e);
  }
}
