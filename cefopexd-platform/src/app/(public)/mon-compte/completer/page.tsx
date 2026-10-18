import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserRoundCheck } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ActionForm from "@/components/forms/ActionForm";
import { Field, TextAreaField } from "@/components/forms/SupabaseForm";
import FileUpload from "@/components/forms/FileUpload";
import TypeEtDocuments from "@/components/forms/TypeEtDocuments";
import { getSession } from "@/lib/session";
import { completerProfil } from "../actions";

export const metadata: Metadata = { title: "Compléter mon profil", robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string }> };

/* =============================================
   PREMIÈRE CONNEXION : informations d'identité + qui êtes-vous + motif
   ============================================= */
export default async function CompleterProfilPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const { user, profil } = await getSession();
  if (!user) redirect(`/connexion?next=${encodeURIComponent("/mon-compte/completer")}`);
  const suite = next && next.startsWith("/") && !next.startsWith("//") ? next : "/mon-espace";
  if (profil?.profil_complet) redirect(suite);

  return (
    <>
      <PageHeader
        title="Bienvenue ! Complétez votre profil"
        intro="Ces informations permettent à l'équipe du CeFoPExD de vous identifier et de traiter votre demande. Cela prend une minute."
        crumbs={[{ label: "Mon compte" }, { label: "Compléter mon profil" }]}
      />
      <section className="section">
        <div className="container form-layout">
          <ActionForm action={completerProfil} submitLabel="Enregistrer mon profil">
            <input type="hidden" name="next" value={suite} />
            <h2 className="form-section-title">1. Votre identité</h2>
            <div className="form-grid">
              <Field label="Nom" name="nom" required defaultValue={profil?.nom ?? ""} autoComplete="family-name" />
              <Field label="Prénom(s)" name="prenom" required defaultValue={profil?.prenom ?? ""} autoComplete="given-name" />
              <Field label="Date de naissance" name="date_naissance" type="date" required defaultValue={profil?.date_naissance ?? ""} autoComplete="bday" />
              <Field label="Lieu de naissance" name="lieu_naissance" required defaultValue={profil?.lieu_naissance ?? ""} placeholder="Ville, pays" />
              <Field label="Téléphone" name="telephone" type="tel" defaultValue={profil?.telephone ?? ""} placeholder="+228 …" autoComplete="tel" />
              <Field label="E-mail" name="email" defaultValue={user.email ?? ""} readOnly />
            </div>
            <FileUpload
              label="Photo d'identité (format passeport)"
              categorie="photo"
              bucket="photos"
              required
              hint="Visage de face, fond clair, bien éclairé. Elle permet à l'équipe de vous identifier."
            />

            <h2 className="form-section-title">2. Qui êtes-vous ?</h2>
            <div className="form-grid">
              <TypeEtDocuments defaut={profil?.type_demandeur} />
              <TextAreaField
                label="Motif de votre inscription sur le site"
                name="motif"
                required
                placeholder="Ex. : je souhaite m'inscrire en informatique ; je cherche un stage en énergie solaire ; je veux suivre la scolarité de mon enfant…"
              />
            </div>
          </ActionForm>

          <aside className="form-aside">
            <h2 className="block-title">Et ensuite ?</h2>
            <ol className="steps">
              {[
                ["Votre compte est créé", `Un pseudo vous est attribué automatiquement (${profil?.pseudo ?? "à partir de votre e-mail"}). Vous pourrez le changer dans « Mon espace ».`],
                ["La direction est prévenue", "Le Directeur Général examine votre demande et vous attribue l'accès adapté."],
                ["Vous accédez à votre espace", "Pré-inscription, suivi de scolarité, messages… selon votre profil."],
              ].map(([t, d], i) => (
                <li key={t}>
                  <span className="step-num">{i + 1}</span>
                  <div><strong>{t}</strong><p>{d}</p></div>
                </li>
              ))}
            </ol>
            <div className="aside-box">
              <UserRoundCheck size={18} />
              <div><strong>Pseudo actuel</strong><span>@{profil?.pseudo}</span></div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
