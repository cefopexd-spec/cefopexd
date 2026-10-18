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
  green: "var(--secondary-text)",
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
        blocks: [pending("le mot du Directeur Général"), CTA_INSCRIPTION],
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
              { title: "Pré-inscription en ligne", desc: "Remplissez le formulaire de pré-inscription." },
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
    intro: "Actualités, événements, publications, galerie et questions fréquentes.",
    blocks: [],
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
              { q: "Comment s'inscrire ?", a: "Remplissez la pré-inscription en ligne, puis déposez votre dossier au centre. Les inscriptions se finalisent en présentiel." },
            ],
          },
          CTA_INSCRIPTION,
        ],
      },
    },
  },

  connexion: {
    title: "Espace apprenants",
    intro: "L'espace en ligne des apprenants et des formateurs.",
    blocks: [{
      type: "pending",
      text: "L'espace apprenants (emplois du temps, notes, documents) est en cours de mise en place. Les comptes seront communiqués directement par le centre aux apprenants inscrits.",
    }, CTA_INSCRIPTION],
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
    intro: "Comment le CeFoPExD utilise les informations que vous nous transmettez.",
    blocks: [
      {
        type: "text",
        title: "Données collectées",
        paragraphs: [
          "Les formulaires de pré-inscription et de contact recueillent les informations que vous saisissez : nom, prénom, téléphone, e-mail, filière souhaitée, niveau d'étude et message.",
        ],
      },
      {
        type: "text",
        title: "Utilisation",
        paragraphs: [
          "Ces informations servent uniquement à vous recontacter et à traiter votre demande. Elles ne sont ni vendues ni transmises à des tiers.",
        ],
      },
      {
        type: "text",
        title: "Vos droits",
        paragraphs: [
          `Vous pouvez demander à consulter, corriger ou supprimer vos données à tout moment en écrivant à ${CONTACT.email}.`,
        ],
      },
    ],
  },
};

/* Sections dont la page d'accueil liste les sous-pages */
export function sectionCards(section: Section) {
  return Object.entries(section.pages ?? {}).map(([slug, p]) => ({ slug, ...p }));
}
