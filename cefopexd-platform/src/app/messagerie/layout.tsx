import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession, roleActif } from "@/lib/session";
import { ROLES_PERSONNEL } from "@/lib/roles";

export const metadata: Metadata = {
  title: { default: "Messagerie", template: "%s | Messagerie CeFoPExD" },
  robots: { index: false, follow: false },
};

/* =============================================
   MESSAGERIE INTERNE — interface plein écran, comme une application
   ============================================= */
export default async function MessagerieLayout({ children }: { children: React.ReactNode }) {
  const { user, profil } = await getSession();
  if (!user) redirect("/connexion?next=/messagerie");
  if (!profil?.profil_complet) redirect("/mon-compte/completer?next=/messagerie");
  const role = roleActif(profil);
  if (!role) redirect("/mon-espace?acces=refuse");
  const retour = ROLES_PERSONNEL.includes(role) ? "/gestion" : "/mon-espace";

  return (
    <div className="chat-app">
      <header className="chat-app-bar">
        <Link href={retour} className="chat-app-back" aria-label="Retour"><ArrowLeft size={18} /></Link>
        <span className="chat-app-logo"><Image src="/logo-mark.png" alt="" fill sizes="32px" style={{ objectFit: "contain" }} /></span>
        <strong>Messagerie CeFoPExD</strong>
      </header>
      {children}
    </div>
  );
}
