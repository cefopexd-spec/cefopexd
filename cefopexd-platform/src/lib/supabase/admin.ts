import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/* =============================================
   CLIENT ADMINISTRATEUR (serveur uniquement)
   Utilisé pour créer les comptes des responsables et retrouver un e-mail à
   partir d'un pseudo. Nécessite SUPABASE_SERVICE_ROLE_KEY (jamais côté navigateur).
   ============================================= */
export function adminClient() {
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/^["']|["']$/g, "");
  if (!cle) return null;
  return createClient(SUPABASE_URL, cle, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const MESSAGE_CLE_MANQUANTE =
  "Fonction indisponible : la variable SUPABASE_SERVICE_ROLE_KEY n'est pas configurée sur le serveur (Vercel).";
