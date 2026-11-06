import type { Block } from "@/lib/site-content";

/* =============================================
   MODÈLE COMPLET DU SITE (modifiable dans le Studio)
   Tout ce qui s'affiche sur le site public vient de cet objet.
   ============================================= */
export type Lien = { label: string; href: string };
export type Bouton = Lien & { style?: "primaire" | "rouge" | "contour" | "jaune"; icone?: string };

export type MenuEnfant = Lien & { icone: string; visible: boolean };
export type MenuItem = Lien & { icone: string; visible: boolean; enfants: MenuEnfant[] };

export type PageSite = {
  slug: string;
  titre: string;
  intro: string;
  image: string;
  visible: boolean;
  blocs: Block[];
};
export type SectionSite = PageSite & { sousPages: PageSite[] };

export type FiliereSite = {
  slug: string;
  titre: string;
  resume: string;
  intro: string;
  image: string;
  icone: string;
  couleur: string;
  couleurTexte: string;
  visible: boolean;
  duree: string;
  diplome: string;
  admission: string;
  competences: string[];
  debouches: string[];
  blocs: Block[];
};

export type SectionPerso = {
  cle: string;
  visible: boolean;
  fond: "blanc" | "doux" | "sombre";
  surtitre: string;
  titre: string;
  sousTitre: string;
  blocs: Block[];
};

export type SiteConfig = {
  identite: {
    nom: string;
    nomComplet: string;
    slogan: string;
    logo: string;
    logoIcone: string;
    titreSeo: string;
    descriptionSeo: string;
    imageBandeau: string;
  };
  theme: {
    couleurs: Record<string, string>;
    policeTitres: string;
    policeTexte: string;
    arrondi: number;
    cssPerso: string;
  };
  contact: {
    adresse: string;
    localisation: string;
    telephones: string[];
    email: string;
    whatsapp: string;
    carte: string;
    itineraire: string;
    horaires: string;
  };
  reseaux: { reseau: string; url: string; visible: boolean }[];
  entete: {
    afficherContacts: boolean;
    texteAppel: string;
    texteEcrire: string;
    afficherReseaux: boolean;
    afficherRecherche: boolean;
    texteConnexion: string;
    boutonCta: Lien;
    menu: MenuItem[];
  };
  pied: {
    texteApropos: string;
    colonnes: { titre: string; liens: Lien[] }[];
    titreContact: string;
    afficherCarte: boolean;
    texteItineraire: string;
    slogan: string;
    copyright: string;
    liensLegaux: Lien[];
    whatsappFlottant: boolean;
    assistant: boolean;
  };
  accueil: {
    ordre: string[];
    hero: {
      visible: boolean;
      intervalle: number;
      slides: { image: string; alt: string; legende: string; surtitre: string; titre: string; accent: string; sousTitre: string }[];
      boutons: Bouton[];
      garanties: string[];
    };
    stats: { visible: boolean; items: { valeur: number; suffixe: string; label: string; icone: string; couleur: string }[] };
    atouts: { visible: boolean; items: { icone: string; titre: string; desc: string }[] };
    filieres: { visible: boolean; surtitre: string; titre: string; sousTitre: string; texteBoutonCarte: string; bouton: Lien };
    apropos: {
      visible: boolean; surtitre: string; titre: string; image: string; legendeImage: string; texte: string;
      cartes: { label: string; titre: string; desc: string; couleur: string }[]; bouton: Lien;
    };
    actualites: {
      visible: boolean; surtitre: string; titre: string; texteTout: string; publicationsAuto: boolean;
      items: { titre: string; date: string; extrait: string; image: string; href: string }[];
      encartTitre: string; encartTexte: string; encartBouton: Lien;
    };
    directeur: { visible: boolean; surtitre: string; titre: string; bouton: Lien };
    pourquoi: { visible: boolean; surtitre: string; titre: string; sousTitre: string; items: { titre: string; desc: string; couleur: string }[] };
    appel: { visible: boolean; titre: string; texte: string; boutons: Bouton[]; note: string };
    sectionsPerso: SectionPerso[];
  };
  directeur: { nom: string; fonction: string; initiales: string; photo: string; extrait: string; message: string[] };
  filieres: FiliereSite[];
  pages: SectionSite[];
  formulaires: {
    contact: {
      titre: string; intro: string; messageTitre: string; message: string; titreFormulaire: string;
      sujets: string[]; bouton: string; succesTitre: string; succesTexte: string; titreCoordonnees: string; titreCarte: string;
    };
    inscription: {
      titre: string; intro: string; connexionTitre: string; connexionTexte: string;
      consignesTitre: string; consignes: string[];
      titreIdentite: string; titreDocuments: string; titreFormation: string;
      niveaux: string[]; bouton: string; succesTitre: string; succesTexte: string; etapesApres: string[];
      consentement: string; asideTitre: string; etapes: { titre: string; desc: string }[];
    };
  };
  documents: {
    nomEtablissement: string;
    lieu: string;
    piedDePage: string;
    couleur: string;
    cadre: boolean;
    signaturesFiche: string[];
    signaturesAttestation: string[];
    titreFiche: string;
    pieces: string[];
    titreAttestation: string;
    introAttestation: string;
    finAttestation: string;
  };
  carte: {
    titre: string;
    sousTitre: string;
    couleurFond: string;
    couleurBande: string;
    couleurTexte: string;
    anneeParDefaut: string;
    signataire: string;
    mentionVerso: string;
    afficherVerso: boolean;
  };
};
