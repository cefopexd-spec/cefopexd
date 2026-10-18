import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase/config";

/* =============================================
   E-MAILS DE NOTIFICATION (service Resend)
   Actifs uniquement si RESEND_API_KEY et SUPABASE_SERVICE_ROLE_KEY sont
   définis sur le serveur. Sinon, seules les notifications dans l'espace
   de gestion sont envoyées (elles sont créées par la base de données).
   ============================================= */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://")
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "https://www.cefopexd.com";
const EXPEDITEUR = process.env.EMAIL_EXPEDITEUR || "CeFoPExD <notifications@cefopexd.com>";

/* Adresses e-mail du personnel ayant l'un des rôles donnés (lecture côté serveur uniquement) */
async function emailsDesRoles(roles: string[]): Promise<string[]> {
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!cle) return [];
  const admin = createSupabaseClient(SUPABASE_URL, cle, { auth: { persistSession: false } });
  const { data } = await admin.from("profils").select("email").in("role", roles).eq("statut", "valide");
  return (data ?? []).map((p) => p.email).filter(Boolean);
}

export async function envoyerEmail(destinataires: string[], sujet: string, texte: string, lien?: string) {
  const cle = process.env.RESEND_API_KEY?.trim();
  if (!cle || destinataires.length === 0) return;
  const url = lien ? `${SITE_URL}${lien}` : SITE_URL;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0E1433">
    <p>${texte.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>
    <p><a href="${url}" style="display:inline-block;padding:10px 18px;background:#0B22D6;color:#fff;border-radius:8px;text-decoration:none">Ouvrir dans l'espace CeFoPExD</a></p>
    <p style="color:#5B6478;font-size:12px">Message automatique du site CeFoPExD — Centre de Formation Professionnelle d'Excellence de Dévikinmé.</p>
  </div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: EXPEDITEUR, to: destinataires, subject: sujet, html }),
    });
    if (!res.ok) console.error("E-mail non envoyé :", res.status, await res.text());
  } catch (error) {
    console.error("E-mail non envoyé :", error);
  }
}

export async function notifierParEmail(roles: string[], sujet: string, texte: string, lien?: string) {
  await envoyerEmail(await emailsDesRoles(roles), sujet, texte, lien);
}
