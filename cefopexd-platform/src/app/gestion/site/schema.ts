/* =============================================
   STUDIO DU SITE — DESCRIPTION DE TOUS LES CHAMPS MODIFIABLES
   Chaque onglet du Studio correspond à une partie du site.
   L'éditeur affiche automatiquement le bon contrôle pour chaque champ.
   ============================================= */
export type Champ =
  | { t: "texte"; k: string; l: string; aide?: string; ph?: string }
  | { t: "zone"; k: string; l: string; aide?: string; lignes?: number }
  | { t: "nombre"; k: string; l: string; aide?: string; min?: number; max?: number }
  | { t: "oui"; k: string; l: string; aide?: string }
  | { t: "couleur"; k: string; l: string }
  | { t: "image"; k: string; l: string; aide?: string }
  | { t: "icone"; k: string; l: string }
  | { t: "choix"; k: string; l: string; options: { v: string; l: string }[] }
  | { t: "lien"; k: string; l: string }
  | { t: "textes"; k: string; l: string; aide?: string; long?: boolean; ajout?: string }
  | { t: "liste"; k: string; l: string; aide?: string; champs: Champ[]; titreItem?: string; nouveau: Record<string, unknown>; ajout?: string }
  | { t: "groupe"; k: string; l: string; champs: Champ[]; aide?: string }
  | { t: "blocs"; k: string; l: string; aide?: string }
  | { t: "ordre"; k: string; l: string }
  | { t: "couleurs"; k: string; l: string }
  | { t: "police"; k: string; l: string }
  | { t: "note"; texte: string };

export const STYLES_BOUTON = [
  { v: "primaire", l: "Bleu (principal)" },
  { v: "rouge", l: "Rouge (inscription)" },
  { v: "contour", l: "Contour (discret)" },
  { v: "jaune", l: "Jaune (mise en avant)" },
];

const BOUTON: Champ[] = [
  { t: "texte", k: "label", l: "Texte du bouton" },
  { t: "texte", k: "href", l: "Lien (page ou adresse)", ph: "/inscription/formulaire" },
  { t: "choix", k: "style", l: "Style", options: STYLES_BOUTON },
  { t: "icone", k: "icone", l: "Icône (facultatif)" },
];
const LIEN: Champ[] = [
  { t: "texte", k: "label", l: "Texte du lien" },
  { t: "texte", k: "href", l: "Lien (page ou adresse)", ph: "/contact" },
];

