/* =============================================
   CONTENU DES PAGES DU SITE
   Une section = une entrée du menu (À propos, Nos filières…).
   Chaque sous-page du menu correspond à une entrée de `pages`.
   Les textes reprennent le contenu réel du centre ; les pages dont
   le contenu n'est pas encore fourni utilisent un bloc "pending".
   ============================================= */

export const CONTACT = {
  adresse: "Rue Okeloukoutou, Lomé, Togo",
  telephones: ["+228 70 88 13 06", "+228 79 95 20 20"],
  email: "info@cefopexd.com",
  whatsapp: "https://wa.me/22870881306",
  localisation: "Dévikinmé, Togo",
  carte: "https://www.google.com/maps?q=D%C3%A9vikinm%C3%A9%2C%20Togo&output=embed",
  itineraire: "https://www.google.com/maps/search/?api=1&query=D%C3%A9vikinm%C3%A9%2C%20Togo",
};

/* Chiffres clés affichés sur l'accueil (et connus de l'assistant) */
export const CHIFFRES = [
  { value: 500, suffix: "+", label: "Étudiants formés" },
  { value: 6, suffix: "", label: "Filières d'excellence" },
  { value: 85, suffix: "%", label: "Taux d'insertion" },
  { value: 12, suffix: "+", label: "Partenaires" },
];

/* Date affichée sur les pages légales */
export const MISE_A_JOUR_LEGALE = "18 octobre 2026";

/* Liens des réseaux sociaux (à confirmer par le centre) */
export const SOCIAL = {
  facebook: "https://facebook.com/cefopexd",
  instagram: "https://instagram.com/cefopexd",
  tiktok: "https://tiktok.com/@cefopexd",
  youtube: "https://youtube.com/@cefopexd",
};

export const DIRECTEUR = {
  nom: "Monsieur D'ALMEIDA Blaise",
  fonction: "Directeur Général du CeFoPExD",
  extrait:
    "Bienvenue au CeFoPExD. Notre ambition est claire : offrir à chaque jeune une formation exigeante, concrète et tournée vers l'emploi, afin qu'il devienne non seulement un professionnel compétent, mais aussi un créateur d'opportunités pour lui-même et pour sa communauté.",
  message: [
    "Chers jeunes, chers parents, chers partenaires,",
    "C'est avec une grande fierté que je vous souhaite la bienvenue au Centre de Formation Professionnelle d'Excellence de Dévikinmé. Notre centre est né d'une conviction forte : la jeunesse togolaise regorge de talents, et elle mérite une formation à la hauteur de ses ambitions.",
    "Au CeFoPExD, nous ne nous contentons pas de transmettre des connaissances. Nous formons des femmes et des hommes capables d'agir, d'innover et d'entreprendre. Nos filières — informatique appliquée, mécatronique, agro-alimentaire, énergie renouvelable, langue allemande et formations courtes — ont été pensées pour répondre aux besoins réels du marché de l'emploi et aux défis de demain.",
    "Notre pédagogie accorde une place essentielle à la pratique, à l'encadrement personnalisé et au lien avec les entreprises. L'excellence, l'intégrité et la solidarité sont les valeurs qui guident chacune de nos actions.",
    "À vous, futurs apprenants : choisir le CeFoPExD, c'est choisir de bâtir votre avenir avec méthode et confiance. À vous, parents et partenaires : je vous invite à cheminer à nos côtés pour faire de cette jeunesse une force de développement pour notre pays.",
    "Ensemble, pour une jeunesse compétente et un avenir meilleur.",
  ],
};

type Link = { label: string; href: string };

export type Block =
  | { type: "text"; title?: string; paragraphs: string[] }
  | { type: "list"; title: string; items: string[] }
  | { type: "facts"; items: { label: string; value: string }[] }
  | { type: "steps"; title: string; items: { title: string; desc: string }[] }
  | { type: "cards"; title?: string; items: { title: string; desc: string; href?: string; image?: string; color?: string }[] }
  | { type: "faq"; title: string; items: { q: string; a: string }[] }
  | { type: "gallery"; title?: string; images: { src: string; alt: string }[] }
  | { type: "pending"; text: string }
  | { type: "director" }
  | { type: "cta"; title: string; text: string; primary: Link; secondary?: Link };

export type Page = {
  title: string;
  intro: string;
  image?: string;
  blocks: Block[];
};

export type Section = Page & {
  pages?: Record<string, Page>;
};

