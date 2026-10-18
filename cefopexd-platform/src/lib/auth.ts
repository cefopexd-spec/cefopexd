import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/* =============================================
   UTILISATEUR CONNECTÉ (compte Google via Supabase)
   ============================================= */
export type Profil = {
  id: string;
  email: string;
  nomComplet: string;
  prenom: string;
  nom: string;
  photo: string | null;
};

export function profilFromUser(user: User): Profil {
  const meta = user.user_metadata ?? {};
  const nomComplet: string = meta.full_name || meta.name || user.email?.split("@")[0] || "";
  // Google fournit parfois prénom / nom séparés ; sinon on découpe le nom complet
  const parts = nomComplet.trim().split(/\s+/);
  const prenom: string = meta.given_name || (parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0] || "");
  const nom: string = meta.family_name || (parts.length > 1 ? parts[parts.length - 1] : "");
  return {
    id: user.id,
    email: user.email ?? "",
    nomComplet,
    prenom,
    nom,
    photo: meta.avatar_url || meta.picture || null,
  };
}

export async function getProfil(): Promise<Profil | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? profilFromUser(user) : null;
}
