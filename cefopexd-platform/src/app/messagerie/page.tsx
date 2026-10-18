import { MessagesSquare } from "lucide-react";
import { requireProfil, roleActif } from "@/lib/session";
import { ROLES_PERSONNEL } from "@/lib/roles";
import { chargerMessagerie } from "./donnees";
import ListeConversations from "./ListeConversations";

/* Accueil de la messagerie : liste des discussions */
export default async function MessageriePage() {
  const { supabase, user, profil } = await requireProfil("/messagerie");
  const role = roleActif(profil);
  const { personnes, conversations } = await chargerMessagerie(supabase, user.id);

  return (
    <div className="chat-main">
      <ListeConversations conversations={conversations} personnes={personnes} estPersonnel={!!role && ROLES_PERSONNEL.includes(role)} moi={user.id} />
      <section className="chat-empty">
        <MessagesSquare size={42} />
        <h1>Messagerie interne</h1>
        <p>Choisissez une discussion ou commencez-en une nouvelle. Les messages arrivent en direct.</p>
      </section>
    </div>
  );
}
