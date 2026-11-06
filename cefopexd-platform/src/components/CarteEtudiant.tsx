import type { SiteConfig } from "@/lib/site/types";

/* =============================================
   CARTE D'ÉTUDIANT IMPRIMABLE (format carte bancaire 85,6 × 54 mm)
   Uniquement les informations enregistrées dans la fiche de l'apprenant.
   Modèle réglé dans le Studio du site (onglet « Carte d'étudiant »).
   ============================================= */
export type ApprenantCarte = {
  id: string;
  matricule: string | null;
  nom: string;
  prenom: string;
  sexe: string | null;
  date_naissance: string | null;
  lieu_naissance: string | null;
  annee_academique: string | null;
  filiere: string | null;
  photo: string | null;
};

const dateFr = (d: string | null) => (d ? new Date(d).toLocaleDateString("fr-FR") : "");

export function CarteRecto({ a, site }: { a: ApprenantCarte; site: SiteConfig }) {
  const { carte, identite } = site;
  const naissance = [dateFr(a.date_naissance), a.lieu_naissance].filter(Boolean).join(" à ");
  return (
    <div className="carte-etu" style={{ "--carte-bande": carte.couleurBande, "--carte-fond": carte.couleurFond, "--carte-texte": carte.couleurTexte } as React.CSSProperties}>
      <div className="carte-bande">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="carte-logo" src={identite.logoIcone || identite.logo} alt="" />
        <div>
          <strong>{carte.titre}</strong>
          <span>{carte.sousTitre}</span>
        </div>
      </div>
      <div className="carte-corps">
        <div className="carte-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {a.photo ? <img src={a.photo} alt="" /> : <span>PHOTO</span>}
        </div>
        <dl className="carte-infos">
          <div><dt>Nom</dt><dd className="carte-nom">{a.nom.toUpperCase()}</dd></div>
          <div><dt>Prénom(s)</dt><dd>{a.prenom}</dd></div>
          {naissance && <div><dt>Né{a.sexe === "F" ? "e" : ""} le</dt><dd>{naissance}</dd></div>}
          {a.filiere && <div><dt>Filière</dt><dd>{a.filiere}</dd></div>}
          <div className="carte-ligne">
            {a.matricule && <div><dt>Matricule</dt><dd className="carte-matricule">{a.matricule}</dd></div>}
            <div><dt>Année</dt><dd>{a.annee_academique || carte.anneeParDefaut}</dd></div>
          </div>
        </dl>
      </div>
      <div className="carte-pied">
        <span>{carte.signataire}</span>
      </div>
    </div>
  );
}

export function CarteVerso({ a, site }: { a: ApprenantCarte; site: SiteConfig }) {
  const { carte, contact, identite } = site;
  return (
    <div className="carte-etu carte-verso" style={{ "--carte-bande": carte.couleurBande, "--carte-fond": carte.couleurFond, "--carte-texte": carte.couleurTexte } as React.CSSProperties}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="carte-verso-logo" src={identite.logo} alt="" />
      <p className="carte-mention">{carte.mentionVerso}</p>
      <div className="carte-verso-contact">
        <span>{contact.localisation} — {contact.adresse}</span>
        <span>{contact.telephones.join(" / ")}</span>
        <span>{contact.email}</span>
      </div>
      {a.matricule && <div className="carte-verso-matricule">{a.matricule}</div>}
    </div>
  );
}
