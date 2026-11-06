import { BLOCS_FILIERES, CHIFFRES, CONTACT, DIRECTEUR, FILIERES, SECTIONS, SOCIAL } from "@/lib/site-content";
import { PIECES } from "@/lib/roles";
import type { FiliereSite, SectionSite, SiteConfig } from "./types";

/* =============================================
   CONTENU PAR DÉFAUT DU SITE
   Reprend à l'identique le site tel qu'il a été construit.
   Le Studio enregistre uniquement les modifications par-dessus.
   ============================================= */

const ICONES_FILIERES: Record<string, string> = {
  informatique: "monitor",
  mecatronique: "settings",
  "agro-alimentaire": "leaf",
  "energie-renouvelable": "sun",
  "langue-allemande": "languages",
  "formations-courtes": "wrench",
};
const COULEURS_FILIERES: Record<string, string> = {
  informatique: "#0A1FE8",
  mecatronique: "#F82303",
  "agro-alimentaire": "#22C003",
  "energie-renouvelable": "#FDA603",
  "langue-allemande": "#0A1FE8",
  "formations-courtes": "#22C003",
};
const TEXTES_FILIERES: Record<string, string> = {
  informatique: "#0A1FE8",
  mecatronique: "#D01B00",
  "agro-alimentaire": "#0F7A00",
  "energie-renouvelable": "#08137A",
  "langue-allemande": "#0A1FE8",
  "formations-courtes": "#0F7A00",
};
const RESUMES_FILIERES: Record<string, string> = {
  informatique: "Développez vos compétences en programmation, réseaux, bases de données et bureautique.",
  mecatronique: "Maîtrisez la mécanique, l'électronique, l'automatisme et la maintenance des équipements.",
  "agro-alimentaire": "Transformez et valorisez les produits agricoles dans le respect des normes sanitaires.",
  "energie-renouvelable": "Formez-vous aux solutions énergétiques durables pour un avenir plus vert.",
  "langue-allemande": "Apprenez l'allemand de A1 à B2 avec préparation aux examens certifiants.",
  "formations-courtes": "Des modules courts en artisanat et informatique pour acquérir rapidement de nouvelles compétences.",
};

const filieres: FiliereSite[] = Object.entries(FILIERES).map(([slug, f]) => ({
  slug,
  titre: f.title,
  resume: RESUMES_FILIERES[slug] ?? f.intro,
  intro: f.intro,
  image: f.image ?? "",
  icone: ICONES_FILIERES[slug] ?? "book-open",
  couleur: COULEURS_FILIERES[slug] ?? "#0A1FE8",
  couleurTexte: TEXTES_FILIERES[slug] ?? "#0A1FE8",
  visible: true,
  duree: f.duree ?? "",
  diplome: f.duree ? "Certificat de qualification professionnelle" : "",
  admission: f.duree ? "À partir du BEPC" : "",
  competences: f.skills ?? [],
  debouches: f.jobs ?? [],
  // Les blocs générés (durée, compétences, débouchés, appel à l'inscription) sont recréés à l'affichage
  blocs: (BLOCS_FILIERES[slug] ?? []).filter((b) => b.type !== "cta"),
}));

const pages: SectionSite[] = Object.entries(SECTIONS).map(([slug, s]) => ({
  slug,
  titre: s.title,
  intro: s.intro,
  image: s.image ?? "",
  visible: true,
  blocs: s.blocks,
  // Les pages des filières sont gérées dans l'onglet « Filières »
  sousPages:
    slug === "filieres"
      ? []
      : Object.entries(s.pages ?? {}).map(([ps, p]) => ({
          slug: ps,
          titre: p.title,
          intro: p.intro,
          image: p.image ?? "",
          visible: true,
          blocs: p.blocks,
        })),
}));

const menuFilieres = filieres.map((f) => ({ label: f.titre, href: `/filieres/${f.slug}`, icone: "book-open", visible: true }));

