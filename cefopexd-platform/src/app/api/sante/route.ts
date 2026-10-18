import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/* =============================================
   ÉTAT DE LA CONFIGURATION DU SERVEUR
   Indique si chaque clé fonctionne, sans jamais afficher sa valeur.
   ============================================= */
export async function GET() {
  const etat: Record<string, string> = {};

  const admin = adminClient();
  if (!admin) etat.supabase_service_role = "absente";
  else {
    const { error } = await admin.auth.admin.listUsers({ perPage: 1 });
    etat.supabase_service_role = error ? `invalide (${error.status ?? "erreur"})` : "ok";
  }

  const resend = process.env.RESEND_API_KEY?.trim();
  if (!resend) etat.resend = "absente";
  else {
    try {
      const res = await fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${resend}` }, cache: "no-store" });
      if (res.status === 401 || res.status === 403) {
        etat.resend = "clé présente (accès limité à l'envoi : domaine non vérifiable ici)";
      } else if (!res.ok) {
        etat.resend = `invalide (${res.status})`;
      } else {
        const { data } = (await res.json()) as { data?: { name: string; status: string }[] };
        const domaine = data?.find((d) => d.name === "cefopexd.com");
        etat.resend = "ok";
        etat.resend_domaine_cefopexd = domaine ? domaine.status : "non ajouté";
      }
    } catch {
      etat.resend = "injoignable";
    }
  }

  etat.anthropic = process.env.ANTHROPIC_API_KEY?.trim() ? "présente" : "absente";
  return NextResponse.json(etat, { headers: { "Cache-Control": "no-store" } });
}