/* ---------- Blocs réutilisés ---------- */
const CTA_INSCRIPTION: Block = {
  type: "cta",
  title: "Prêt à rejoindre le CeFoPExD ?",
  text: "Déposez votre pré-inscription en ligne : notre équipe d'admission vous recontacte pour finaliser votre dossier.",
  primary: { label: "Pré-inscription en ligne", href: "/inscription/formulaire" },
  secondary: { label: "Nous contacter", href: "/contact" },
};

const pending = (sujet: string): Block => ({
  type: "pending",
  text: `Les informations sur ${sujet} sont en cours de préparation et seront publiées très prochainement. En attendant, notre équipe répond à toutes vos questions par téléphone ou par e-mail.`,
});

const PHOTOS = {
  campus: { src: "/images/campus-cefopexd.jpg", alt: "Vue aérienne du campus du CeFoPExD" },
  batiment: { src: "/images/batiment-cefopexd.jpg", alt: "Bâtiment de formation du CeFoPExD" },
  eleves: { src: "/images/eleves-cefopexd.jpg", alt: "Apprenants du CeFoPExD en séance" },
};

const COLORS = {
  blue: "var(--primary)",
  red: "var(--accent-text)",
  green: "var(--green-text)",
  orange: "#B86E00",
};

/* ---------- Filières ---------- */
const FILIERES: Record<string, Page & { color: string; duree?: string; skills?: string[]; jobs?: string[] }> = {
  informatique: {
    title: "Informatique appliquée",
    color: COLORS.blue,
    image: "/images/filiere-informatique.jpg",
    intro: "Une formation complète pour maîtriser les outils numériques et devenir un technicien recherché par les entreprises.",
    duree: "2 ans",
    skills: ["Programmation (Python, JavaScript, PHP)", "Administration réseaux et systèmes", "Conception de bases de données", "Maintenance informatique et sécurité", "Création de sites web et d'applications"],
    jobs: ["Développeur web", "Technicien réseau", "Administrateur système", "Support informatique", "Infographiste"],
    blocks: [],
  },
  mecatronique: {
    title: "Mécatronique",
    color: COLORS.red,
    image: "https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=1200&q=80",
    intro: "Au croisement de la mécanique, de l'électronique et de l'informatique, la mécatronique forme des techniciens polyvalents de l'industrie.",
    duree: "2 ans",
    skills: ["Mécanique et lecture de plans", "Électronique et électrotechnique", "Automatismes et automates programmables", "Robotique de base", "Maintenance industrielle"],
    jobs: ["Technicien de maintenance", "Automaticien", "Électromécanicien", "Technicien de production"],
    blocks: [],
  },
  "agro-alimentaire": {
    title: "Agro-alimentaire",
    color: COLORS.green,
    image: "/images/filiere-agro.jpg",
    intro: "Apprenez à transformer, conserver et valoriser les produits agricoles locaux selon les normes d'hygiène et de qualité.",
    duree: "18 mois",
    skills: ["Techniques de transformation des produits", "Hygiène, qualité et sécurité alimentaire (HACCP)", "Conditionnement et conservation", "Gestion d'une unité de production", "Entrepreneuriat agricole"],
    jobs: ["Technicien agro-alimentaire", "Agent qualité", "Opérateur de production", "Entrepreneur agro-industriel"],
    blocks: [],
  },
  "energie-renouvelable": {
    title: "Énergie renouvelable",
    color: COLORS.orange,
    image: "/images/filiere-energie.jpg",
    intro: "Formez-vous à l'installation et à la maintenance des systèmes solaires et éoliens pour accompagner la transition énergétique.",
    duree: "18 mois",
    skills: ["Dimensionnement d'installations photovoltaïques", "Installation et câblage solaire", "Électricité du bâtiment", "Maintenance des systèmes énergétiques", "Efficacité énergétique"],
    jobs: ["Installateur solaire", "Technicien en énergies renouvelables", "Électricien", "Auditeur énergétique"],
    blocks: [],
  },
  "langue-allemande": {
    title: "Langue allemande",
    color: COLORS.blue,
    image: "/images/eleves-cefopexd.jpg",
    intro: "Apprenez l'allemand du niveau A1 au niveau B2, avec une préparation aux examens certifiants.",
    blocks: [
      { type: "list", title: "Niveaux proposés", items: ["A1 — Découverte", "A2 — Intermédiaire élémentaire", "B1 — Niveau seuil", "B2 — Avancé"] },
      pending("le calendrier des sessions et les centres d'examen"),
    ],
  },
  "formations-courtes": {
    title: "Formations courtes",
    color: COLORS.green,
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=80",
    intro: "Des modules courts en artisanat et en informatique pour acquérir rapidement de nouvelles compétences.",
    blocks: [
      { type: "list", title: "Domaines", items: ["Artisanat", "Informatique"] },
      pending("la liste détaillée des modules courts et leurs dates"),
    ],
  },
};