/* ---------- Blocs de contenu (pages, filières, sections libres) ---------- */
export const TYPES_BLOCS: Record<string, { l: string; aide: string; champs: Champ[]; nouveau: Record<string, unknown> }> = {
  text: {
    l: "Texte",
    aide: "Un titre (facultatif) et des paragraphes.",
    champs: [{ t: "texte", k: "title", l: "Titre du bloc (facultatif)" }, { t: "textes", k: "paragraphs", l: "Paragraphes", long: true, ajout: "Ajouter un paragraphe" }],
    nouveau: { type: "text", title: "", paragraphs: ["Nouveau paragraphe."] },
  },
  list: {
    l: "Liste à puces",
    aide: "Une liste avec des coches vertes.",
    champs: [{ t: "texte", k: "title", l: "Titre" }, { t: "textes", k: "items", l: "Éléments", ajout: "Ajouter un élément" }],
    nouveau: { type: "list", title: "Nouvelle liste", items: ["Premier élément"] },
  },
  facts: {
    l: "Chiffres / informations clés",
    aide: "Des petites cases « libellé : valeur » (durée, diplôme…).",
    champs: [{ t: "liste", k: "items", l: "Informations", titreItem: "label", champs: [{ t: "texte", k: "label", l: "Libellé" }, { t: "texte", k: "value", l: "Valeur" }], nouveau: { label: "Libellé", value: "Valeur" } }],
    nouveau: { type: "facts", items: [{ label: "Durée", value: "2 ans" }] },
  },
  steps: {
    l: "Étapes numérotées",
    aide: "Une procédure en étapes 1, 2, 3…",
    champs: [
      { t: "texte", k: "title", l: "Titre" },
      { t: "liste", k: "items", l: "Étapes", titreItem: "title", champs: [{ t: "texte", k: "title", l: "Titre de l'étape" }, { t: "zone", k: "desc", l: "Description" }], nouveau: { title: "Nouvelle étape", desc: "" } },
    ],
    nouveau: { type: "steps", title: "Les étapes", items: [{ title: "Première étape", desc: "" }] },
  },
  cards: {
    l: "Cartes (avec image)",
    aide: "Une grille de cartes, chacune avec image, titre, texte et lien.",
    champs: [
      { t: "texte", k: "title", l: "Titre (facultatif)" },
      {
        t: "liste", k: "items", l: "Cartes", titreItem: "title",
        champs: [
          { t: "texte", k: "title", l: "Titre" },
          { t: "zone", k: "desc", l: "Texte" },
          { t: "image", k: "image", l: "Image (facultatif)" },
          { t: "texte", k: "href", l: "Lien (facultatif)" },
          { t: "couleur", k: "color", l: "Couleur du titre" },
        ],
        nouveau: { title: "Nouvelle carte", desc: "", image: "", href: "", color: "" },
      },
    ],
    nouveau: { type: "cards", title: "", items: [{ title: "Nouvelle carte", desc: "", image: "", href: "", color: "" }] },
  },
  faq: {
    l: "Questions fréquentes",
    aide: "Questions/réponses dépliables.",
    champs: [
      { t: "texte", k: "title", l: "Titre" },
      { t: "liste", k: "items", l: "Questions", titreItem: "q", champs: [{ t: "texte", k: "q", l: "Question" }, { t: "zone", k: "a", l: "Réponse" }], nouveau: { q: "Nouvelle question ?", a: "" } },
    ],
    nouveau: { type: "faq", title: "Questions fréquentes", items: [{ q: "Nouvelle question ?", a: "" }] },
  },
  gallery: {
    l: "Galerie photos",
    aide: "Une grille de photos.",
    champs: [
      { t: "texte", k: "title", l: "Titre (facultatif)" },
      { t: "liste", k: "images", l: "Photos", titreItem: "alt", champs: [{ t: "image", k: "src", l: "Photo" }, { t: "texte", k: "alt", l: "Description de la photo" }], nouveau: { src: "", alt: "" } },
    ],
    nouveau: { type: "gallery", title: "", images: [] },
  },
  image: {
    l: "Image seule",
    aide: "Une grande image avec une légende.",
    champs: [{ t: "image", k: "src", l: "Image" }, { t: "texte", k: "alt", l: "Description" }, { t: "texte", k: "legende", l: "Légende (facultatif)" }],
    nouveau: { type: "image", src: "", alt: "", legende: "" },
  },
  video: {
    l: "Vidéo (YouTube / Vimeo)",
    aide: "Collez le lien de la vidéo.",
    champs: [{ t: "texte", k: "titre", l: "Titre (facultatif)" }, { t: "texte", k: "url", l: "Lien de la vidéo", ph: "https://www.youtube.com/watch?v=…" }],
    nouveau: { type: "video", titre: "", url: "" },
  },
  boutons: {
    l: "Rangée de boutons",
    aide: "Un ou plusieurs boutons côte à côte.",
    champs: [{ t: "liste", k: "items", l: "Boutons", titreItem: "label", champs: BOUTON.slice(0, 3), nouveau: { label: "Nouveau bouton", href: "/", style: "primaire" } }],
    nouveau: { type: "boutons", items: [{ label: "Nouveau bouton", href: "/", style: "primaire" }] },
  },
  cta: {
    l: "Encadré d'appel à l'action",
    aide: "Un encadré avec un titre, un texte et deux boutons.",
    champs: [
      { t: "texte", k: "title", l: "Titre" },
      { t: "zone", k: "text", l: "Texte" },
      { t: "lien", k: "primary", l: "Bouton principal" },
      { t: "lien", k: "secondary", l: "Bouton secondaire (facultatif)" },
    ],
    nouveau: { type: "cta", title: "Prêt à nous rejoindre ?", text: "", primary: { label: "Pré-inscription en ligne", href: "/inscription/formulaire" }, secondary: { label: "", href: "" } },
  },
  pending: {
    l: "Contenu en préparation",
    aide: "Message d'attente avec le téléphone et l'e-mail du centre.",
    champs: [{ t: "zone", k: "text", l: "Message" }],
    nouveau: { type: "pending", text: "Ces informations seront publiées très prochainement." },
  },
  director: {
    l: "Message du Directeur Général",
    aide: "Affiche le message complet du DG (modifiable dans l'onglet « Directeur Général »).",
    champs: [],
    nouveau: { type: "director" },
  },
};

const PAGE: Champ[] = [
  { t: "texte", k: "titre", l: "Titre de la page" },
  { t: "texte", k: "slug", l: "Adresse de la page", aide: "Lettres minuscules, chiffres et tirets uniquement (ex. « nos-partenaires »)." },
  { t: "oui", k: "visible", l: "Page visible sur le site" },
  { t: "zone", k: "intro", l: "Introduction (sous le titre)" },
  { t: "image", k: "image", l: "Grande image en haut de page (facultatif)" },
  { t: "blocs", k: "blocs", l: "Contenu de la page" },
];

/* ---------- Onglets du Studio ---------- */
export type Onglet = { cle: string; l: string; icone: string; aide: string; champs: Champ[] };

