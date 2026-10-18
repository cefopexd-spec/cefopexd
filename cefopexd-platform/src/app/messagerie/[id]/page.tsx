import { notFound } from "next/navigation";
import { requireProfil, roleActif } from "@/lib/session";
import { ROLES_PERSONNEL, roleLabel } from "@/lib/roles";
import { chargerMessagerie, nomPersonne } from "../donnees";
import ListeConversations from "../ListeConversations";
import Chat from "../Chat";

type Props = { params: Promise<{ id: string }> };

/* Une discussion : liste à gauche (ordinateur), fil de messages en direct */
export default async function ConversationPage({ params }: Props) {
  const { id } = await params;
  const { supabase, user, profil } = await requireProfil(`/messagerie/${id}`);
  const role = roleActif(profil);
  const [{ personnes, conversations }, { data: messages }] = await Promise.all([
    chargerMessagerie(supabase, user.id),
    supabase.from("chat_messages").select("id, auteur_id, contenu, created_at").eq("conversation_id", id).order("created_at", { ascending: true }).limit(300),
  ]);
  const conv = conversations.find((c) => c.id === id);
  if (!conv) notFound();

  const auteurs = Object.fromEntries([...personnes.values()].map((p) => [p.id, { nom: nomPersonne(p), photo: p.photo }]));
  const sousTitre = conv.type === "groupe"
    ? `${conv.membres.length + 1} membres`
    : roleLabel(personnes.get(conv.membres[0] ?? "")?.role ?? "");

  return (
    <div className="chat-main has-thread">
      <ListeConversations conversations={conversations} personnes={personnes} actif={id} estPersonnel={!!role && ROLES_PERSONNEL.includes(role)} moi={user.id} />
      <Chat
        conversationId={id}
        moi={user.id}
        titre={conv.titre}
        sousTitre={sousTitre}
        initiaux={messages ?? []}
        auteurs={auteurs}
        groupe={conv.type === "groupe"}
      />
    </div>
  );
}
