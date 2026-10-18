import type { Metadata } from "next";
import ActionForm from "@/components/forms/ActionForm";
import { Field, TextAreaField } from "@/components/forms/SupabaseForm";
import { requireGestion, nomComplet } from "@/lib/session";
import { roleLabel } from "@/lib/roles";
import { envoyerEmailTest, envoyerMessage } from "../actions";

export const metadata: Metadata = { title: "Messages" };

type Msg = {
  id: string; sujet: string; contenu: string; created_at: string; expediteur_id: string; destinataire_id: string | null; cible_role: string | null;
  exp: { prenom: string | null; nom: string | null; pseudo: string } | null;
  dest: { prenom: string | null; nom: string | null; pseudo: string } | null;
};

const GROUPES = [["tous", "Tout le monde"], ["apprenant", "Tous les apprenants"], ["parent", "Tous les parents"], ["professeur", "Tous les professeurs"], ["secretaire", "Le secrétariat"], ["admin", "L'administration"], ["dg", "Le Directeur Général"]];

/* =============================================
   MESSAGES — à une personne ou à tout un groupe (notification automatique)
   ============================================= */
export default async function MessagesGestion() {
  const { supabase, user, role } = await requireGestion("messages");
  const [{ data }, { data: personnes }] = await Promise.all([
    supabase.from("messages").select("*, exp:profils!messages_expediteur_id_fkey(prenom, nom, pseudo), dest:profils!messages_destinataire_id_fkey(prenom, nom, pseudo)").order("created_at", { ascending: false }).limit(100),
    ["dg", "admin", "secretaire"].includes(role)
      ? supabase.from("profils").select("id, prenom, nom, pseudo, role").eq("statut", "valide").order("nom")
      : { data: [] as { id: string; prenom: string | null; nom: string | null; pseudo: string; role: string }[] },
  ]);
  const messages = (data ?? []) as unknown as Msg[];

  return (
    <>
      <div className="g-page-head">
        <h1>Messages</h1>
        <p>Envoyez un message à une personne ou à un groupe (apprenants, parents, professeurs…). Chaque destinataire est notifié dans son espace et, si vous le cochez, reçoit aussi le message par e-mail.</p>
      </div>

      <div className="g-grid-2">
        <div className="g-card">
          <div className="g-card-head"><h2>Nouveau message</h2></div>
          <ActionForm action={envoyerMessage} submitLabel="Envoyer" className="g-form" submitClassName="btn-hero-primary btn-sm">
            <label className="field"><span>Destinataire</span>
              <select name="destinataire" required defaultValue="">
                <option value="" disabled>— Choisir —</option>
                <optgroup label="Groupes">
                  {GROUPES.map(([v, l]) => <option key={v} value={`role:${v}`}>{l}</option>)}
                </optgroup>
                {(personnes ?? []).length > 0 && (
                  <optgroup label="Personnes">
                    {(personnes ?? []).filter((p) => p.id !== user!.id).map((p) => (
                      <option key={p.id} value={`profil:${p.id}`}>{nomComplet(p)} — {roleLabel(p.role)}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </label>
            <Field label="Sujet" name="sujet" required />
            <TextAreaField label="Message" name="contenu" required rows={6} />
            <label className="g-checks">
              <input type="checkbox" name="par_email" defaultChecked />
              <span>Envoyer aussi par e-mail (le destinataire peut vous répondre directement)</span>
            </label>
          </ActionForm>
          {role === "dg" && (
            <ActionForm action={envoyerEmailTest} submitLabel="M'envoyer un e-mail de test" className="g-form" submitClassName="btn-hero-ghost btn-sm">
              <p className="upload-hint">Vérifie que les e-mails partent bien vers les membres.</p>
            </ActionForm>
          )}
        </div>

        <div className="g-card">
          <div className="g-card-head"><h2>Boîte de réception et envois</h2></div>
          {messages.length === 0 ? <p className="g-empty">Aucun message.</p> : (
            <div className="g-messages">
              {messages.map((m) => (
                <article key={m.id} className={`g-message ${m.expediteur_id === user!.id ? "is-sent" : ""}`}>
                  <header>
                    <strong>{m.sujet}</strong>
                    <small>
                      {m.expediteur_id === user!.id ? "Vous" : nomComplet(m.exp)} →{" "}
                      {m.dest ? nomComplet(m.dest) : GROUPES.find((g) => g[0] === m.cible_role)?.[1]} · {new Date(m.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                    </small>
                  </header>
                  <p>{m.contenu}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