export const ONGLETS: Onglet[] = [
  {
    cle: "identite", l: "Identité & logo", icone: "badge-check",
    aide: "Nom du centre, logos, slogan, image de fond des bandeaux et référencement Google.",
    champs: [
      { t: "texte", k: "nom", l: "Nom court (sigle)" },
      { t: "texte", k: "nomComplet", l: "Nom complet de l'établissement" },
      { t: "texte", k: "slogan", l: "Slogan" },
      { t: "image", k: "logo", l: "Logo principal (en-tête, pied de page, documents)" },
      { t: "image", k: "logoIcone", l: "Logo réduit (icône de l'onglet du navigateur, légendes)" },
      { t: "image", k: "imageBandeau", l: "Image de fond des bandeaux (accueil et pages intérieures)" },
      { t: "texte", k: "titreSeo", l: "Titre du site dans Google" },
      { t: "zone", k: "descriptionSeo", l: "Description du site dans Google" },
    ],
  },
  {
    cle: "theme", l: "Thème & couleurs", icone: "palette",
    aide: "Couleurs, polices et arrondis de tout le site. Choisissez un thème prêt à l'emploi ou réglez chaque couleur.",
    champs: [
      { t: "couleurs", k: "couleurs", l: "Couleurs du site" },
      { t: "police", k: "policeTitres", l: "Police des titres" },
      { t: "police", k: "policeTexte", l: "Police du texte" },
      { t: "nombre", k: "arrondi", l: "Arrondi des coins (en pixels)", min: 0, max: 40, aide: "0 = coins carrés, 12 = arrondi actuel, 24 = très arrondi." },
      { t: "zone", k: "cssPerso", l: "CSS personnalisé (avancé)", lignes: 6, aide: "Réservé aux personnes qui connaissent le CSS. Laissez vide sinon." },
    ],
  },
  {
    cle: "entete", l: "En-tête & menus", icone: "layers",
    aide: "Le haut du site : contacts rapides, recherche, boutons, menu principal et sous-menus.",
    champs: [
      { t: "oui", k: "afficherContacts", l: "Afficher le téléphone et l'e-mail en haut" },
      { t: "texte", k: "texteAppel", l: "Texte au-dessus du téléphone" },
      { t: "texte", k: "texteEcrire", l: "Texte au-dessus de l'e-mail" },
      { t: "oui", k: "afficherReseaux", l: "Afficher les réseaux sociaux en haut" },
      { t: "oui", k: "afficherRecherche", l: "Afficher le bouton de recherche" },
      { t: "texte", k: "texteConnexion", l: "Texte du bouton de connexion" },
      { t: "lien", k: "boutonCta", l: "Bouton mis en avant (jaune)" },
      {
        t: "liste", k: "menu", l: "Menu principal", titreItem: "label", ajout: "Ajouter un élément de menu",
        aide: "Glissez l'ordre avec les flèches. Chaque élément peut avoir des sous-menus.",
        champs: [
          { t: "texte", k: "label", l: "Texte du menu" },
          { t: "texte", k: "href", l: "Lien" },
          { t: "icone", k: "icone", l: "Icône" },
          { t: "oui", k: "visible", l: "Visible" },
          {
            t: "liste", k: "enfants", l: "Sous-menus", titreItem: "label", ajout: "Ajouter un sous-menu",
            champs: [{ t: "texte", k: "label", l: "Texte" }, { t: "texte", k: "href", l: "Lien" }, { t: "icone", k: "icone", l: "Icône" }, { t: "oui", k: "visible", l: "Visible" }],
            nouveau: { label: "Nouveau sous-menu", href: "/", icone: "book-open", visible: true },
          },
        ],
        nouveau: { label: "Nouveau menu", href: "/", icone: "info", visible: true, enfants: [] },
      },
    ],
  },
  {
    cle: "pied", l: "Pied de page", icone: "layers",
    aide: "Le bas du site : présentation, colonnes de liens, coordonnées, carte, slogan, mentions et boutons flottants.",
    champs: [
      { t: "zone", k: "texteApropos", l: "Texte de présentation (sous le logo)" },
      {
        t: "liste", k: "colonnes", l: "Colonnes de liens", titreItem: "titre", ajout: "Ajouter une colonne",
        champs: [
          { t: "texte", k: "titre", l: "Titre de la colonne" },
          { t: "liste", k: "liens", l: "Liens", titreItem: "label", champs: LIEN, nouveau: { label: "Nouveau lien", href: "/" }, ajout: "Ajouter un lien" },
        ],
        nouveau: { titre: "Nouvelle colonne", liens: [] },
      },
      { t: "texte", k: "titreContact", l: "Titre de la colonne contact" },
      { t: "oui", k: "afficherCarte", l: "Afficher la carte Google Maps" },
      { t: "texte", k: "texteItineraire", l: "Texte du lien d'itinéraire" },
      { t: "texte", k: "slogan", l: "Slogan (bande au-dessus du bas de page)" },
      { t: "texte", k: "copyright", l: "Mention de droits", aide: "{annee} est remplacé par l'année en cours." },
      { t: "liste", k: "liensLegaux", l: "Liens du bas de page", titreItem: "label", champs: LIEN, nouveau: { label: "Nouveau lien", href: "/" } },
      { t: "oui", k: "whatsappFlottant", l: "Bouton WhatsApp flottant" },
      { t: "oui", k: "assistant", l: "Assistant de discussion (robot)" },
    ],
  },
  {
    cle: "accueil", l: "Page d'accueil", icone: "home",
    aide: "Toutes les sections de la page d'accueil : ordre, visibilité, textes, images et boutons. Vous pouvez aussi créer vos propres sections.",
    champs: [
      { t: "ordre", k: "ordre", l: "Ordre des sections" },
      {
        t: "groupe", k: "hero", l: "Bandeau principal (diaporama)",
        champs: [
          { t: "oui", k: "visible", l: "Afficher cette section" },
          { t: "nombre", k: "intervalle", l: "Durée de chaque photo (secondes)", min: 2, max: 30 },
          {
            t: "liste", k: "slides", l: "Diapositives", titreItem: "titre", ajout: "Ajouter une diapositive",
            champs: [
              { t: "image", k: "image", l: "Photo" },
              { t: "texte", k: "alt", l: "Description de la photo" },
              { t: "texte", k: "legende", l: "Légende sur la photo" },
              { t: "texte", k: "surtitre", l: "Petit texte au-dessus du titre" },
              { t: "texte", k: "titre", l: "Titre" },
              { t: "texte", k: "accent", l: "Suite du titre (en couleur)" },
              { t: "zone", k: "sousTitre", l: "Texte sous le titre" },
            ],
            nouveau: { image: "/images/campus-cefopexd.jpg", alt: "", legende: "", surtitre: "", titre: "Nouveau titre", accent: "", sousTitre: "" },
          },
          { t: "liste", k: "boutons", l: "Boutons", titreItem: "label", champs: BOUTON, nouveau: { label: "Nouveau bouton", href: "/", style: "primaire", icone: "arrow-right" } },
          { t: "textes", k: "garanties", l: "Garanties (coches sous les boutons)" },
        ],
      },
      {
        t: "groupe", k: "stats", l: "Chiffres clés",
        champs: [
          { t: "oui", k: "visible", l: "Afficher cette section" },
          {
            t: "liste", k: "items", l: "Chiffres", titreItem: "label",
            champs: [
              { t: "nombre", k: "valeur", l: "Valeur" },
              { t: "texte", k: "suffixe", l: "Suffixe (+, %…)" },
              { t: "texte", k: "label", l: "Libellé" },
              { t: "icone", k: "icone", l: "Icône" },
              { t: "couleur", k: "couleur", l: "Couleur" },
            ],
            nouveau: { valeur: 10, suffixe: "+", label: "Nouveau chiffre", icone: "star", couleur: "#0A1FE8" },
          },
        ],
      },
      {
        t: "groupe", k: "atouts", l: "Bandeau des atouts",
        champs: [
          { t: "oui", k: "visible", l: "Afficher cette section" },
          { t: "liste", k: "items", l: "Atouts", titreItem: "titre", champs: [{ t: "icone", k: "icone", l: "Icône" }, { t: "texte", k: "titre", l: "Titre" }, { t: "texte", k: "desc", l: "Description" }], nouveau: { icone: "star", titre: "Nouvel atout", desc: "" } },
        ],
      },
      {
        t: "groupe", k: "filieres", l: "Section « Nos filières »",
        aide: "Les cartes des filières se modifient dans l'onglet « Filières ».",
        champs: [
          { t: "oui", k: "visible", l: "Afficher cette section" },
          { t: "texte", k: "surtitre", l: "Petit titre" },
          { t: "texte", k: "titre", l: "Titre" },
          { t: "zone", k: "sousTitre", l: "Sous-titre" },
          { t: "texte", k: "texteBoutonCarte", l: "Texte du bouton des cartes" },
          { t: "lien", k: "bouton", l: "Bouton sous les cartes" },
        ],
      },
      {
        t: "groupe", k: "apropos", l: "Section « À propos »",
        champs: [
          { t: "oui", k: "visible", l: "Afficher cette section" },
          { t: "texte", k: "surtitre", l: "Petit titre" },
          { t: "texte", k: "titre", l: "Titre" },
          { t: "image", k: "image", l: "Photo" },
          { t: "texte", k: "legendeImage", l: "Légende de la photo" },
          { t: "zone", k: "texte", l: "Texte" },
          { t: "liste", k: "cartes", l: "Encadrés (vision, mission…)", titreItem: "label", champs: [{ t: "texte", k: "label", l: "Étiquette" }, { t: "texte", k: "titre", l: "Titre" }, { t: "zone", k: "desc", l: "Texte" }, { t: "couleur", k: "couleur", l: "Couleur" }], nouveau: { label: "Nouveau", titre: "", desc: "", couleur: "#0A1FE8" } },
          { t: "lien", k: "bouton", l: "Bouton" },
        ],
      },
      {
        t: "groupe", k: "actualites", l: "Encadré « Actualités »",
        champs: [
          { t: "oui", k: "visible", l: "Afficher cet encadré" },
          { t: "texte", k: "surtitre", l: "Petit titre" },
          { t: "texte", k: "titre", l: "Titre" },
          { t: "texte", k: "texteTout", l: "Texte du lien « Voir toutes »" },
          { t: "oui", k: "publicationsAuto", l: "Afficher automatiquement les 3 dernières publications du secrétariat", aide: "Si aucune publication n'existe, les actualités ci-dessous sont affichées." },
          { t: "liste", k: "items", l: "Actualités (affichées par défaut)", titreItem: "titre", champs: [{ t: "texte", k: "titre", l: "Titre" }, { t: "texte", k: "date", l: "Date" }, { t: "zone", k: "extrait", l: "Résumé" }, { t: "image", k: "image", l: "Image" }, { t: "texte", k: "href", l: "Lien" }], nouveau: { titre: "Nouvelle actualité", date: "", extrait: "", image: "", href: "/informations/actualites" } },
          { t: "texte", k: "encartTitre", l: "Titre de l'encart d'inscription" },
          { t: "texte", k: "encartTexte", l: "Texte de l'encart" },
          { t: "lien", k: "encartBouton", l: "Bouton de l'encart" },
        ],
      },
      {
        t: "groupe", k: "directeur", l: "Section « Mot du Directeur »",
        aide: "Le nom, la photo et le message se modifient dans l'onglet « Directeur Général ».",
        champs: [{ t: "oui", k: "visible", l: "Afficher cette section" }, { t: "texte", k: "surtitre", l: "Petit titre" }, { t: "texte", k: "titre", l: "Titre" }, { t: "lien", k: "bouton", l: "Bouton" }],
      },
      {
        t: "groupe", k: "pourquoi", l: "Section « Pourquoi nous choisir »",
        champs: [
          { t: "oui", k: "visible", l: "Afficher cette section" },
          { t: "texte", k: "surtitre", l: "Petit titre" },
          { t: "texte", k: "titre", l: "Titre" },
          { t: "zone", k: "sousTitre", l: "Sous-titre" },
          { t: "liste", k: "items", l: "Engagements", titreItem: "titre", champs: [{ t: "texte", k: "titre", l: "Titre" }, { t: "zone", k: "desc", l: "Texte" }, { t: "couleur", k: "couleur", l: "Couleur du numéro" }], nouveau: { titre: "Nouvel engagement", desc: "", couleur: "#0A1FE8" } },
        ],
      },
      {
        t: "groupe", k: "appel", l: "Appel final à l'inscription",
        champs: [
          { t: "oui", k: "visible", l: "Afficher cette section" },
          { t: "texte", k: "titre", l: "Titre" },
          { t: "zone", k: "texte", l: "Texte" },
          { t: "liste", k: "boutons", l: "Boutons", titreItem: "label", champs: BOUTON, nouveau: { label: "Nouveau bouton", href: "/", style: "primaire" } },
          { t: "texte", k: "note", l: "Note sous les boutons" },
        ],
      },
      {
        t: "liste", k: "sectionsPerso", l: "Sections personnalisées", titreItem: "titre", ajout: "Créer une nouvelle section",
        aide: "Créez vos propres sections avec des blocs (texte, images, vidéos, cartes, boutons…). Placez-les ensuite dans « Ordre des sections ».",
        champs: [
          { t: "texte", k: "cle", l: "Identifiant (unique, sans espace)", aide: "Ex. « temoignages ». Sert à placer la section dans l'ordre." },
          { t: "oui", k: "visible", l: "Afficher cette section" },
          { t: "choix", k: "fond", l: "Fond", options: [{ v: "blanc", l: "Blanc" }, { v: "doux", l: "Gris-bleu doux" }, { v: "sombre", l: "Bleu nuit" }] },
          { t: "texte", k: "surtitre", l: "Petit titre" },
          { t: "texte", k: "titre", l: "Titre" },
          { t: "zone", k: "sousTitre", l: "Sous-titre" },
          { t: "blocs", k: "blocs", l: "Contenu de la section" },
        ],
        nouveau: { cle: "", visible: true, fond: "blanc", surtitre: "", titre: "Nouvelle section", sousTitre: "", blocs: [] },
      },
    ],
  },
  {
    cle: "filieres", l: "Filières", icone: "graduation-cap",
    aide: "Les filières : carte de l'accueil, page détaillée, menu et liste du formulaire d'inscription.",
    champs: [
      {
        t: "liste", k: "", l: "Filières", titreItem: "titre", ajout: "Ajouter une filière",
        champs: [
          { t: "texte", k: "titre", l: "Nom de la filière" },
          { t: "texte", k: "slug", l: "Adresse de la page", aide: "Ex. « mecatronique » → /filieres/mecatronique" },
          { t: "oui", k: "visible", l: "Visible sur le site" },
          { t: "image", k: "image", l: "Photo de la filière" },
          { t: "icone", k: "icone", l: "Icône" },
          { t: "couleur", k: "couleur", l: "Couleur de la pastille" },
          { t: "couleur", k: "couleurTexte", l: "Couleur du titre et du bouton" },
          { t: "zone", k: "resume", l: "Résumé (carte de l'accueil)" },
          { t: "zone", k: "intro", l: "Introduction (page de la filière)" },
          { t: "texte", k: "duree", l: "Durée" },
          { t: "texte", k: "diplome", l: "Diplôme" },
          { t: "texte", k: "admission", l: "Admission" },
          { t: "textes", k: "competences", l: "Ce que vous apprendrez" },
          { t: "textes", k: "debouches", l: "Débouchés" },
          { t: "blocs", k: "blocs", l: "Contenu supplémentaire de la page" },
        ],
        nouveau: { slug: "", titre: "Nouvelle filière", resume: "", intro: "", image: "", icone: "book-open", couleur: "#0A1FE8", couleurTexte: "#0A1FE8", visible: true, duree: "", diplome: "", admission: "", competences: [], debouches: [], blocs: [] },
      },
    ],
  },
  {
    cle: "pages", l: "Pages & sous-pages", icone: "file-text",
    aide: "Toutes les pages du menu et leurs sous-pages. Vous pouvez en créer, les masquer, les réordonner et composer leur contenu avec des blocs.",
    champs: [
      { t: "note", texte: "Les pages des filières (/filieres/…) se modifient dans l'onglet « Filières ». Pensez à ajouter les nouvelles pages au menu (onglet « En-tête & menus »)." },
      {
        t: "liste", k: "", l: "Sections du site", titreItem: "titre", ajout: "Créer une nouvelle section (page principale)",
        champs: [
          ...PAGE,
          { t: "liste", k: "sousPages", l: "Sous-pages", titreItem: "titre", ajout: "Ajouter une sous-page", champs: PAGE, nouveau: { slug: "", titre: "Nouvelle page", intro: "", image: "", visible: true, blocs: [] } },
        ],
        nouveau: { slug: "", titre: "Nouvelle section", intro: "", image: "", visible: true, blocs: [], sousPages: [] },
      },
    ],
  },
  {
    cle: "directeur", l: "Directeur Général", icone: "user-round",
    aide: "Nom, fonction, photo et message du Directeur Général (accueil et page « Mot du DG »).",
    champs: [
      { t: "texte", k: "nom", l: "Nom" },
      { t: "texte", k: "fonction", l: "Fonction" },
      { t: "image", k: "photo", l: "Photo (facultatif)" },
      { t: "texte", k: "initiales", l: "Initiales (affichées sans photo)" },
      { t: "zone", k: "extrait", l: "Extrait (page d'accueil)" },
      { t: "textes", k: "message", l: "Message complet (paragraphes)", long: true, ajout: "Ajouter un paragraphe" },
    ],
  },
  {
    cle: "contact", l: "Coordonnées", icone: "phone",
    aide: "Adresse, téléphones, e-mail, WhatsApp, carte et horaires, utilisés partout sur le site et sur les documents.",
    champs: [
      { t: "texte", k: "localisation", l: "Localité" },
      { t: "texte", k: "adresse", l: "Adresse" },
      { t: "textes", k: "telephones", l: "Téléphones", ajout: "Ajouter un numéro" },
      { t: "texte", k: "email", l: "E-mail" },
      { t: "texte", k: "whatsapp", l: "Lien WhatsApp", ph: "https://wa.me/228…" },
      { t: "texte", k: "horaires", l: "Horaires d'ouverture" },
      { t: "texte", k: "carte", l: "Lien de la carte intégrée (Google Maps)", aide: "Google Maps → Partager → Intégrer une carte → copier l'adresse « src »." },
      { t: "texte", k: "itineraire", l: "Lien d'itinéraire (Google Maps)" },
    ],
  },
  {
    cle: "reseaux", l: "Réseaux sociaux", icone: "globe",
    aide: "Les boutons des réseaux sociaux (en-tête, pied de page, contact).",
    champs: [
      {
        t: "liste", k: "", l: "Réseaux", titreItem: "reseau", ajout: "Ajouter un réseau",
        champs: [
          { t: "choix", k: "reseau", l: "Réseau", options: [{ v: "facebook", l: "Facebook" }, { v: "instagram", l: "Instagram" }, { v: "tiktok", l: "TikTok" }, { v: "youtube", l: "YouTube" }, { v: "linkedin", l: "LinkedIn" }, { v: "x", l: "X (Twitter)" }, { v: "whatsapp", l: "WhatsApp" }] },
          { t: "texte", k: "url", l: "Lien de la page" },
          { t: "oui", k: "visible", l: "Visible" },
        ],
        nouveau: { reseau: "linkedin", url: "https://", visible: true },
      },
    ],
  },
  {
    cle: "formulaires", l: "Formulaires", icone: "pen-line",
    aide: "Tous les textes des formulaires de contact et de pré-inscription : titres, consignes, choix proposés, messages de confirmation.",
    champs: [
      {
        t: "groupe", k: "contact", l: "Formulaire de contact",
        champs: [
          { t: "texte", k: "titre", l: "Titre de la page" },
          { t: "zone", k: "intro", l: "Introduction" },
          { t: "texte", k: "messageTitre", l: "Titre du message d'accueil" },
          { t: "zone", k: "message", l: "Message d'accueil" },
          { t: "texte", k: "titreFormulaire", l: "Titre du formulaire" },
          { t: "textes", k: "sujets", l: "Sujets proposés", ajout: "Ajouter un sujet" },
          { t: "texte", k: "bouton", l: "Texte du bouton d'envoi" },
          { t: "texte", k: "succesTitre", l: "Titre après envoi" },
          { t: "zone", k: "succesTexte", l: "Message après envoi" },
          { t: "texte", k: "titreCoordonnees", l: "Titre des coordonnées" },
          { t: "texte", k: "titreCarte", l: "Titre de la carte" },
        ],
      },
      {
        t: "groupe", k: "inscription", l: "Formulaire de pré-inscription",
        aide: "La liste des filières proposées vient de l'onglet « Filières ».",
        champs: [
          { t: "texte", k: "titre", l: "Titre de la page" },
          { t: "zone", k: "intro", l: "Introduction" },
          { t: "texte", k: "connexionTitre", l: "Titre (visiteur non connecté)" },
          { t: "zone", k: "connexionTexte", l: "Texte (visiteur non connecté)" },
          { t: "texte", k: "consignesTitre", l: "Titre des consignes" },
          { t: "textes", k: "consignes", l: "Consignes" },
          { t: "texte", k: "titreIdentite", l: "Titre de la partie 1 (identité)" },
          { t: "texte", k: "titreDocuments", l: "Titre de la partie 2 (photo et documents)" },
          { t: "texte", k: "titreFormation", l: "Titre de la partie 3 (formation)" },
          { t: "textes", k: "niveaux", l: "Niveaux d'étude proposés" },
          { t: "zone", k: "consentement", l: "Texte de la case d'accord" },
          { t: "texte", k: "bouton", l: "Texte du bouton d'envoi" },
          { t: "texte", k: "succesTitre", l: "Titre après envoi" },
          { t: "zone", k: "succesTexte", l: "Message après envoi" },
          { t: "textes", k: "etapesApres", l: "Prochaines étapes (après envoi)" },
          { t: "texte", k: "asideTitre", l: "Titre de la colonne d'aide" },
          { t: "liste", k: "etapes", l: "Étapes (colonne d'aide)", titreItem: "titre", champs: [{ t: "texte", k: "titre", l: "Titre" }, { t: "texte", k: "desc", l: "Description" }], nouveau: { titre: "Nouvelle étape", desc: "" } },
        ],
      },
    ],
  },
  {
    cle: "documents", l: "Documents PDF", icone: "file-text",
    aide: "Modèle des documents imprimables (fiche d'inscription, attestation) : en-tête, cadre, couleur, signatures et textes.",
    champs: [
      { t: "texte", k: "nomEtablissement", l: "Nom de l'établissement (en-tête)" },
      { t: "texte", k: "lieu", l: "Lieu de signature (« Fait à … »)" },
      { t: "couleur", k: "couleur", l: "Couleur des titres et du cadre" },
      { t: "oui", k: "cadre", l: "Encadrer les documents (bordure)" },
      { t: "texte", k: "piedDePage", l: "Pied de page des documents" },
      { t: "texte", k: "titreFiche", l: "Titre de la fiche d'inscription" },
      { t: "textes", k: "pieces", l: "Pièces du dossier (cases à cocher)" },
      { t: "textes", k: "signaturesFiche", l: "Signataires de la fiche" },
      { t: "texte", k: "titreAttestation", l: "Titre de l'attestation" },
      { t: "zone", k: "introAttestation", l: "Début de l'attestation (avant le nom)" },
      { t: "zone", k: "finAttestation", l: "Formule de fin" },
      { t: "textes", k: "signaturesAttestation", l: "Signataires de l'attestation" },
    ],
  },
  {
    cle: "carte", l: "Carte d'étudiant", icone: "badge-check",
    aide: "Modèle de la carte d'étudiant imprimable (format carte bancaire), avec photo, matricule et filière.",
    champs: [
      { t: "texte", k: "titre", l: "Titre de la carte" },
      { t: "texte", k: "sousTitre", l: "Sous-titre" },
      { t: "couleur", k: "couleurBande", l: "Couleur de la bande" },
      { t: "couleur", k: "couleurFond", l: "Couleur du fond" },
      { t: "couleur", k: "couleurTexte", l: "Couleur du texte" },
      { t: "texte", k: "anneeParDefaut", l: "Année académique par défaut" },
      { t: "texte", k: "signataire", l: "Signataire" },
      { t: "oui", k: "afficherVerso", l: "Imprimer le verso" },
      { t: "zone", k: "mentionVerso", l: "Texte du verso" },
    ],
  },
];

