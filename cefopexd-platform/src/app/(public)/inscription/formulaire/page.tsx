import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import SupabaseForm, { Field, SelectField, TextAreaField } from "@/components/forms/SupabaseForm";
import { SECTIONS } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Pré-inscription en ligne",
  description: "Déposez votre pré-inscription au CeFoPExD : notre équipe d'admission vous recontacte pour finaliser votre dossier.",
};

const FILIERES = Object.values(SECTIONS.filieres.pages ?? {}).map((p) => p.title);
const NIVEAUX = ["BEPC", "Probatoire", "BAC", "BAC +2 et plus", "Autre"];

/* =============================================
   PRÉ-INSCRIPTION — enregistrée dans la table `inscriptions`
   ============================================= */
export default function PreInscriptionPage() {
  return (
    <>
      <PageHeader
        title="Pré-inscription en ligne"
        intro="Remplissez ce formulaire : notre équipe d'admission vous recontacte pour finaliser votre dossier au centre."
        crumbs={[{ label: "Inscription", href: "/inscription" }, { label: "Pré-inscription en ligne" }]}
      />
      <section className="section">
        <div className="container form-layout">
          <SupabaseForm
            table="inscriptions"
            submitLabel="Envoyer ma pré-inscription"
            successTitle="Pré-inscription envoyée !"
            successText="Merci. Notre équipe d'admission vous recontacte très prochainement pour finaliser votre dossier."
          >
            <div className="form-grid">
              <Field label="Nom" name="nom" required autoComplete="family-name" />
              <Field label="Prénom(s)" name="prenom" required autoComplete="given-name" />
              <Field label="Téléphone" name="telephone" type="tel" required placeholder="+228 …" autoComplete="tel" />
              <Field label="E-mail" name="email" type="email" autoComplete="email" />
              <SelectField label="Filière souhaitée" name="filiere" options={FILIERES} required defaultLabel="— Choisir une filière —" />
              <SelectField label="Niveau d'étude" name="niveau_etude" options={NIVEAUX} required defaultLabel="— Choisir un niveau —" />
              <TextAreaField label="Message (facultatif)" name="message" />
            </div>
            <label className="consent">
              <input type="checkbox" name="consentement" required />
              <span>J&#39;accepte d&#39;être recontacté(e) par le CeFoPExD.</span>
            </label>
          </SupabaseForm>

          <aside className="form-aside">
            <h2 className="block-title">Les étapes</h2>
            <ol className="steps">
              {[
                ["Pré-inscription en ligne", "Remplissez ce formulaire."],
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
          </aside>
        </div>
      </section>
    </>
  );
}
