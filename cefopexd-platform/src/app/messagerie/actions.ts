"use server";

import { redirect } from "next/navigation";
import { getSession, roleActif } from "@/lib/session";
import { ROLES_PERSONNEL } from "@/lib/roles";

export type Etat = { erreur?: string; ok?: string };

/* =============================================
   NOUVELLE CONVERSATION
   - Personnel : discussion avec une ou plusieurs personnes, ou groupe nommé.
   - Parents et apprenants : discussion directe avec un membre du personnel.
   Une discussion directe existante est réutilisée.
   ============================================= */
export async function creerConversation(_: Etat, fd: FormData): Promise<Etat> {
  const { supabase, user, profil } = await getSession();
  const role = roleActif(profil);
  if (!user || !role) return { erreur: "Votre compte doit être validé pour utiliser la messagerie." };
  const estPersonnel = ROLES_PERSONNEL.includes(role);

  const membres = [...new Set(fd.getAll("membres").map(String).filter((m) => m && m !== user.id))];
  const titre = String(fd.get("titre") ?? "").trim();
  if (!membres.length) return { erreur: "Choisissez au moins une personne." };
  if (!estPersonnel && membres.length > 1) return { erreur: "Vous pouvez écrire à une personne à la fois." };

  // Seules les personnes de l'annuaire autorisé peuvent être ajoutées
  const { data: annuaire } = await supabase.rpc("annuaire");
  const autorises = new Set(((annuaire ?? []) as { id: string }[]).map((a) => a.id));
  if (membres.some((m) => !autorises.has(m))) return { erreur: "Une des personnes choisies n'est pas joignable." };

  const groupe = membres.length > 1 || !!titre;
  if (!groupe) {
    // Discussion directe déjà ouverte avec cette personne ?
    const { data: miennes } = await supabase.from("conversation_membres").select("conversation_id, conversations!inner(type)").eq("profil_id", user.id).eq("conversations.type", "direct");
    const ids = (miennes ?? []).map((m) => m.conversation_id);
    if (ids.length) {
      const { data: commune } = await supabase.from("conversation_membres").select("conversation_id").in("conversation_id", ids).eq("profil_id", membres[0]).limit(1).maybeSingle();
      if (commune) redirect(`/messagerie/${commune.conversation_id}`);
    }
  }

  const { data: conv, error } = await supabase
    .from("conversations")
    .insert({ cree_par: user.id, type: groupe ? "groupe" : "direct", titre: groupe ? titre || "Groupe de discussion" : null })
    .select("id")
    .single();
  if (error || !conv) return { erreur: error?.message ?? "Création impossible." };
  const { error: errM } = await supabase
    .from("conversation_membres")
    .insert([user.id, ...membres].map((profil_id) => ({ conversation_id: conv.id, profil_id })));
  if (errM) return { erreur: errM.message };
  redirect(`/messagerie/${conv.id}`);
}
