import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, ExternalLink, Search } from "lucide-react";
import GestionNav from "./GestionNav";
import { getSession, nomComplet, roleActif } from "@/lib/session";
import { ROLES_PERSONNEL, SECTIONS_GESTION, roleLabel, sectionsAutorisees } from "@/lib/roles";

export const metadata: Metadata = {
  title: { default: "Gestion", template: "%s | Gestion CeFoPExD" },
  robots: { index: false, follow: false },
};

/* =============================================
   ESPACE DE GESTION (privé, non référencé, réservé au personnel validé)
   ============================================= */
export default async function GestionLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, profil } = await getSession();
  if (!user) redirect("/connexion?next=/gestion");
  if (!profil?.profil_complet) redirect("/mon-compte/completer?next=/gestion");
  const role = roleActif(profil);
  if (!role || !ROLES_PERSONNEL.includes(role)) redirect("/mon-espace?acces=refuse");

  const autorisees = sectionsAutorisees(role, profil.sections);
  const liens = [
    ...SECTIONS_GESTION.filter((s) => autorisees.includes(s.key)).map(({ key, label, href }) => ({ key, label, href })),
    { key: "messagerie", label: "Messagerie interne", href: "/messagerie" },
  ];
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("destinataire_id", user.id)
    .eq("lu", false);

  return (
    <div className="g-shell">
      <aside className="g-sidebar">
        <Link href="/gestion" className="g-logo" aria-label="Tableau de bord">
          <Image src="/logo-cefopexd.png" alt="CeFoPExD" fill sizes="150px" style={{ objectFit: "contain", objectPosition: "left center" }} />
        </Link>
        <span className="g-sidebar-title">Gestion de l&#39;école</span>
        <GestionNav liens={liens} />
        <div className="g-sidebar-foot">
          <Link href="/" target="_blank"><ExternalLink size={14} /> Voir le site public</Link>
          <Link href="/mon-espace">Mon espace personnel</Link>
        </div>
      </aside>

      <div className="g-main">
        <header className="g-topbar">
          <div>
            <strong>{nomComplet(profil)}</strong>
            <span>{roleLabel(role)} · @{profil.pseudo}</span>
          </div>
          <form action="/gestion/recherche" className="g-topsearch" role="search">
            <Search size={16} />
            <input type="search" name="q" placeholder="Rechercher : nom, matricule, document…" aria-label="Rechercher dans le système" />
          </form>
          <div className="g-topbar-actions">
            <Link href="/gestion" className="g-bell" aria-label="Notifications">
              <Bell size={18} />
              {!!count && <span>{count}</span>}
            </Link>
            <form action="/auth/deconnexion" method="post">
              <button type="submit" className="g-link-btn">Se déconnecter</button>
            </form>
          </div>
        </header>
        <main className="g-content">{children}</main>
      </div>
    </div>
  );
}
