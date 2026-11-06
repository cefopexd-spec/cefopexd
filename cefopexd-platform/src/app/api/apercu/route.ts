import { NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { getSession, roleActif } from "@/lib/session";
import { ROLES_STUDIO } from "@/lib/roles";

/* =============================================
   APERÇU DU BROUILLON DU SITE
   /api/apercu?page=/contact  : active l'aperçu (DG ou gestionnaire du site)
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
  if (!user || !role || !ROLES_STUDIO.includes(role)) {
    return NextResponse.redirect(new URL("/connexion?next=/gestion/site", url));
  }
  draft.enable();
  const page = url.searchParams.get("page") ?? "/";
  // Seuls les chemins internes sont acceptés
  return NextResponse.redirect(new URL(page.startsWith("/") && !page.startsWith("//") ? page : "/", url));
}
