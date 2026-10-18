import type { Metadata } from "next";
import { Megaphone, MessageSquare, Send } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ActionForm from "@/components/forms/ActionForm";
import { Field, SelectField, TextAreaField } from "@/components/forms/SupabaseForm";
import { nomComplet, requireProfil, roleActif } from "@/lib/session";
import { envoyerMessageFamille } from "../actions";

export const metadata: Metadata = { title: "Messages & annonces", robots: { index: false } };

type Message = { id: string; sujet: string; contenu: string; created_at: string; expediteur_id: string; cible_role: string | null; profils: { prenom: string | null; nom: string | null; pseudo: string } | null };
type Publication = { id: string; titre: string; contenu: string; categorie: string; date_evenement: string | null; created_at: string };

const dateFr = (d: string) => new Date(d).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });

/* =============================================
   MESSAGES REÇUS, ANNONCES INTERNES ET ÉCRIRE AU CENTRE
   (la sécurité de la base ne renvoie que ce qui concerne l'utilisateur)
   ============================================= */
export default async function MessagesPage() {
  const { supabase, user, profil } = await requireProfil("/mon-espace/messages");
  const valide = !!roleActif(profil);

  const [{ data: messages }, { data: annonces }] = await Promise.all([
    supabase.from("messages").select("id, sujet, contenu, created_at, expediteur_id, cible_role, profils!messages_expediteur_id_fkey(prenom, nom, pseudo)").order("created_at", { ascending: false }).limit(50),
    supabase.from("publications").select("id, titre, contenu, categorie, date_evenement, created_at").eq("publie", true).order("created_at", { ascending: false }).limit(20),
  ]);
  const recus = ((messages ?? []) as unknown as Message[]).filter((m) => m.expediteur_id !== user.id);
  const envoyes = ((messages ?? []) as unknown as Message[]).filter((m) => m.expediteur_id === user.id);

  return (
    <>
      <PageHeader
        title="Messages & annonces"
        intro="Les messages de l'équipe du CeFoPExD, les annonces et événements, et vos échanges avec le centre."
        crumbs={[{ label: "Mon espace", href: "/mon-espace" }, { label: "Messages" }]}
      />
      <section className="section">
        <div className="container space-layout">
          <div className="space-main">
            <div className="g-card">
              <div className="g-card-head"><h2><MessageSquare size={18} /> Messages reçus</h2></div>
              {recus.length === 0 ? <p className="g-empty">Aucun message pour le moment.</p> : (
                <div className="g-messages">
                  {recus.map((m) => (
                    <article key={m.id} className="g-message">
                      <header><strong>{m.sujet}</strong><small>{nomComplet(m.profils)} · {dateFr(m.created_at)}</small></header>
                      <p>{m.contenu}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="g-card">
              <div className="g-card-head"><h2><Megaphone size={18} /> Annonces & événements</h2></div>
              {(annonces ?? []).length === 0 ? <p className="g-empty">Aucune annonce pour le moment.</p> : (
                <div className="g-messages">
                  {((annonces ?? []) as Publication[]).map((a) => (
                    <article key={a.id} className="g-message">
                      <header>
                        <strong>{a.titre}</strong>
                        <small>{a.categorie}{a.date_evenement ? ` · le ${dateFr(a.date_evenement)}` : ""} · publié le {dateFr(a.created_at)}</small>
                      </header>
                      <p>{a.contenu}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {envoyes.length > 0 && (
              <div className="g-card">
                <div className="g-card-head"><h2><Send size={18} /> Mes messages envoyés</h2></div>
                <div className="g-messages">
                  {envoyes.map((m) => (
                    <article key={m.id} className="g-message">
                      <header><strong>{m.sujet}</strong><small>{dateFr(m.created_at)}</small></header>
                      <p>{m.contenu}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="form-aside">
            <h2 className="block-title">Écrire au centre</h2>
            {valide ? (
              <ActionForm action={envoyerMessageFamille} submitLabel="Envoyer" className="g-form" submitClassName="btn-hero-primary btn-sm">
                <SelectField
                  label="Destinataire"
                  name="cible_role"
                  required
                  defaultLabel="— Choisir —"
                  options={["Secrétariat", "Administration", "Direction générale"]}
                  values={["secretaire", "admin", "dg"]}
                />
                <Field label="Sujet" name="sujet" required />
                <TextAreaField label="Message" name="contenu" required rows={6} />
              </ActionForm>
            ) : (
              <p className="g-empty">La messagerie sera disponible dès que votre compte aura été validé par la direction.</p>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