export const SITE_DEFAUT: SiteConfig = {
  identite: {
    nom: "CeFoPExD",
    nomComplet: "Centre de Formation Professionnelle d'Excellence de Dévikinmé",
    slogan: "Ensemble pour une jeunesse compétente et un avenir meilleur !",
    logo: "/logo-cefopexd.png",
    logoIcone: "/logo-mark.png",
    titreSeo: "CeFoPExD — Centre de Formation Professionnelle d'Excellence de Dévikinmé",
    descriptionSeo:
      "Le CeFoPExD offre des formations professionnelles d'excellence à Lomé, Togo : Informatique, Mécatronique, Agro-alimentaire, Énergie renouvelable, Langue allemande.",
    imageBandeau: "/images/campus-cefopexd.jpg",
  },

  theme: {
    couleurs: {
      "logo-green": "#22C003",
      "logo-red": "#F82303",
      "logo-blue": "#0A1FE8",
      "logo-orange": "#FDA603",
      primary: "#0A1FE8",
      "primary-dark": "#08137A",
      ink: "#050B47",
      "blue-deep": "#0B1C94",
      "btn-blue": "#0B22D6",
      "btn-red": "#D01B00",
      accent: "#F82303",
      "accent-text": "#D01B00",
      green: "#138800",
      "green-text": "#0F7A00",
      highlight: "#FDA603",
      text: "#0E1433",
      muted: "#3A4258",
      bg: "#FFFFFF",
      "bg-soft": "#F4F6FC",
      border: "#E3E7F1",
    },
    policeTitres: "Plus Jakarta Sans",
    policeTexte: "Inter",
    arrondi: 12,
    cssPerso: "",
  },

  contact: {
    adresse: CONTACT.adresse,
    localisation: CONTACT.localisation,
    telephones: [...CONTACT.telephones],
    email: CONTACT.email,
    whatsapp: CONTACT.whatsapp,
    carte: CONTACT.carte,
    itineraire: CONTACT.itineraire,
    horaires: "Du lundi au vendredi, de 8 h à 17 h",
  },

  reseaux: [
    { reseau: "facebook", url: SOCIAL.facebook, visible: true },
    { reseau: "instagram", url: SOCIAL.instagram, visible: true },
    { reseau: "tiktok", url: SOCIAL.tiktok, visible: true },
    { reseau: "youtube", url: SOCIAL.youtube, visible: true },
  ],

  entete: {
    afficherContacts: true,
    texteAppel: "Appelez-nous",
    texteEcrire: "Écrivez-nous",
    afficherReseaux: true,
    afficherRecherche: true,
    texteConnexion: "Se connecter",
    boutonCta: { label: "S'inscrire", href: "/inscription/formulaire" },
    menu: [
      { label: "Accueil", href: "/", icone: "home", visible: true, enfants: [] },
      {
        label: "À propos", href: "/a-propos", icone: "info", visible: true,
        enfants: [
          { label: "Présentation du centre", href: "/a-propos/presentation", icone: "building-2", visible: true },
          { label: "Mot du Directeur Général", href: "/a-propos/mot-du-dg", icone: "graduation-cap", visible: true },
          { label: "Vision, mission et valeurs", href: "/a-propos/vision-mission", icone: "book-open", visible: true },
          { label: "Nos buts et objectifs", href: "/a-propos/objectifs", icone: "book-open", visible: true },
          { label: "Équipe administrative", href: "/a-propos/equipe", icone: "building-2", visible: true },
          { label: "Infrastructures", href: "/a-propos/infrastructures", icone: "building-2", visible: true },
          { label: "Partenaires", href: "/a-propos/partenaires", icone: "building-2", visible: true },
        ],
      },
      { label: "Nos filières", href: "/filieres", icone: "book-open", visible: true, enfants: menuFilieres },
      {
        label: "Formations", href: "/formations", icone: "calendar", visible: true,
        enfants: [
          { label: "Calendrier académique", href: "/formations/calendrier", icone: "calendar", visible: true },
          { label: "Sessions à venir", href: "/formations/sessions", icone: "calendar", visible: true },
          { label: "Séminaires et ateliers", href: "/formations/seminaires", icone: "calendar", visible: true },
          { label: "Formations sur mesure", href: "/formations/sur-mesure", icone: "calendar", visible: true },
        ],
      },
      {
        label: "Inscription", href: "/inscription", icone: "graduation-cap", visible: true,
        enfants: [
          { label: "Comment s'inscrire", href: "/inscription/procedure", icone: "graduation-cap", visible: true },
          { label: "Pièces à fournir", href: "/inscription/pieces", icone: "graduation-cap", visible: true },
          { label: "Frais de formation", href: "/inscription/frais", icone: "graduation-cap", visible: true },
          { label: "Pré-inscription en ligne", href: "/inscription/formulaire", icone: "graduation-cap", visible: true },
        ],
      },
      {
        label: "S'informer", href: "/informations", icone: "newspaper", visible: true,
        enfants: [
          { label: "Actualités & annonces", href: "/informations/actualites", icone: "info", visible: true },
          { label: "Événements", href: "/informations/evenements", icone: "calendar", visible: true },
          { label: "Publications", href: "/informations/publications", icone: "book-open", visible: true },
          { label: "Galerie photos/vidéos", href: "/informations/galerie", icone: "building-2", visible: true },
          { label: "FAQ", href: "/informations/faq", icone: "info", visible: true },
        ],
      },
      { label: "Contact", href: "/contact", icone: "phone", visible: true, enfants: [] },
    ],
  },

  pied: {
    texteApropos: "Centre de Formation Professionnelle d'Excellence de Dévikinmé. Des formations qualifiantes pour un avenir durable.",
    colonnes: [
      {
        titre: "Liens rapides",
        liens: [
          { label: "À propos du centre", href: "/a-propos/presentation" },
          { label: "Mot du Directeur Général", href: "/a-propos/mot-du-dg" },
          { label: "Comment s'inscrire", href: "/inscription/procedure" },
          { label: "Pré-inscription en ligne", href: "/inscription/formulaire" },
          { label: "Actualités & annonces", href: "/informations/actualites" },
          { label: "Questions fréquentes", href: "/informations/faq" },
          { label: "Contact", href: "/contact" },
        ],
      },
      { titre: "Nos filières", liens: menuFilieres.map(({ label, href }) => ({ label, href })) },
    ],
    titreContact: "Nous trouver",
    afficherCarte: true,
    texteItineraire: "Itinéraire vers le centre",
    slogan: "Ensemble pour une jeunesse compétente et un avenir meilleur !",
    copyright: "© {annee} CeFoPExD — Tous droits réservés",
    liensLegaux: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "Conditions d'utilisation", href: "/conditions-utilisation" },
      { label: "Politique de confidentialité", href: "/confidentialite" },
    ],
    whatsappFlottant: true,
    assistant: true,
  },

  accueil: {
    ordre: ["hero", "stats", "atouts", "filieres", "apropos", "directeur", "pourquoi", "appel"],
    hero: {
      visible: true,
      intervalle: 6,
      slides: [
        {
          image: "/images/campus-cefopexd.jpg",
          alt: "Vue aérienne du campus du CeFoPExD à Dévikinmé",
          legende: "Le campus de Dévikinmé",
          surtitre: "BIENVENUE AU CeFoPExD",
          titre: "Votre avenir professionnel",
          accent: "commence ici !",
          sousTitre: "Le Centre de Formation Professionnelle d'Excellence de Dévikinmé vous offre une formation de qualité, adaptée aux besoins du marché de l'emploi et aux défis de demain.",
        },
        {
          image: "/images/eleves-cefopexd.jpg",
          alt: "Élèves du CeFoPExD en séance de formation",
          legende: "Nos apprenants en séance",
          surtitre: "EXCELLENCE & INNOVATION",
          titre: "Des formations pour créer",
          accent: "l'emploi de demain",
          sousTitre: "Nous formons des cadres capables de créer de l'emploi dans leur domaine de formation. L'excellence et l'intégrité sont au cœur de notre pédagogie.",
        },
        {
          image: "/images/batiment-cefopexd.jpg",
          alt: "Bâtiment de formation du CeFoPExD",
          legende: "Nos bâtiments de formation",
          surtitre: "6 FILIÈRES D'EXCELLENCE",
          titre: "Informatique, Mécatronique,",
          accent: "Énergie et plus encore",
          sousTitre: "De l'informatique appliquée à l'énergie renouvelable, en passant par l'agro-alimentaire et la langue allemande, trouvez la filière qui correspond à vos ambitions.",
        },
      ],
      boutons: [
        { label: "Découvrir nos filières", href: "/filieres", style: "primaire", icone: "arrow-right" },
        { label: "S'inscrire maintenant", href: "/inscription/formulaire", style: "rouge", icone: "pen-line" },
      ],
      garanties: ["Formations qualifiantes", "Encadrement professionnel", "Insertion professionnelle"],
    },
    stats: {
      visible: true,
      items: CHIFFRES.map((c, i) => ({
        valeur: c.value,
        suffixe: c.suffix,
        label: c.label,
        icone: ["users", "book-open", "percent", "star"][i] ?? "star",
        couleur: ["#0F7A00", "#D01B00", "#0A1FE8", "#9A5B00"][i] ?? "#0A1FE8",
      })),
    },
    atouts: {
      visible: true,
      items: [
        { icone: "award", titre: "Formations qualifiantes", desc: "Des compétences pour réussir" },
        { icone: "users", titre: "Encadrement professionnel", desc: "Une équipe pédagogique expérimentée" },
        { icone: "building-2", titre: "Infrastructures modernes", desc: "Des équipements à la pointe" },
        { icone: "handshake", titre: "Partenariats solides", desc: "Avec les entreprises et institutions" },
        { icone: "trending-up", titre: "Insertion professionnelle", desc: "Un tremplin vers l'emploi" },
      ],
    },
    filieres: {
      visible: true,
      surtitre: "— NOS FILIÈRES —",
      titre: "Nos filières de formation",
      sousTitre: "Choisissez la filière qui correspond à vos ambitions et construisez votre avenir avec nous.",
      texteBoutonCarte: "Détails",
      bouton: { label: "Voir toutes les filières", href: "/filieres" },
    },
    apropos: {
      visible: true,
      surtitre: "À propos de nous",
      titre: "Le CeFoPExD, un centre d'excellence",
      image: "/images/campus-cefopexd.jpg",
      legendeImage: "CeFoPExD — Dévikinmé, Togo",
      texte: "Le Centre de Formation Professionnelle d'Excellence de Dévikinmé est un établissement engagé dans la formation de jeunes talents, capables de répondre aux besoins du monde professionnel et de contribuer au développement durable de notre pays.",
      cartes: [
        { label: "Vision", titre: "Développer les compétences", desc: "Révéler le potentiel de chaque jeune par une formation exigeante.", couleur: "#0A1FE8" },
        { label: "Mission", titre: "Former pour l'emploi", desc: "Des professionnels capables de créer de l'emploi, pas seulement d'en demander.", couleur: "#0F7A00" },
        { label: "Valeurs", titre: "Excellence, intégrité, solidarité", desc: "Des principes qui guident notre pédagogie au quotidien.", couleur: "#D01B00" },
      ],
      bouton: { label: "En savoir plus", href: "/a-propos/presentation" },
    },
    actualites: {
      visible: true,
      surtitre: "Actualités & annonces",
      titre: "Restez informé",
      texteTout: "Voir toutes",
      publicationsAuto: true,
      items: [
        { titre: "Ouverture des inscriptions 2025-2026", date: "12 avril 2025", extrait: "Les inscriptions pour la nouvelle rentrée académique sont ouvertes. Ne manquez pas cette opportunité !", image: "/images/eleves-cefopexd.jpg", href: "/inscription/formulaire" },
        { titre: "Journée portes ouvertes au CeFoPExD", date: "28 mars 2025", extrait: "Découvrez nos infrastructures et rencontrez notre équipe pédagogique lors de notre journée portes ouvertes.", image: "/images/batiment-cefopexd.jpg", href: "/informations/evenements" },
        { titre: "Lancement de la filière Énergie renouvelable", date: "14 mars 2025", extrait: "Une nouvelle filière pour répondre aux enjeux de demain et aux besoins croissants en énergies vertes.", image: "/images/filiere-energie.jpg", href: "/filieres/energie-renouvelable" },
      ],
      encartTitre: "Prêt à rejoindre le CeFoPExD ?",
      encartTexte: "Déposez votre pré-inscription en ligne.",
      encartBouton: { label: "S'inscrire", href: "/inscription/formulaire" },
    },
    directeur: {
      visible: true,
      surtitre: "Mot du Directeur Général",
      titre: "Former aujourd'hui les professionnels qui bâtiront demain",
      bouton: { label: "Lire le message complet", href: "/a-propos/mot-du-dg" },
    },
    pourquoi: {
      visible: true,
      surtitre: "Nos engagements",
      titre: "Pourquoi choisir le CeFoPExD ?",
      sousTitre: "Six engagements qui font de notre centre un tremplin vers la réussite professionnelle.",
      items: [
        { titre: "Formation d'excellence", desc: "Un enseignement de qualité qui fait de l'excellence sa priorité, en créant la différence pour devenir une référence.", couleur: "#0A1FE8" },
        { titre: "Insertion professionnelle", desc: "Nous formons des cadres capables de créer de l'emploi dans leur domaine, pas seulement d'en demander.", couleur: "#D01B00" },
        { titre: "Égalité des chances", desc: "Nous respectons les différences et favorisons l'égalité des chances, car la diversité est une richesse.", couleur: "#0F7A00" },
        { titre: "Recherche & innovation", desc: "Une place essentielle est accordée à la recherche, notamment en entrepreneuriat, pour innover et progresser.", couleur: "#9A5B00" },
        { titre: "Adaptation continue", desc: "Nos formations sont sans cesse adaptées à l'évolution de la société et aux besoins du marché de l'emploi.", couleur: "#0A1FE8" },
        { titre: "Valeurs humaines", desc: "Paix, tolérance, intégrité et équité : nous formons des femmes et des hommes acteurs responsables de la société.", couleur: "#D01B00" },
      ],
    },
    appel: {
      visible: true,
      titre: "Prêt à construire votre avenir avec nous ?",
      texte: "Les inscriptions se font en présentiel au centre. Remplissez le formulaire de pré-inscription en ligne pour prendre rendez-vous avec notre équipe d'admission.",
      boutons: [
        { label: "Pré-inscription en ligne", href: "/inscription/formulaire", style: "rouge", icone: "arrow-right" },
        { label: "Nous contacter", href: "/contact", style: "primaire" },
      ],
      note: "📞 +228 70 88 13 06 · +228 79 95 20 20",
    },
    sectionsPerso: [],
  },

  directeur: {
    nom: DIRECTEUR.nom,
    fonction: DIRECTEUR.fonction,
    initiales: "BD",
    photo: "",
    extrait: DIRECTEUR.extrait,
    message: [...DIRECTEUR.message],
  },

  filieres,
  pages,

  formulaires: {
    contact: {
      titre: "Nous contacter",
      intro: "Une question sur nos formations, l'inscription ou un partenariat ? Notre équipe est à votre écoute.",
      messageTitre: "Bienvenue au CeFoPExD",
      message: "Que vous soyez futur apprenant, parent, entreprise ou partenaire, nous serons heureux de vous répondre. Laissez-nous un message ci-dessous : il est transmis directement à notre équipe, qui vous répond dans les meilleurs délais. Pour une réponse rapide, appelez-nous ou écrivez-nous sur WhatsApp.",
      titreFormulaire: "Votre message",
      sujets: ["Informations sur une filière", "Inscription", "Formation sur mesure (entreprise)", "Partenariat", "Autre demande"],
      bouton: "Envoyer le message",
      succesTitre: "Votre message a bien été envoyé !",
      succesTexte: "Notre équipe l'a bien reçu et vous répondra dans les meilleurs délais, par e-mail ou par téléphone.",
      titreCoordonnees: "Coordonnées",
      titreCarte: "Où nous trouver",
    },
    inscription: {
      titre: "Pré-inscription en ligne",
      intro: "Remplissez ce formulaire en quelques minutes : notre équipe d'admission vous recontacte pour finaliser votre dossier au centre.",
      connexionTitre: "Créez votre compte pour vous pré-inscrire",
      connexionTexte: "Indiquez votre identité, puis continuez avec Google. Vous compléterez ensuite votre photo et vos documents, et suivrez votre demande dans « Mon espace ».",
      consignesTitre: "Avant de commencer",
      consignes: [
        "Les champs marqués d'un * sont obligatoires.",
        "Indiquez un numéro de téléphone sur lequel vous êtes joignable : c'est par ce numéro que nous vous recontactons.",
        "Après l'envoi, un numéro de référence s'affiche : notez-le, il vous sera demandé au centre.",
        "La pré-inscription est gratuite et ne vous engage pas.",
      ],
      titreIdentite: "1. Identité de l'apprenant(e)",
      titreDocuments: "2. Photo et documents de l'apprenant(e)",
      titreFormation: "3. Votre formation",
      niveaux: ["BEPC", "Probatoire", "BAC", "BAC +2 et plus", "Autre"],
      bouton: "Envoyer ma pré-inscription",
      succesTitre: "Votre pré-inscription est bien enregistrée !",
      succesTexte: "Notre équipe d'admission vous contactera très prochainement par téléphone pour la suite de votre dossier.",
      etapesApres: [
        "Notre équipe vous appelle pour fixer un rendez-vous.",
        "Vous déposez votre dossier au centre (diplôme, acte de naissance, 2 photos d'identité).",
        "Un entretien d'orientation confirme votre choix de filière.",
      ],
      consentement: "J'accepte d'être recontacté(e) par le CeFoPExD au sujet de ma demande, ainsi que les conditions d'utilisation et la politique de confidentialité.",
      asideTitre: "Comment ça se passe ?",
      etapes: [
        { titre: "Connexion avec Google", desc: "Votre compte est créé en un clic." },
        { titre: "Pré-inscription en ligne", desc: "Vous remplissez ce formulaire." },
        { titre: "Appel de l'équipe", desc: "Nous vous contactons pour fixer un rendez-vous." },
        { titre: "Dépôt du dossier", desc: "Copie du diplôme, acte de naissance, 2 photos d'identité." },
        { titre: "Entretien d'orientation", desc: "Un conseiller vous aide à confirmer votre choix." },
        { titre: "Rentrée", desc: "Bienvenue dans la famille CeFoPExD !" },
      ],
    },
  },

  documents: {
    nomEtablissement: "Centre de Formation Professionnelle d'Excellence de Dévikinmé",
    lieu: "Dévikinmé",
    piedDePage: "Document généré par la plateforme de gestion du CeFoPExD — www.cefopexd.com",
    couleur: "#0A1FE8",
    cadre: true,
    signaturesFiche: ["L'administration", "Le Directeur Général"],
    signaturesAttestation: ["Le Directeur Général"],
    titreFiche: "Fiche d'inscription",
    pieces: [...PIECES],
    titreAttestation: "Attestation d'inscription",
    introAttestation: "Le Directeur Général du Centre de Formation Professionnelle d'Excellence de Dévikinmé (CeFoPExD) atteste que",
    finAttestation: "En foi de quoi, la présente attestation lui est délivrée pour servir et valoir ce que de droit.",
  },

  carte: {
    titre: "CARTE D'ÉTUDIANT",
    sousTitre: "Centre de Formation Professionnelle d'Excellence de Dévikinmé",
    couleurFond: "#FFFFFF",
    couleurBande: "#08137A",
    couleurTexte: "#0E1433",
    anneeParDefaut: "2026-2027",
    signataire: "Le Directeur Général",
    mentionVerso: "Cette carte est strictement personnelle. Elle doit être présentée à toute demande du personnel du centre. En cas de perte, prévenir le secrétariat. Si vous trouvez cette carte, merci de la rapporter au CeFoPExD.",
    afficherVerso: true,
  },
};
