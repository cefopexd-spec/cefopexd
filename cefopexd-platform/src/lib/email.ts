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

function admin() {
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return cle ? createSupabaseClient(SUPABASE_URL, cle, { auth: { persistSession: false } }) : null;
}

/* Adresses e-mail des comptes validés ayant l'un des rôles donnés ("tous" = tout le monde) */
export async function emailsDesRoles(roles: string[]): Promise<string[]> {
  const client = admin();
  if (!client) return [];
  let requete = client.from("profils").select("email").eq("statut", "valide");
  if (!roles.includes("tous")) requete = requete.in("role", roles);
  const { data } = await requete;
  return [...new Set((data ?? []).map((p) => p.email).filter(Boolean))];
}

/* Adresses e-mail de profils précis */
export async function emailsDesProfils(ids: string[]): Promise<string[]> {
  const client = admin();
  if (!client || ids.length === 0) return [];
  const { data } = await client.from("profils").select("email").in("id", ids);
  return (data ?? []).map((p) => p.email).filter(Boolean);
}

/* Envoie un e-mail. Plusieurs destinataires : envoi séparé à chacun (les adresses restent privées).
   repondreA : adresse utilisée quand le destinataire clique sur « Répondre ».
   Renvoie le nombre d'e-mails effectivement envoyés. */
export async function envoyerEmail(destinataires: string[], sujet: string, texte: string, lien?: string, repondreA?: string): Promise<number> {
  const cle = process.env.RESEND_API_KEY?.trim();
  if (!cle || destinataires.length === 0) return 0;
  const url = lien ? `${SITE_URL}${lien}` : SITE_URL;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0E1433">
    <p>${texte.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>
    <p><a href="${url}" style="display:inline-block;padding:10px 18px;background:#0B22D6;color:#fff;border-radius:8px;text-decoration:none">Ouvrir dans l'espace CeFoPExD</a></p>
    <p style="color:#5B6478;font-size:12px">Message automatique du site CeFoPExD — Centre de Formation Professionnelle d'Excellence de Dévikinmé.</p>
  </div>`;
  const corps = (to: string) => ({ from: EXPEDITEUR, to: [to], subject: sujet, html, ...(repondreA ? { reply_to: repondreA } : {}) });
  let envoyes = 0;
  // Envoi groupé par lots de 100 (limite du service)
  for (let i = 0; i < destinataires.length; i += 100) {
    const lot = destinataires.slice(i, i + 100);
    try {
      const res = await fetch(lot.length > 1 ? "https://api.resend.com/emails/batch" : "https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
        body: JSON.stringify(lot.length > 1 ? lot.map(corps) : corps(lot[0])),
      });
      if (res.ok) envoyes += lot.length;
      else console.error("E-mail non envoyé :", res.status, await res.text());
    } catch (error) {
      console.error("E-mail non envoyé :", error);
    }
  }
  return envoyes;
}

export async function notifierParEmail(roles: string[], sujet: string, texte: string, lien?: string, repondreA?: string) {
  return envoyerEmail(await emailsDesRoles(roles), sujet, texte, lien, repondreA);
}