/* ---------- Thèmes prêts à l'emploi ---------- */
export const THEMES: { nom: string; couleurs: Record<string, string> }[] = [
  {
    nom: "CeFoPExD (couleurs du logo)",
    couleurs: { primary: "#0A1FE8", "primary-dark": "#08137A", ink: "#050B47", "blue-deep": "#0B1C94", "btn-blue": "#0B22D6", "btn-red": "#D01B00", accent: "#F82303", "accent-text": "#D01B00", green: "#138800", "green-text": "#0F7A00", highlight: "#FDA603", text: "#0E1433", muted: "#3A4258", bg: "#FFFFFF", "bg-soft": "#F4F6FC", border: "#E3E7F1" },
  },
  {
    nom: "Océan (bleu turquoise)",
    couleurs: { primary: "#0A6ED1", "primary-dark": "#063B6E", ink: "#04243F", "blue-deep": "#08518F", "btn-blue": "#0A6ED1", "btn-red": "#E0533D", accent: "#FF6B4A", "accent-text": "#C2410C", green: "#0E8A6A", "green-text": "#0B6E55", highlight: "#FFC233", text: "#0B1F33", muted: "#3D5266", bg: "#FFFFFF", "bg-soft": "#F0F7FC", border: "#DCE8F2" },
  },
  {
    nom: "Nature (vert profond)",
    couleurs: { primary: "#1B7F3A", "primary-dark": "#0F4D23", ink: "#0A2E16", "blue-deep": "#15652E", "btn-blue": "#1B7F3A", "btn-red": "#C0392B", accent: "#E67E22", "accent-text": "#B45309", green: "#1B7F3A", "green-text": "#166534", highlight: "#F4B400", text: "#14231A", muted: "#41524A", bg: "#FFFFFF", "bg-soft": "#F2F8F3", border: "#DDEBE0" },
  },
  {
    nom: "Prestige (bordeaux et or)",
    couleurs: { primary: "#8B1E3F", "primary-dark": "#4A0F22", ink: "#2B0914", "blue-deep": "#6E1832", "btn-blue": "#8B1E3F", "btn-red": "#B91C1C", accent: "#C9A227", "accent-text": "#8A6D12", green: "#2F7D4F", "green-text": "#276B43", highlight: "#D4AF37", text: "#1F1216", muted: "#4F3D43", bg: "#FFFFFF", "bg-soft": "#FAF5F6", border: "#EDE2E5" },
  },
  {
    nom: "Moderne (violet et corail)",
    couleurs: { primary: "#5B3FD6", "primary-dark": "#2E1F78", ink: "#1A1147", "blue-deep": "#4630B0", "btn-blue": "#5B3FD6", "btn-red": "#E5484D", accent: "#FF6F61", "accent-text": "#C83A2E", green: "#12A150", "green-text": "#0F7F40", highlight: "#FFB224", text: "#16132B", muted: "#4A4763", bg: "#FFFFFF", "bg-soft": "#F5F3FF", border: "#E6E2F7" },
  },
];

