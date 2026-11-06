import { NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { getSession, roleActif } from "@/lib/session";
import { ROLES_PERSONNEL, sectionsAutorisees } from "@/lib/roles";

/* =============================================
   APERÇU DU BROUILLON DU SITE
   /api/apercu?page=/contact  : active l'aperçu (personnes ayant accès au Studio)
   /api/apercu?quitter=1      : revient au site publié
   ============================================= */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const draft = await draftMode();

  if (url.searchParams.has("quitter")) {
    draft.disable();
    return NextResponse.redirect(new URL("/", url));
  }

  const { user, profil } = await getSession();
  const role = roleActif(profil);
  // Toute personne à qui la rubrique « Studio du site » est ouverte peut prévisualiser
  if (!user || !profil || !role || !ROLES_PERSONNEL.includes(role) || !sectionsAutorisees(role, profil.sections).includes("site")) {
    return NextResponse.redirect(new URL("/connexion?next=/gestion/site", url));
  }
  draft.enable();
  const page = url.searchParams.get("page") ?? "/";
  // Seuls les chemins internes sont acceptés
  return NextResponse.redirect(new URL(page.startsWith("/") && !page.startsWith("//") ? page : "/", url));
}
