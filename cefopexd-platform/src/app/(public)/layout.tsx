import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeSite from "@/components/ThemeSite";
import VisiteTracker from "@/components/VisiteTracker";
import { estApercu, getSite } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: { default: site.identite.titreSeo, template: `%s | ${site.identite.nom}` },
    description: site.identite.descriptionSeo,
    icons: { icon: site.identite.logoIcone || "/logo-mark.png", apple: "/icons/apple-touch-icon.png" },
  };
}

/* =============================================
   LAYOUT PAGES PUBLIQUES — tout le contenu vient du Studio du site
   ============================================= */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [site, apercu] = await Promise.all([getSite(), estApercu()]);
  const { identite } = site;

  return (
    <>
      <ThemeSite site={site} />
      {apercu && (
        <div className="apercu-bandeau" role="status">
          <span><strong>Aperçu du brouillon</strong> — ces modifications ne sont pas encore visibles par le public.</span>
          <Link href="/gestion/site">Retour au Studio</Link>
          {/* Lien classique : la route désactive l'aperçu côté serveur */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/api/apercu?quitter=1">Quitter l&#39;aperçu</a>
        </div>
      )}
      <Header
        site={{
          logo: identite.logo,
          nom: identite.nom,
          entete: site.entete,
          telephones: site.contact.telephones,
          email: site.contact.email,
          reseaux: site.reseaux,
        }}
      />
      <main style={{ paddingTop: "var(--header-h)" /* hauteur du header fixe (2 étages) */ }}>
        {children}
      </main>
      <Footer site={{ logo: identite.logo, nom: identite.nom, pied: site.pied, contact: site.contact, reseaux: site.reseaux }} />
      <VisiteTracker />
    </>
  );
}
