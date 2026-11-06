import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireGestion, nomComplet } from "@/lib/session";
import { SITE_DEFAUT } from "@/lib/site";
import { fusion } from "@/lib/site/fusion";
import Studio, { type Version } from "./Studio";

export const metadata: Metadata = { title: "Studio du site" };

/* =============================================
   STUDIO CeFoPExD — construction et publication du site officiel
   Réservé au Directeur Général et au gestionnaire du site (webmaster).
   ============================================= */
export default async function StudioPage() {
  const { supabase } = await requireGestion("site");

  const [{ data: lignes, error }, { data: versions }] = await Promise.all([
    supabase.from("site_contenu").select("id, donnees, maj_le"),
    supabase.from("site_versions").select("id, note, publie_le, profils(prenom, nom, pseudo)").order("publie_le", { ascending: false }).limit(30),
  ]);
  const brouillon = lignes?.find((l) => l.id === "brouillon");
  const publie = lignes?.find((l) => l.id === "publie");
  const initial = fusion(SITE_DEFAUT, brouillon?.donnees ?? publie?.donnees ?? null);
  const enAttente = !!brouillon && (!publie || JSON.stringify(brouillon.donnees) !== JSON.stringify(publie.donnees));

  const liste: Version[] = ((versions ?? []) as unknown as { id: number; note: string | null; publie_le: string; profils: { prenom: string | null; nom: string | null; pseudo: string } | null }[]).map((v) => ({
    id: v.id,
    note: v.note,
    publie_le: v.publie_le,
    auteur: nomComplet(v.profils) || "—",
  }));

  return (
    <>
      <div className="g-page-head">
        <h1>Studio du site</h1>
        <p>
          Construisez le site officiel : thème, couleurs, en-tête, menus, pages, sections, images, formulaires, documents PDF et cartes d&#39;étudiant.
          Enregistrez un brouillon, vérifiez avec l&#39;aperçu, puis <strong>publiez</strong> : le site est mis à jour immédiatement.
        </p>
        <div className="g-actions">
          <Link href="/" target="_blank" className="btn-hero-ghost btn-sm"><ExternalLink size={15} /> Voir le site en ligne</Link>
          <Link href="/gestion/apprenants/cartes" className="btn-hero-ghost btn-sm">Cartes d&#39;étudiant</Link>
          <Link href="/gestion/inscriptions" className="btn-hero-ghost btn-sm">Inscriptions reçues</Link>
        </div>
      </div>
      <Studio
        initial={initial}
        defaut={SITE_DEFAUT}
        brouillonLe={brouillon?.maj_le ?? null}
        publieLe={publie?.maj_le ?? null}
        versions={liste}
        baseManquante={!!error}
        enAttente={enAttente}
      />
    </>
  );
}