// Pages détaillées des filières : compétences, débouchés, durée
for (const f of Object.values(FILIERES)) {
  const detail: Block[] = [];
  if (f.duree) detail.push({ type: "facts", items: [{ label: "Durée", value: f.duree }, { label: "Diplôme", value: "Certificat de qualification professionnelle" }, { label: "Admission", value: "À partir du BEPC" }] });
  if (f.skills) detail.push({ type: "list", title: "Ce que vous apprendrez", items: f.skills });
  if (f.jobs) detail.push({ type: "list", title: "Débouchés", items: f.jobs });
  f.blocks = [...detail, ...f.blocks, CTA_INSCRIPTION];
}

/* ---------- Sections du site ---------- */
export const SECTIONS: Record<string, Section> = {
  "a-propos": {
    title: "À propos du CeFoPExD",
    intro: "Le Centre de Formation Professionnelle d'Excellence de Dévikinmé forme des jeunes talents capables de répondre aux besoins du monde professionnel.",
    image: PHOTOS.campus.src,
    blocks: [],
    pages: {
      presentation: {
        title: "Présentation du centre",
        intro: "Un établissement engagé dans la formation de jeunes talents, au service du développement durable de notre pays.",
        image: PHOTOS.campus.src,
        blocks: [
          {
            type: "text",
            paragraphs: [
              "Le Centre de Formation Professionnelle d'Excellence de Dévikinmé (CeFoPExD) est un établissement engagé dans la formation de jeunes talents, capables de répondre aux besoins du monde professionnel et de contribuer au développement durable de notre pays.",
              "Nous formons des cadres capables de créer de l'emploi dans leur domaine de formation, et pas seulement d'en demander. L'excellence et l'intégrité sont au cœur de notre pédagogie.",
            ],
          },
          {
            type: "cards",
            title: "Nos atouts",
            items: [
              { title: "Formations qualifiantes", desc: "Des compétences pour réussir.", color: COLORS.green },
              { title: "Encadrement professionnel", desc: "Une équipe pédagogique expérimentée.", color: COLORS.red },
              { title: "Infrastructures modernes", desc: "Des équipements à la pointe.", color: COLORS.blue },
              { title: "Insertion professionnelle", desc: "Un tremplin vers l'emploi.", color: COLORS.orange },
            ],
          },
          { type: "gallery", title: "Le campus en images", images: [PHOTOS.campus, PHOTOS.batiment, PHOTOS.eleves] },
          CTA_INSCRIPTION,
        ],
      },
      "mot-du-dg": {
        title: "Mot du Directeur Général",
        intro: "Le message de la direction aux apprenants, aux parents et aux partenaires du CeFoPExD.",
        blocks: [{ type: "director" }, CTA_INSCRIPTION],
      },
      "vision-mission": {
        title: "Vision, mission et valeurs",
        intro: "Ce qui guide chaque jour notre action pédagogique.",
        blocks: [
          {
            type: "cards",
            items: [
              { title: "Notre vision", desc: "Développer les compétences de la jeunesse pour un avenir meilleur.", color: COLORS.blue },
              { title: "Notre mission", desc: "Former pour l'emploi : des cadres capables de créer de l'emploi dans leur domaine.", color: COLORS.green },
              { title: "Nos valeurs", desc: "Excellence, intégrité, solidarité.", color: COLORS.red },
            ],
          },
          {
            type: "list",
            title: "Nos engagements",
            items: [
              "Un enseignement de qualité qui fait de l'excellence sa priorité.",
              "L'égalité des chances : la diversité est une richesse.",
              "Une place essentielle accordée à la recherche, notamment en entrepreneuriat.",
              "Des formations sans cesse adaptées aux besoins du marché de l'emploi.",
              "Paix, tolérance, intégrité et équité : former des acteurs responsables de la société.",
            ],
          },
        ],
      },
      objectifs: {
        title: "Nos buts et objectifs",
        intro: "Former une jeunesse compétente, autonome et prête pour le monde du travail.",
        blocks: [
          {
            type: "list",
            title: "Nos objectifs",
            items: [
              "Offrir des formations qualifiantes adaptées aux besoins du marché de l'emploi.",
              "Former des professionnels capables de créer leur propre activité.",
              "Accompagner les apprenants vers les stages, l'emploi et l'auto-entrepreneuriat.",
              "Développer des partenariats solides avec les entreprises et les institutions.",
              "Contribuer au développement durable du Togo.",
            ],
          },
          CTA_INSCRIPTION,
        ],
      },
      equipe: {
        title: "Équipe administrative",
        intro: "Les femmes et les hommes qui font vivre le CeFoPExD au quotidien.",
        blocks: [pending("l'équipe administrative")],
      },
      infrastructures: {
        title: "Infrastructures",
        intro: "Un campus moderne, conçu pour apprendre par la pratique.",
        image: PHOTOS.batiment.src,
        blocks: [
          {
            type: "text",
            paragraphs: [
              "Nos bâtiments de formation accueillent salles de cours, ateliers et laboratoires, pour une pédagogie où la pratique occupe une place centrale.",
            ],
          },
          { type: "gallery", images: [PHOTOS.campus, PHOTOS.batiment, PHOTOS.eleves] },
        ],
      },
      partenaires: {
        title: "Partenaires",
        intro: "Des partenariats solides avec les entreprises et les institutions pour l'insertion de nos apprenants.",
        blocks: [pending("nos partenaires"), {
          type: "cta",
          title: "Devenir partenaire",
          text: "Entreprise ou institution, vous souhaitez accueillir des stagiaires ou recruter nos diplômés ?",
          primary: { label: "Nous contacter", href: "/contact" },
        }],
      },
    },
  },

  filieres: {
    title: "Nos filières de formation",
    intro: "Choisissez la filière qui correspond à vos ambitions et construisez votre avenir avec nous.",
    blocks: [CTA_INSCRIPTION],
    pages: FILIERES,
  },

  formations: {
    title: "Formations",
    intro: "Calendrier, sessions, séminaires et formations sur mesure pour particuliers et entreprises.",
    blocks: [],
    pages: {
      calendrier: {
        title: "Calendrier académique",
        intro: "Les grandes dates de l'année de formation : rentrée, périodes de stage et examens.",
        blocks: [pending("le calendrier académique"), CTA_INSCRIPTION],
      },
      sessions: {
        title: "Sessions à venir",
        intro: "Les prochaines sessions de formation ouvertes aux inscriptions.",
        blocks: [pending("les prochaines sessions"), CTA_INSCRIPTION],
      },
      seminaires: {
        title: "Séminaires et ateliers",
        intro: "Des rencontres pratiques pour approfondir un sujet ou découvrir un métier.",
        blocks: [pending("les séminaires et ateliers")],
      },
      "sur-mesure": {
        title: "Formations sur mesure",
        intro: "Des programmes construits avec les entreprises et institutions, selon leurs besoins.",
        blocks: [
          {
            type: "text",
            paragraphs: [
              "Le CeFoPExD conçoit des formations adaptées aux besoins spécifiques des entreprises et des institutions, dans ses domaines d'expertise : informatique, mécatronique, agro-alimentaire, énergie renouvelable et langue allemande.",
            ],
          },
          {
            type: "cta",
            title: "Un projet de formation ?",
            text: "Décrivez-nous votre besoin : nous vous proposerons un programme adapté.",
            primary: { label: "Nous contacter", href: "/contact" },
          },
        ],
      },
    },
  },

  inscription: {
    title: "Inscription",
    intro: "Les inscriptions se font en présentiel au centre. Commencez par la pré-inscription en ligne.",
    blocks: [],
    pages: {
      procedure: {
        title: "Comment s'inscrire",
        intro: "Quatre étapes simples pour rejoindre le CeFoPExD.",
        blocks: [
          {
            type: "steps",
            title: "Les étapes",
            items: [
              { title: "Connexion avec Google", desc: "Créez votre compte CeFoPExD en un clic avec votre compte Google, puis reconnectez-vous avec vos identifiants Google." },
              { title: "Pré-inscription en ligne", desc: "Remplissez le formulaire de pré-inscription depuis votre compte." },
              { title: "Dépôt du dossier", desc: "Copie du diplôme, acte de naissance, 2 photos d'identité." },
              { title: "Entretien d'orientation", desc: "Un conseiller vous aide à confirmer votre choix." },
              { title: "Rentrée", desc: "Bienvenue dans la famille CeFoPExD !" },
            ],
          },
          CTA_INSCRIPTION,
        ],
      },
      pieces: {
        title: "Pièces à fournir",
        intro: "Les documents à déposer au centre pour finaliser votre inscription.",
        blocks: [
          { type: "list", title: "Dossier d'inscription", items: ["Copie du dernier diplôme obtenu", "Copie de l'acte de naissance", "2 photos d'identité"] },
          CTA_INSCRIPTION,
        ],
      },
      frais: {
        title: "Frais de formation",
        intro: "Les frais varient selon la filière et la durée de la formation.",
        blocks: [pending("les frais de formation par filière"), CTA_INSCRIPTION],
      },
    },
  },

  informations: {
    title: "S'informer",
    intro: "Toutes les informations utiles pour découvrir le centre, choisir votre formation et suivre la vie du CeFoPExD.",
    blocks: [
      {
        type: "cards",
        title: "Vous êtes…",
        items: [
          { title: "Futur apprenant", desc: "Découvrez nos filières, les conditions d'admission et déposez votre pré-inscription en ligne.", href: "/inscription/procedure", color: COLORS.green },
          { title: "Parent", desc: "Comprenez notre pédagogie, nos valeurs et l'accompagnement proposé à votre enfant.", href: "/a-propos/presentation", color: COLORS.blue },
          { title: "Entreprise ou institution", desc: "Accueillez nos stagiaires, recrutez nos diplômés ou demandez une formation sur mesure.", href: "/formations/sur-mesure", color: COLORS.red },
          { title: "Apprenant du centre", desc: "Retrouvez le calendrier académique, les sessions et votre espace en ligne.", href: "/formations/calendrier", color: COLORS.orange },
        ],
      },
      {
        type: "faq",
        title: "Les questions les plus posées",
        items: [
          { q: "Quelles sont les conditions d'admission ?", a: "Les filières sont accessibles à partir du BEPC selon le niveau de formation visé. Un entretien d'orientation permet de valider le parcours le plus adapté." },
          { q: "Comment s'inscrire ?", a: "Connectez-vous avec votre compte Google, remplissez la pré-inscription en ligne, puis déposez votre dossier au centre. Les inscriptions se finalisent en présentiel." },
          { q: "Le centre aide-t-il à trouver un emploi ?", a: "Grâce à nos partenariats avec les entreprises, nous accompagnons nos apprenants vers les stages, l'emploi et l'auto-entrepreneuriat." },
        ],
      },
      {
        type: "cta",
        title: "Vous ne trouvez pas votre réponse ?",
        text: "Notre équipe vous répond par téléphone, par e-mail ou sur WhatsApp.",
        primary: { label: "Nous contacter", href: "/contact" },
        secondary: { label: "Toutes les questions", href: "/informations/faq" },
      },
    ],
    pages: {
      actualites: {
        title: "Actualités & annonces",
        intro: "Restez informé de la vie du centre.",
        blocks: [
          {
            type: "cards",
            items: [
              { title: "Ouverture des inscriptions 2025-2026", desc: "Les inscriptions pour la nouvelle rentrée académique sont ouvertes. Ne manquez pas cette opportunité !", image: PHOTOS.eleves.src, href: "/inscription/formulaire" },
              { title: "Journée portes ouvertes au CeFoPExD", desc: "Découvrez nos infrastructures et rencontrez notre équipe pédagogique lors de notre journée portes ouvertes.", image: PHOTOS.batiment.src },
              { title: "Lancement de la filière Énergie renouvelable", desc: "Une nouvelle filière pour répondre aux enjeux de demain et aux besoins croissants en énergies vertes.", image: "/images/filiere-energie.jpg", href: "/filieres/energie-renouvelable" },
            ],
          },
        ],
      },
      evenements: {
        title: "Événements",
        intro: "Journées portes ouvertes, cérémonies et rencontres professionnelles.",
        blocks: [pending("les prochains événements")],
      },
      publications: {
        title: "Publications",
        intro: "Documents, brochures et travaux du centre.",
        blocks: [pending("nos publications")],
      },
      galerie: {
        title: "Galerie photos / vidéos",
        intro: "Le CeFoPExD en images.",
        blocks: [{ type: "gallery", images: [PHOTOS.campus, PHOTOS.batiment, PHOTOS.eleves] }],
      },
      faq: {
        title: "Questions fréquentes",
        intro: "Les réponses aux questions les plus posées.",
        blocks: [
          {
            type: "faq",
            title: "FAQ",
            items: [
              { q: "Quelles sont les conditions d'admission ?", a: "Les filières sont accessibles à partir du BEPC selon le niveau de formation visé. Un entretien d'orientation permet de valider le parcours le plus adapté." },
              { q: "Quelle est la durée des formations ?", a: "Les formations qualifiantes durent de 6 mois à 2 ans, avec des périodes de stage en entreprise." },
              { q: "Les formations sont-elles pratiques ?", a: "Oui. Plus de 60 % du temps est consacré aux travaux pratiques dans nos ateliers et laboratoires équipés." },
              { q: "Le centre aide-t-il à trouver un emploi ?", a: "Grâce à nos partenariats avec les entreprises, nous accompagnons nos apprenants vers les stages, l'emploi et l'auto-entrepreneuriat." },
              { q: "Comment s'inscrire ?", a: "Connectez-vous avec votre compte Google, remplissez la pré-inscription en ligne, puis déposez votre dossier au centre. Les inscriptions se finalisent en présentiel." },
              { q: "Faut-il créer un compte ?", a: "Oui : la pré-inscription se fait depuis un compte CeFoPExD, créé automatiquement lors de votre première connexion avec Google. Vous vous reconnectez ensuite avec vos identifiants Google et suivez votre demande dans « Mon espace »." },
            ],
          },
          CTA_INSCRIPTION,
        ],
      },
    },
  },

  "mentions-legales": {
    title: "Mentions légales",
    intro: "Informations légales relatives au site du CeFoPExD.",
    blocks: [
      {
        type: "text",
        title: "Éditeur du site",
        paragraphs: [
          "Centre de Formation Professionnelle d'Excellence de Dévikinmé (CeFoPExD).",
          `Adresse : ${CONTACT.adresse}. Téléphone : ${CONTACT.telephones.join(" / ")}. E-mail : ${CONTACT.email}.`,
        ],
      },
      {
        type: "text",
        title: "Hébergement",
        paragraphs: [
          "Le site est hébergé par Vercel Inc. Les données des formulaires sont stockées sur la plateforme Supabase.",
        ],
      },
      {
        type: "text",
        title: "Propriété intellectuelle",
        paragraphs: [
          "Les textes, photos et le logo du CeFoPExD sont la propriété du centre. Toute reproduction sans autorisation est interdite.",
        ],
      },
    ],
  },

  confidentialite: {
    title: "Politique de confidentialité",
    intro: `Comment le CeFoPExD collecte, utilise et protège vos données personnelles. Dernière mise à jour : ${MISE_A_JOUR_LEGALE}.`,
    blocks: [
      {
        type: "text",
        title: "1. Qui est responsable de vos données ?",
        paragraphs: [
          `Le responsable du traitement est le Centre de Formation Professionnelle d'Excellence de Dévikinmé (CeFoPExD), ${CONTACT.adresse}.`,
          `Pour toute question sur vos données : ${CONTACT.email} ou ${CONTACT.telephones[0]}.`,
          "Le CeFoPExD s'engage à traiter vos données dans le respect de la loi togolaise n° 2019-014 du 29 octobre 2019 relative à la protection des données à caractère personnel.",
        ],
      },
      {
        type: "list",
        title: "2. Quelles données collectons-nous ?",
        items: [
          "Connexion avec Google : votre nom, votre adresse e-mail et votre photo de profil, transmis par Google avec votre accord. Nous n'avons jamais accès à votre mot de passe Google.",
          "Pré-inscription : nom, prénom, téléphone, e-mail, filière souhaitée, niveau d'étude et message facultatif.",
          "Formulaire de contact : nom, e-mail, téléphone (facultatif), sujet et message.",
          "Assistant en ligne : les questions que vous posez dans la fenêtre de discussion.",
          "Données techniques : un cookie de session pour vous garder connecté(e) et les journaux techniques de l'hébergeur (adresse IP, date, page consultée), nécessaires à la sécurité du site.",
        ],
      },
      {
        type: "list",
        title: "3. Pourquoi utilisons-nous ces données ?",
        items: [
          "Créer et gérer votre compte, et vous permettre de vous reconnecter avec Google.",
          "Traiter votre pré-inscription, vous recontacter et suivre votre dossier jusqu'à l'inscription définitive au centre.",
          "Répondre à vos messages et à vos questions.",
          "Faire fonctionner l'assistant en ligne et vous apporter une réponse.",
          "Assurer la sécurité et le bon fonctionnement du site.",
        ],
      },
      {
        type: "text",
        title: "4. Sur quelle base ?",
        paragraphs: [
          "Votre consentement (case à cocher du formulaire, connexion avec Google), les mesures nécessaires à votre demande d'inscription et l'intérêt légitime du centre à sécuriser son site.",
          "Vous pouvez retirer votre consentement à tout moment en nous écrivant.",
        ],
      },
      {
        type: "list",
        title: "5. Qui a accès à vos données ?",
        items: [
          "L'équipe administrative et d'admission du CeFoPExD, uniquement pour traiter vos demandes.",
          "Supabase : hébergement de la base de données et gestion des comptes.",
          "Vercel Inc. : hébergement du site.",
          "Google : service de connexion « Continuer avec Google » et affichage de la carte de localisation.",
          "Anthropic : traitement des questions posées à l'assistant en ligne, afin de générer la réponse.",
          "Ces prestataires agissent pour le compte du CeFoPExD. Certains sont situés hors du Togo ; ils appliquent des garanties de sécurité adaptées. Vos données ne sont jamais vendues ni utilisées à des fins publicitaires.",
        ],
      },
      {
        type: "text",
        title: "6. Combien de temps les conservons-nous ?",
        paragraphs: [
          "Les pré-inscriptions et les messages sont conservés le temps nécessaire au traitement de votre demande et au suivi de votre parcours au centre, puis supprimés ou anonymisés.",
          "Votre compte est conservé tant que vous l'utilisez. Vous pouvez demander sa suppression à tout moment.",
          "Les questions posées à l'assistant ne sont pas enregistrées dans la base de données du CeFoPExD.",
        ],
      },
      {
        type: "list",
        title: "7. Vos droits",
        items: [
          "Accéder à vos données et en obtenir une copie.",
          "Les faire corriger si elles sont inexactes.",
          "Demander leur suppression, ainsi que celle de votre compte.",
          "Vous opposer à leur utilisation ou retirer votre consentement.",
          `Pour exercer ces droits, écrivez à ${CONTACT.email} en précisant l'adresse e-mail de votre compte. Nous vous répondons dans les meilleurs délais. Vous pouvez également saisir l'Instance de Protection des Données à Caractère Personnel (IPDCP) du Togo.`,
        ],
      },
      {
        type: "text",
        title: "8. Cookies",
        paragraphs: [
          "Le site utilise uniquement des cookies strictement nécessaires : le cookie de session qui vous garde connecté(e) à votre compte. Aucun cookie publicitaire ni de mesure d'audience n'est déposé par le CeFoPExD.",
          "La carte Google Maps intégrée aux pages Contact et au pied de page peut déposer ses propres cookies lorsque vous l'affichez.",
        ],
      },
      {
        type: "text",
        title: "9. Sécurité",
        paragraphs: [
          "Les échanges avec le site sont chiffrés (HTTPS). L'accès aux données est limité : chaque utilisateur ne peut consulter que ses propres pré-inscriptions, et seule l'équipe du centre accède à l'ensemble des demandes.",
        ],
      },
      {
        type: "text",
        title: "10. Mineurs",
        paragraphs: [
          "Si vous avez moins de 18 ans, demandez l'accord d'un parent ou de votre tuteur légal avant de créer un compte ou de déposer une pré-inscription.",
        ],
      },
      {
        type: "text",
        title: "11. Modifications",
        paragraphs: [
          "Cette politique peut être mise à jour pour suivre l'évolution du site ou de la réglementation. La date de dernière mise à jour figure en haut de cette page.",
        ],
      },
      {
        type: "cta",
        title: "Une question sur vos données ?",
        text: "Notre équipe vous répond pour toute demande d'accès, de correction ou de suppression.",
        primary: { label: "Nous contacter", href: "/contact" },
        secondary: { label: "Conditions d'utilisation", href: "/conditions-utilisation" },
      },
    ],
  },

  "conditions-utilisation": {
    title: "Conditions générales d'utilisation",
    intro: `Les règles d'utilisation du site du CeFoPExD et de votre compte. Dernière mise à jour : ${MISE_A_JOUR_LEGALE}.`,
    blocks: [
      {
        type: "text",
        title: "1. Objet",
        paragraphs: [
          "Les présentes conditions encadrent l'utilisation du site du Centre de Formation Professionnelle d'Excellence de Dévikinmé (CeFoPExD) : consultation des informations, création d'un compte, pré-inscription en ligne, formulaire de contact et assistant en ligne.",
          "En utilisant le site, et notamment en créant un compte, vous acceptez ces conditions.",
        ],
      },
      {
        type: "text",
        title: "2. Accès au site",
        paragraphs: [
          "Le site est accessible gratuitement. Le CeFoPExD s'efforce de le maintenir disponible, mais l'accès peut être interrompu pour maintenance ou en cas de difficulté technique, sans que sa responsabilité puisse être engagée.",
        ],
      },
      {
        type: "list",
        title: "3. Compte utilisateur",
        items: [
          "Le compte est créé lors de votre première connexion avec Google ; vous vous reconnectez ensuite avec vos identifiants Google.",
          "Vous êtes responsable de la sécurité de votre compte Google et des actions réalisées depuis votre compte CeFoPExD.",
          "Le compte est personnel : n'utilisez pas le compte d'une autre personne.",
          "Si vous avez moins de 18 ans, l'accord d'un parent ou d'un tuteur légal est nécessaire.",
          "Le CeFoPExD peut suspendre un compte utilisé de manière frauduleuse ou contraire aux présentes conditions.",
        ],
      },
      {
        type: "list",
        title: "4. Pré-inscription en ligne",
        items: [
          "La pré-inscription est gratuite et sans engagement.",
          "Elle ne vaut pas inscription définitive : l'inscription se finalise en présentiel au centre, après dépôt du dossier et entretien d'orientation.",
          "Vous vous engagez à fournir des informations exactes et à jour.",
          "Le numéro de référence affiché après l'envoi permet de retrouver votre demande ; conservez-le.",
        ],
      },
      {
        type: "text",
        title: "5. Assistant en ligne",
        paragraphs: [
          "L'assistant répond automatiquement à partir des informations publiées sur le site. Ses réponses sont fournies à titre indicatif et peuvent comporter des imprécisions ; elles ne remplacent pas les informations officielles communiquées par l'équipe du centre.",
          "Pour toute décision importante (inscription, frais, dates), vérifiez auprès du centre. Ne communiquez pas d'informations sensibles dans la discussion.",
        ],
      },
      {
        type: "list",
        title: "6. Règles d'utilisation",
        items: [
          "Utiliser le site de manière loyale et conforme à la loi.",
          "Ne pas envoyer de contenus injurieux, faux, trompeurs ou portant atteinte aux droits d'autrui.",
          "Ne pas tenter de perturber le fonctionnement du site, d'accéder aux données d'autres utilisateurs ou de contourner les mesures de sécurité.",
          "Ne pas utiliser les formulaires ou l'assistant pour envoyer des messages en masse ou automatisés.",
        ],
      },
      {
        type: "text",
        title: "7. Propriété intellectuelle",
        paragraphs: [
          "Le logo, les textes, les photos et la présentation du site sont la propriété du CeFoPExD. Toute reproduction ou réutilisation sans autorisation écrite est interdite.",
        ],
      },
      {
        type: "text",
        title: "8. Responsabilité",
        paragraphs: [
          "Le CeFoPExD veille à l'exactitude des informations publiées, qui peuvent toutefois évoluer (filières, calendrier, conditions d'admission). Seules les informations confirmées par l'équipe du centre font foi.",
          "Le site peut contenir des liens vers des sites tiers (Google, réseaux sociaux, WhatsApp) dont le CeFoPExD ne contrôle pas le contenu.",
        ],
      },
      {
        type: "text",
        title: "9. Données personnelles",
        paragraphs: [
          "Le traitement de vos données est décrit dans la politique de confidentialité, qui fait partie des présentes conditions.",
        ],
      },
      {
        type: "text",
        title: "10. Modification et droit applicable",
        paragraphs: [
          "Le CeFoPExD peut modifier ces conditions ; la version en vigueur est celle publiée sur cette page.",
          "Les présentes conditions sont régies par le droit togolais. En cas de différend, une solution amiable sera recherchée en priorité avant toute action devant les juridictions compétentes de Lomé.",
          `Contact : ${CONTACT.email} — ${CONTACT.telephones.join(" / ")}.`,
        ],
      },
      {
        type: "cta",
        title: "Une question sur ces conditions ?",
        text: "Notre équipe est à votre disposition pour toute précision.",
        primary: { label: "Nous contacter", href: "/contact" },
        secondary: { label: "Politique de confidentialité", href: "/confidentialite" },
      },
    ],
  },
};

/* Sections dont la page d'accueil liste les sous-pages */
export function sectionCards(section: Section) {
  return Object.entries(section.pages ?? {}).map(([slug, p]) => ({ slug, ...p }));
}
