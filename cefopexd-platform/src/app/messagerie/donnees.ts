import type { SupabaseClient } from "@supabase/supabase-js";
import { urlsPhotos } from "@/lib/fichiers";

/* =============================================
   DONNÉES DE LA MESSAGERIE : conversations de l'utilisateur,
   dernier message, non lus, annuaire avec photos
   ============================================= */
export type Personne = { id: string; pseudo: string; prenom: string | null; nom: string | null; role: string; photo: string | null };
export type ConversationResume = {
  id: string; titre: string; type: string; dernier: string | null; dernierAt: string; nonLus: number; membres: string[];
};

export const nomPersonne = (p?: Pick<Personne, "prenom" | "nom" | "pseudo"> | null) =>
  p ? [p.prenom, p.nom].filter(Boolean).join(" ") || p.pseudo : "Utilisateur";

export async function chargerMessagerie(supabase: SupabaseClient, userId: string) {
  const [{ data: annuaire }, { data: liens }] = await Promise.all([
    supabase.rpc("annuaire"),
    supabase.from("conversation_membres").select("conversation_id, dernier_lu_at").eq("profil_id", userId),
  ]);
  const brut = (annuaire ?? []) as { id: string; pseudo: string; prenom: string | null; nom: string | null; role: string; photo_path: string | null; photo_url: string | null }[];
  const photos = await urlsPhotos(supabase, brut.map((p) => p.photo_path));
  const personnes = new Map<string, Personne>(
    brut.map((p) => [p.id, { id: p.id, pseudo: p.pseudo, prenom: p.prenom, nom: p.nom, role: p.role, photo: (p.photo_path && photos.get(p.photo_path)) || p.photo_url }])
  );

  const ids = (liens ?? []).map((l) => l.conversation_id);
  const luLe = new Map((liens ?? []).map((l) => [l.conversation_id, l.dernier_lu_at as string]));
  if (!ids.length) return { personnes, conversations: [] as ConversationResume[] };

  const [{ data: convs }, { data: membres }, { data: recents }] = await Promise.all([
    supabase.from("conversations").select("id, titre, type, dernier_message_at").in("id", ids).order("dernier_message_at", { ascending: false }),
    supabase.from("conversation_membres").select("conversation_id, profil_id").in("conversation_id", ids),
    supabase.from("chat_messages").select("conversation_id, auteur_id, contenu, created_at").in("conversation_id", ids).order("created_at", { ascending: false }).limit(500),
  ]);

  const conversations: ConversationResume[] = (convs ?? []).map((c) => {
    const autres = (membres ?? []).filter((m) => m.conversation_id === c.id && m.profil_id !== userId).map((m) => m.profil_id);
    const msgs = (recents ?? []).filter((m) => m.conversation_id === c.id);
    const lu = luLe.get(c.id) ?? "";
    return {
      id: c.id,
      type: c.type,
      titre: c.titre || autres.map((a) => nomPersonne(personnes.get(a))).join(", ") || "Conversation",
      dernier: msgs[0]?.contenu ?? null,
      dernierAt: c.dernier_message_at,
      nonLus: msgs.filter((m) => m.auteur_id !== userId && m.created_at > lu).length,
      membres: autres,
    };
  });
  return { personnes, conversations };
}
