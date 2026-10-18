import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

/* =============================================
   PROXY : rafraîchit la session Supabase (connexion Google)
   avant l'affichage des pages qui en ont besoin.
   ============================================= */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Valide le jeton auprès de Supabase et le renouvelle si nécessaire.
  // En cas d'indisponibilité de Supabase, la page s'affiche quand même.
  try {
    await supabase.auth.getUser();
  } catch (error) {
    console.error("Proxy : session Supabase non rafraîchie", error);
  }

  return response;
}

export const config = {
  matcher: ["/connexion", "/mon-espace/:path*", "/mon-compte/:path*", "/gestion/:path*", "/inscription/formulaire", "/auth/:path*"],
};
