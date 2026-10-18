import Link from "next/link";
import { Users } from "lucide-react";
import ActionForm from "@/components/forms/ActionForm";
import { roleLabel } from "@/lib/roles";
import { creerConversation } from "./actions";
import { nomPersonne, type ConversationResume, type Personne } from "./donnees";

/* Colonne de gauche : conversations + nouvelle discussion */
export default function ListeConversations({
  conversations, personnes, actif, estPersonnel, moi,
}: {
  conversations: ConversationResume[];
  personnes: Map<string, Personne>;
  actif?: string;
  estPersonnel: boolean;
  moi: string;
}) {
  const contacts = [...personnes.values()].filter((p) => p.id !== moi);
  return (
    <aside className={`chat-list ${actif ? "has-active" : ""}`}>
      <details className="chat-new">
        <summary>+ Nouvelle discussion</summary>
        <ActionForm action={creerConversation} submitLabel="Ouvrir la discussion" className="g-form" submitClassName="btn-hero-primary btn-sm">
          {estPersonnel && (
            <label className="field"><span>Nom du groupe (facultatif)</span>
              <input name="titre" placeholder="Ex. : Équipe administrative" />
            </label>
          )}
          <div className="chat-contacts">
            {contacts.length === 0 && <p className="g-empty">Aucun contact disponible pour le moment.</p>}
            {contacts.map((p) => (
              <label key={p.id}>
                <input type={estPersonnel ? "checkbox" : "radio"} name="membres" value={p.id} />
                <Avatar p={p} />
                <span><strong>{nomPersonne(p)}</strong><small>{roleLabel(p.role)}</small></span>
              </label>
            ))}
          </div>
        </ActionForm>
      </details>

      <nav className="chat-convs" aria-label="Conversations">
        {conversations.length === 0 && <p className="g-empty" style={{ padding: 16 }}>Aucune discussion. Commencez-en une ci-dessus.</p>}
        {conversations.map((c) => {
          const premier = personnes.get(c.membres[0] ?? "");
          return (
            <Link key={c.id} href={`/messagerie/${c.id}`} className={`chat-conv ${c.id === actif ? "is-active" : ""}`}>
              {c.type === "groupe" ? <span className="chat-avatar-ico"><Users size={18} /></span> : <Avatar p={premier} />}
              <span className="chat-conv-txt">
                <strong>{c.titre}</strong>
                <small>{c.dernier ?? "Nouvelle discussion"}</small>
              </span>
              <span className="chat-conv-meta">
                <small>{new Date(c.dernierAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</small>
                {c.nonLus > 0 && <span className="chat-unread">{c.nonLus}</span>}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function Avatar({ p }: { p?: Personne | null }) {
  if (p?.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={p.photo} alt="" className="chat-avatar" referrerPolicy="no-referrer" />;
  }
  return <span className="chat-avatar chat-avatar-ico">{(p?.prenom || p?.pseudo || "?").charAt(0).toUpperCase()}</span>;
}
