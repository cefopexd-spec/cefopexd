import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Info, Lock, Phone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GoogleButton from "@/components/auth/GoogleButton";
import { getProfil } from "@/lib/auth";
import SupabaseForm, { Field, SelectField, TextAreaField } from "@/components/forms/SupabaseForm";
import { CONTACT, SECTIONS } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Pré-inscription en ligne",
  description: "Déposez votre pré-inscription au CeFoPExD : notre équipe d'admission vous recontacte pour finaliser votre dossier.",
};

const FILIERES = Object.values(SECTIONS.filieres.pages ?? {}).map((p) => p.title);
const NIVEAUX = ["BEPC", "Probatoire", "BAC", "BAC +2 et plus", "Autre"];

/* =============================================
   PRÉ-INSCRIPTION — enregistrée dans la table `inscriptions`
   Réservée aux personnes connectées avec leur compte Google :
   la demande est rattachée au compte et visible dans « Mon espace ».
   ============================================= */
export default async function PreInscriptionPage() {
  const profil = await getProfil();

  return (
    <>
      <PageHeader
        title="Pré-inscription en ligne"
        intro="Remplissez ce formulaire en quelques minutes : notre équipe d'admission vous recontacte pour finaliser votre dossier au centre."
        crumbs={[{ label: "Inscription", href: "/inscription" }, { label: "Pré-inscription en ligne" }]}
      />
      <section className="section">
        <div className="container form-layout">
          <div style={{ minWidth: 0 }}>
            {!profil ? (
              <div className="auth-gate">
                <span className="auth-gate-ico"><Lock size={22} /></span>
                <h2>Connectez-vous pour vous pré-inscrire</h2>
                <p>
                  La pré-inscription se fait depuis votre compte CeFoPExD, créé en un clic avec votre compte Google.
                  Vous pourrez ensuite suivre votre demande dans « Mon espace » et vous reconnecter à tout moment avec vos identifiants Google.
                </p>
                <GoogleButton next="/inscription/formulaire" label="Continuer avec Google" />
                <small>Aucun mot de passe à créer. Nous recevons uniquement votre nom, votre e-mail et votre photo de profil.</small>
              </div>
            ) : (
            <>
            <div className="auth-connected">
              {profil.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profil.photo} alt="" referrerPolicy="no-referrer" />
              ) : (
                <span className="profile-initial">{(profil.prenom || profil.email).charAt(0).toUpperCase()}</span>
              )}
              <div>
                <strong>Connecté(e) en tant que {profil.nomComplet}</strong>
                <span>{profil.email} · <Link href="/mon-espace">Mon espace</Link></span>
              </div>
            </div>

            {/* Consignes avant de remplir */}
            <div className="form-notice">
              <Info size={20} />
              <div>
                <strong>Avant de commencer</strong>
                <ul>
                  <li>Les champs marqués d&#39;un <em>*</em> sont obligatoires.</li>
                  <li>Indiquez un numéro de téléphone sur lequel vous êtes joignable : c&#39;est par ce numéro que nous vous recontactons.</li>
                  <li>Après l&#39;envoi, un <strong>numéro de référence</strong> s&#39;affiche : notez-le, il vous sera demandé au centre.</li>
                  <li>La pré-inscription est gratuite et ne vous engage pas.</li>
                </ul>
              </div>
            </div>

            <SupabaseForm
              table="inscriptions"
              submitLabel="Envoyer ma pré-inscription"
              successTitle="Votre pré-inscription est bien enregistrée !"
              successText="Notre équipe d'admission vous contactera très prochainement par téléphone pour la suite de votre dossier."
              nextSteps={[
                "Notre équipe vous appelle pour fixer un rendez-vous.",
                "Vous déposez votre dossier au centre (diplôme, acte de naissance, 2 photos d'identité).",
                "Un entretien d'orientation confirme votre choix de filière.",
              ]}
            >
              <h2 className="form-section-title">1. Vos informations</h2>
              <div className="form-grid">
                <Field label="Nom" name="nom" required autoComplete="family-name" defaultValue={profil.nom} />
                <Field label="Prénom(s)" name="prenom" required autoComplete="given-name" defaultValue={profil.prenom} />
                <Field label="Téléphone" name="telephone" type="tel" required placeholder="+228 …" autoComplete="tel" />
                <Field label="E-mail" name="email" type="email" defaultValue={profil.email} readOnly hint="Adresse de votre compte Google" />
              </div>

              <h2 className="form-section-title">2. Votre formation</h2>
              <div className="form-grid">
                <SelectField label="Filière souhaitée" name="filiere" options={FILIERES} required defaultLabel="— Choisir une filière —" />
                <SelectField label="Niveau d'étude" name="niveau_etude" options={NIVEAUX} required defaultLabel="— Choisir un niveau —" />
                <TextAreaField label="Message (facultatif)" name="message" placeholder="Une question, une précision sur votre parcours…" />
              </div>

              <label className="consent">
                <input type="checkbox" name="consentement" required />
                <span>J&#39;accepte d&#39;être recontacté(e) par le CeFoPExD au sujet de ma demande. <Link href="/confidentialite">Politique de confidentialité</Link></span>
              </label>
            </SupabaseForm>
            </>
            )}
          </div>

          <aside className="form-aside">
            <h2 className="block-title">Comment ça se passe ?</h2>
            <ol className="steps">
              {[
                ["Connexion avec Google", "Votre compte est créé en un clic."],
                ["Pré-inscription en ligne", "Vous remplissez ce formulaire."],
                ["Appel de l'équipe", "Nous vous contactons pour fixer un rendez-vous."],
                ["Dépôt du dossier", "Copie du diplôme, acte de naissance, 2 photos d'identité."],
                ["Entretien d'orientation", "Un conseiller vous aide à confirmer votre choix."],
                ["Rentrée", "Bienvenue dans la famille CeFoPExD !"],
              ].map(([t, d], i) => (
                <li key={t}>
                  <span className="step-num">{i + 1}</span>
                  <div><strong>{t}</strong><p>{d}</p></div>
                </li>
              ))}
            </ol>

            <div className="aside-box">
              <FileText size={18} />
              <div>
                <strong>Pièces à fournir</strong>
                <Link href="/inscription/pieces">Voir la liste complète</Link>
              </div>
            </div>
            <div className="aside-box">
              <Phone size={18} />
              <div>
                <strong>Besoin d&#39;aide ?</strong>
                <a href={`tel:${CONTACT.telephones[0].replace(/\s/g, "")}`}>{CONTACT.telephones[0]}</a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
