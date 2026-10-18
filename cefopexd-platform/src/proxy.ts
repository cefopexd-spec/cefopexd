import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/* =============================================
   PROXY : rafraîchit la session Supabase (connexion Google)
   avant l'affichage des pages qui en ont besoin.
   ============================================= */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // Valide le jeton auprès de Supabase et le renouvelle si nécessaire
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/connexion", "/mon-espace/:path*", "/inscription/formulaire", "/auth/:path*"],
};
