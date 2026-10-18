import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle, KeyRound, LogIn, ShieldCheck, UserPlus } from "lucide-react";
import ActionForm from "@/components/forms/ActionForm";
import { Field } from "@/components/forms/SupabaseForm";
import { seConnecterPersonnel } from "./actions";
import PageHeader from "@/components/PageHeader";
import GoogleButton from "@/components/auth/GoogleButton";
import CreationCompte from "@/components/auth/CreationCompte";
import { getProfil } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace CeFoPExD avec votre compte Google.",
};

type Props = { searchParams: Promise<{ next?: string; erreur?: string }> };

/* =============================================
   CONNEXION / CRÉATION DE COMPTE AVEC GOOGLE
   ============================================= */
export default async function ConnexionPage({ searchParams }: Props) {
  const { next, erreur } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/mon-espace";

  // Déjà connecté : direction la page demandée
  if (await getProfil()) redirect(safeNext);

  return (
    <>
      <PageHeader
        title="Connexion à votre espace"
        intro="Créez votre compte en quelques secondes avec votre identité et votre compte Google, ou reconnectez-vous si vous en avez déjà un."
        crumbs={[{ label: "Connexion" }]}
      />
      <section className="section">
        <div className="container auth-layout">
          <div className="auth-card">
            {erreur && (
              <p className="google-error" role="alert">
                La connexion n&#39;a pas abouti. Réessayez, ou contactez-nous si le problème persiste.
              </p>
            )}
            <h2><UserPlus size={22} /> Créer mon compte</h2>
            <p className="auth-lead">
              Renseignez votre identité, puis continuez avec Google : aucun mot de passe à retenir.
            </p>
            <CreationCompte next={safeNext} />

            <div className="auth-separateur"><span>ou</span></div>

            <h2><LogIn size={22} /> J&#39;ai déjà un compte</h2>
            <GoogleButton next={safeNext} label="Me connecter avec Google" />
            <p className="auth-small">
              <ShieldCheck size={15} />
              <span>
                En continuant, vous acceptez nos <Link href="/conditions-utilisation">conditions d&#39;utilisation</Link> et
                notre <Link href="/confidentialite">politique de confidentialité</Link>. Nous recevons uniquement votre nom,
                votre e-mail et votre photo de profil Google.
              </span>
            </p>

            {/* Personnel : comptes créés par le Directeur Général */}
            <details className="staff-login">
              <summary><KeyRound size={16} /> Personnel du centre : connexion par identifiant</summary>
              <p className="auth-small">Utilisez l&#39;e-mail ou le pseudo et le mot de passe reçus de la direction.</p>
              <ActionForm action={seConnecterPersonnel} submitLabel="Se connecter" className="g-form" submitClassName="btn-hero-primary btn-sm">
                <input type="hidden" name="next" value={next ?? ""} />
                <Field label="E-mail ou pseudo" name="identifiant" required autoComplete="username" />
                <Field label="Mot de passe" name="mot_de_passe" type="password" required autoComplete="current-password" />
              </ActionForm>
            </details>
          </div>

          <aside className="form-aside">
            <h2 className="block-title">Avec votre compte</h2>
            <ul className="check-list">
              {[
                "Déposez votre pré-inscription en ligne en quelques minutes.",
                "Retrouvez vos demandes et leur statut dans « Mon espace ».",
                "Reconnectez-vous à tout moment avec votre compte Google.",
              ].map((item) => (
                <li key={item}><CheckCircle size={18} />{item}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
