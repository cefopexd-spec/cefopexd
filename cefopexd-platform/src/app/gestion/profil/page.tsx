import type { Metadata } from "next";
import Link from "next/link";
import { Mail, UserRound } from "lucide-react";
import ActionForm from "@/components/forms/ActionForm";
import { Field } from "@/components/forms/SupabaseForm";
import FileUpload from "@/components/forms/FileUpload";
import { requireGestion, nomComplet } from "@/lib/session";
import { roleLabel, ROLES } from "@/lib/roles";
import { urlsPhotos } from "@/lib/fichiers";
import { changerMonEmail, majMonProfil } from "../actions";

export const metadata: Metadata = { title: "Mon profil" };

type Props = { searchParams: Promise<{ email?: string }> };

/* =============================================
   MON PROFIL — chaque membre du personnel (Président Fondateur compris)
   modifie sa photo, son nom, son titre, son téléphone et son e-mail
   ============================================= */
export default async function MonProfil({ searchParams }: Props) {
  const { email: confirme } = await searchParams;
  const { supabase, profil } = await requireGestion("profil");
  const photo = profil.photo_path ? (await urlsPhotos(supabase, [profil.photo_path])).get(profil.photo_path) : null;
  const image = photo || profil.photo_url;
  const mission = ROLES.find((r) => r.value === profil.role)?.mission;

  return (
    <>
      <div className="g-page-head">
        <h1>Mon profil</h1>
        <p>Votre photo, votre nom et votre titre apparaissent dans l&#39;espace de gestion, la messagerie et les validations.</p>
      </div>

      {confirme && <p className="st-succes">Votre nouvelle adresse e-mail est confirmée.</p>}

      <div className="g-card g-profil-carte">
        <div className="g-photo-actuelle g-photo-ronde">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {image ? <img src={image} alt="" referrerPolicy="no-referrer" /> : <UserRound size={36} />}
        </div>
        <div>
          <strong className="g-profil-nom">{nomComplet(profil)}</strong>
          <span className="g-profil-titre">{profil.fonction || roleLabel(profil.role)}</span>
          <span className="field-hint">Poste : {roleLabel(profil.role)} · @{profil.pseudo} · {profil.email}</span>
          {mission && <p className="field-hint">{mission}</p>}
        </div>
      </div>

      <div className="g-grid-2">
        <div className="g-card">
          <div className="g-card-head"><h2>Identité et photo</h2></div>
          <ActionForm action={majMonProfil} submitLabel="Enregistrer" className="g-form" submitClassName="btn-hero-primary btn-sm">
            <FileUpload label="Nouvelle photo (facultatif)" categorie="photo" bucket="photos" hint="Visage de face, fond clair. JPG ou PNG, 5 Mo maximum." />
            <div className="form-grid">
              <Field label="Nom" name="nom" required defaultValue={profil.nom ?? ""} />
              <Field label="Prénom(s)" name="prenom" required defaultValue={profil.prenom ?? ""} />
              <Field label="Titre affiché" name="fonction" defaultValue={profil.fonction ?? ""} placeholder={roleLabel(profil.role)} hint="Ex. « Président Fondateur »" />
              <Field label="Téléphone" name="telephone" type="tel" defaultValue={profil.telephone ?? ""} />
            </div>
          </ActionForm>
        </div>

        <div className="g-card">
          <div className="g-card-head"><h2><Mail size={18} /> Adresse e-mail</h2></div>
          <p className="field-hint">
            Adresse actuelle : <strong>{profil.email}</strong>. Pour la changer, saisissez la nouvelle adresse :
            un lien de confirmation y sera envoyé. Le changement n&#39;a lieu qu&#39;après avoir cliqué sur ce lien.
            Si vous vous connectez avec Google, utilisez ensuite le compte Google de la nouvelle adresse.
          </p>
          <ActionForm action={changerMonEmail} submitLabel="Changer mon adresse e-mail" className="g-form" submitClassName="btn-hero-primary btn-sm">
            <Field label="Nouvelle adresse e-mail" name="email" type="email" required autoComplete="email" />
          </ActionForm>
          <p className="field-hint" style={{ marginTop: 12 }}>
            Mot de passe, documents et demandes : <Link href="/mon-espace">Mon espace personnel</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
