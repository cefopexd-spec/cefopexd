import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* =============================================
   RETOUR DE GOOGLE : échange le code contre une session,
   puis renvoie l'utilisateur vers la page demandée.
   Le compte est créé automatiquement à la première connexion.
   ============================================= */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/mon-espace";
  // N'accepte que des chemins internes (évite les redirections vers un autre site)
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/mon-espace";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    console.error("Connexion Google : échec de l'échange du code", error.message);
  }

  return NextResponse.redirect(`${origin}/connexion?erreur=1&next=${encodeURIComponent(safeNext)}`);
}
