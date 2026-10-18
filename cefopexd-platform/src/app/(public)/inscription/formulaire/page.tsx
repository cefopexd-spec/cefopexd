import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Info, Lock, Phone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GoogleButton from "@/components/auth/GoogleButton";
import CreationCompte from "@/components/auth/CreationCompte";
import { redirect } from "next/navigation";
import { getSession, nomComplet } from "@/lib/session";
import { alerteNouvelleInscription } from "../actions";
import FileUpload from "@/components/forms/FileUpload";
import { CATEGORIES_DOCUMENT, DOCUMENTS_INSCRIPTION } from "@/lib/roles";
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
  const { user, profil } = await getSession();
  // Compte créé mais profil incomplet : on le complète d'abord
  if (user && !profil?.profil_complet) redirect("/mon-compte/completer?next=/inscription/formulaire");

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
                <h2>Créez votre compte pour vous pré-inscrire</h2>
                <p>
                  Indiquez votre identité, puis continuez avec Google. Vous compléterez ensuite votre photo et vos documents,
                  et suivrez votre demande dans « Mon espace ».
                </p>
                <CreationCompte next="/inscription/formulaire" />
                <div className="auth-separateur"><span>déjà un compte ?</span></div>
                <GoogleButton next="/inscription/formulaire" label="Me connecter avec Google" />
                <small>
                  Aucun mot de passe à créer. En continuant, vous acceptez nos{" "}
                  <Link href="/conditions-utilisation">conditions d&#39;utilisation</Link> et notre{" "}
                  <Link href="/confidentialite">politique de confidentialité</Link>.
                </small>
              </div>
            ) : (
            <>
            <div className="auth-connected">
              {profil.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profil.photo_url} alt="" referrerPolicy="no-referrer" />
              ) : (
                <span className="profile-initial">{(profil.prenom || profil.email).charAt(0).toUpperCase()}</span>
              )}
              <div>
                <strong>Connecté(e) en tant que {nomComplet(profil)} (@{profil.pseudo})</strong>
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
              apresEnvoi={alerteNouvelleInscription}
              submitLabel="Envoyer ma pré-inscription"
              successTitle="Votre pré-inscription est bien enregistrée !"
              successText="Notre équipe d'admission vous contactera très prochainement par téléphone pour la suite de votre dossier."
              nextSteps={[
                "Notre équipe vous appelle pour fixer un rendez-vous.",
                "Vous déposez votre dossier au centre (diplôme, acte de naissance, 2 photos d'identité).",
                "Un entretien d'orientation confirme votre choix de filière.",
              ]}
            >
              {/* Qui est le demandeur et pourquoi : repris du profil */}
              <input type="hidden" name="type_demandeur" value={profil.type_demandeur ?? ""} />
              <input type="hidden" name="motif" value={profil.motif ?? ""} />

              <h2 className="form-section-title">1. Identité de l&#39;apprenant(e)</h2>
              <div className="form-grid">
                <Field label="Nom" name="nom" required autoComplete="family-name" defaultValue={profil.nom ?? ""} />
                <Field label="Prénom(s)" name="prenom" required autoComplete="given-name" defaultValue={profil.prenom ?? ""} />
                <Field label="Date de naissance" name="date_naissance" type="date" required defaultValue={profil.date_naissance ?? ""} />
                <Field label="Lieu de naissance" name="lieu_naissance" required defaultValue={profil.lieu_naissance ?? ""} />
                <Field label="Téléphone" name="telephone" type="tel" required placeholder="+228 …" autoComplete="tel" defaultValue={profil.telephone ?? ""} />
                <Field label="E-mail" name="email" type="email" defaultValue={profil.email} readOnly hint="Adresse de votre compte Google" />
              </div>
              {profil.type_demandeur === "parent" && (
                <p className="field-hint" style={{ marginTop: "-6px", marginBottom: "12px" }}>
                  Vous inscrivez votre enfant : remplacez les informations ci-dessus par les siennes.
                </p>
              )}

              <h2 className="form-section-title">2. Photo et documents de l&#39;apprenant(e)</h2>
              <div className="upload-grid">
                <FileUpload label="Photo d'identité (format passeport)" categorie="photo" bucket="photos" required hint="Visage de face, fond clair." />
                {DOCUMENTS_INSCRIPTION.map((c) => (
                  <FileUpload key={c} label={CATEGORIES_DOCUMENT[c]} categorie={c} hint="Facultatif — peut aussi être déposé au centre." />
                ))}
              </div>

              <h2 className="form-section-title">3. Votre formation</h2>
              <div className="form-grid">
                <SelectField label="Filière souhaitée" name="filiere" options={FILIERES} required defaultLabel="— Choisir une filière —" />
                <SelectField label="Niveau d'étude" name="niveau_etude" options={NIVEAUX} required defaultLabel="— Choisir un niveau —" />
                <TextAreaField label="Message (facultatif)" name="message" placeholder="Une question, une précision sur votre parcours…" />
              </div>

              <label className="consent">
                <input type="checkbox" name="consentement" required />
                <span>
                  J&#39;accepte d&#39;être recontacté(e) par le CeFoPExD au sujet de ma demande, ainsi que les{" "}
                  <Link href="/conditions-utilisation">conditions d&#39;utilisation</Link> et la{" "}
                  <Link href="/confidentialite">politique de confidentialité</Link>.
                </span>
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
