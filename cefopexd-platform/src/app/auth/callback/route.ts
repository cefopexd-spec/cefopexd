import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { COOKIE_IDENTITE, lireIdentite } from "@/lib/identite";

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
      // Première connexion : le profil doit d'abord être complété
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profil } = user
        ? await supabase.from("profils").select("profil_complet").eq("id", user.id).maybeSingle()
        : { data: null };

      // Identité saisie avant Google (création de compte) : enregistrée dans le profil
      const magasin = await cookies();
      const identite = lireIdentite(magasin.get(COOKIE_IDENTITE)?.value);
      if (identite) {
        magasin.delete(COOKIE_IDENTITE);
        if (user && profil && !profil.profil_complet) {
          const { error: erreurProfil } = await supabase.from("profils").update(identite).eq("id", user.id);
          if (erreurProfil) console.error("Identité non enregistrée :", erreurProfil.message);
        }
      }
      if (profil && !profil.profil_complet) {
        return NextResponse.redirect(`${origin}/mon-compte/completer?next=${encodeURIComponent(safeNext)}`);
      }
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    console.error("Connexion Google : échec de l'échange du code", error.message);
  }

  return NextResponse.redirect(`${origin}/connexion?erreur=1&next=${encodeURIComponent(safeNext)}`);
}