export const LIBELLES_COULEURS: Record<string, string> = {
  "logo-green": "Vert du logo",
  "logo-red": "Rouge du logo",
  "logo-blue": "Bleu du logo",
  "logo-orange": "Orange du logo",
  primary: "Couleur principale (boutons, liens)",
  "primary-dark": "Bleu nuit (pied de page, fonds)",
  ink: "Encre (fonds très sombres)",
  "blue-deep": "Titres",
  "btn-blue": "Boutons principaux",
  "btn-red": "Boutons d'inscription",
  accent: "Couleur d'accent",
  "accent-text": "Accent lisible (textes)",
  green: "Vert des boutons et pastilles",
  "green-text": "Vert lisible (textes)",
  highlight: "Mise en avant (bouton jaune)",
  text: "Texte principal",
  muted: "Texte secondaire",
  bg: "Fond des pages",
  "bg-soft": "Fond des sections",
  border: "Bordures",
};

export const SECTIONS_ACCUEIL: Record<string, string> = {
  hero: "Bandeau principal (diaporama)",
  stats: "Chiffres clés",
  atouts: "Bandeau des atouts",
  filieres: "Nos filières",
  apropos: "À propos + Actualités",
  directeur: "Mot du Directeur",
  pourquoi: "Pourquoi nous choisir",
  appel: "Appel final à l'inscription",
};
