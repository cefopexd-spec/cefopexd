/* =============================================
   RÔLES, TYPES DE DEMANDEURS ET RUBRIQUES DE GESTION
   ============================================= */

export type Role =
  | "visiteur" | "candidat" | "apprenant" | "parent" | "professeur"
  | "surveillant" | "comptable" | "secretaire" | "webmaster" | "admin" | "pedagogique"
  | "dg" | "fondateur" | "principal";

/* =============================================
   ORGANIGRAMME DU CENTRE : chaque rôle appartient à une famille
   ============================================= */
export type Famille = "direction" | "administration" | "enseignants" | "apprenants" | "public";

export const ROLES: { value: Role; label: string; famille: Famille; mission: string }[] = [
  // Direction
  { value: "fondateur", label: "Président Fondateur", famille: "direction", mission: "Dirige le centre : accès total, valide les inscriptions, les publications, les comptes et les rôles." },
  { value: "dg", label: "Directeur Général", famille: "direction", mission: "Mêmes droits que la Direction : validation des inscriptions, publications, comptes et rapports." },
  { value: "pedagogique", label: "Directeur des études", famille: "direction", mission: "Pédagogie : filières, matières, professeurs, présences, permissions et rapports." },
  // Administration & services
  { value: "admin", label: "Administration (RAF)", famille: "administration", mission: "Dossiers d'inscription définitive, apprenants, documents, professeurs, paiements." },
  { value: "secretaire", label: "Secrétariat", famille: "administration", mission: "Accueil, pré-inscriptions, apprenants, permissions et retards, publications, documents." },
  { value: "comptable", label: "Comptabilité / caisse", famille: "administration", mission: "Encaissement des frais, reçus imprimables, suivi des paiements par apprenant." },
  { value: "surveillant", label: "Surveillant général", famille: "administration", mission: "Discipline : appel et présences, permissions, absences et retards." },
  { value: "webmaster", label: "Gestionnaire du site (Studio)", famille: "administration", mission: "Construit et publie le site, cartes d'étudiant, documents PDF." },
  // Corps enseignant
  { value: "professeur", label: "Professeur / formateur", famille: "enseignants", mission: "Appel de ses classes, consultation des apprenants, rapports." },
  // Apprenants & familles
  { value: "apprenant", label: "Apprenant (matricule)", famille: "apprenants", mission: "Son espace : présences, annonces, demandes de permission, messagerie." },
  { value: "parent", label: "Parent / tuteur", famille: "apprenants", mission: "Suivi de son enfant : présences, annonces, demandes, échanges avec le centre." },
  // Public
  { value: "candidat", label: "Candidat (nouvel inscrit)", famille: "public", mission: "A déposé une pré-inscription : suit sa demande jusqu'à la validation." },
  { value: "visiteur", label: "Visiteur", famille: "public", mission: "Compte créé, sans accès particulier." },
  // Accès technique, hors organigramme
  { value: "principal", label: "Accès principal (technique)", famille: "direction", mission: "Accès total permanent de maintenance du système." },
];
export const roleLabel = (r: string) => ROLES.find((x) => x.value === r)?.label ?? r;

export const FAMILLES: { cle: Famille; label: string; aide: string }[] = [
  { cle: "direction", label: "Direction", aide: "Président Fondateur, Directeur Général, Directeur des études" },
  { cle: "administration", label: "Administration & services", aide: "Administration, secrétariat, comptabilité, surveillance, site" },
  { cle: "enseignants", label: "Corps enseignant", aide: "Professeurs et formateurs" },
  { cle: "apprenants", label: "Apprenants & familles", aide: "Apprenants inscrits et leurs parents" },
  { cle: "public", label: "Candidats & visiteurs", aide: "Nouveaux inscrits en attente et visiteurs" },
];
export const familleDuRole = (r: string): Famille => ROLES.find((x) => x.value === r)?.famille ?? "public";
export const rolesDeFamille = (f: Famille) => ROLES.filter((r) => r.famille === f && r.value !== "principal").map((r) => r.value);

/* Rôles ayant tous les droits de la Direction (traités comme « dg » pour les autorisations) */
export const ROLES_DIRECTION: Role[] = ["fondateur", "dg", "principal"];
/* Droits effectifs : le Président Fondateur et l'accès principal ont les droits du DG */
export const droitsDuRole = (r: Role): Role => (ROLES_DIRECTION.includes(r) ? "dg" : r);

/* Responsables dont la Direction crée directement le compte (connexion par e-mail ou pseudo + mot de passe) */
export const ROLES_RESPONSABLES: Role[] = ["fondateur", "dg", "pedagogique", "admin", "secretaire", "comptable", "surveillant", "webmaster", "professeur"];

/* Rôles qui construisent et publient le site (Studio CeFoPExD) */
export const ROLES_STUDIO: Role[] = ["dg", "webmaster"];

export const TYPES_DEMANDEUR = [
  { value: "etudiant", label: "Étudiant(e) / futur(e) apprenant(e)" },
  { value: "parent", label: "Parent d'élève ou tuteur" },
  { value: "stage", label: "Particulier — demande de stage" },
  { value: "emploi", label: "Particulier — demande d'emploi" },
  { value: "administration", label: "Personnel de l'administration / enseignant" },
  { value: "autre", label: "Autre demande" },
] as const;
export const typeLabel = (t: string | null | undefined) =>
  TYPES_DEMANDEUR.find((x) => x.value === t)?.label ?? "—";

/* Documents à joindre selon le type de demande (la photo d'identité est toujours demandée) */
export const CATEGORIES_DOCUMENT: Record<string, string> = {
  photo: "Photo d'identité",
  cv: "CV",
  lettre_motivation: "Lettre de motivation",
  diplome: "Diplôme",
  acte_naissance: "Acte de naissance",
  piece_identite: "Pièce d'identité",
  attestation: "Attestation",
  bulletin: "Bulletin de notes",
  rapport: "Rapport",
  justificatif: "Justificatif",
  autre: "Autre document",
};
export const DOCUMENTS_PAR_TYPE: Record<string, { categorie: string; requis?: boolean }[]> = {
  etudiant: [{ categorie: "acte_naissance" }, { categorie: "diplome" }, { categorie: "piece_identite" }],
  parent: [{ categorie: "piece_identite" }],
  stage: [{ categorie: "cv", requis: true }, { categorie: "lettre_motivation" }, { categorie: "attestation" }],
  emploi: [{ categorie: "cv", requis: true }, { categorie: "lettre_motivation" }, { categorie: "diplome" }],
  administration: [{ categorie: "cv", requis: true }, { categorie: "diplome" }],
  autre: [{ categorie: "justificatif" }],
};
export const DOCUMENTS_INSCRIPTION = ["acte_naissance", "diplome", "bulletin", "piece_identite"];

/* Personnel ayant accès à l'espace de gestion (droits effectifs) */
export const ROLES_PERSONNEL: Role[] = ["dg", "pedagogique", "admin", "secretaire", "comptable", "surveillant", "webmaster", "professeur"];
const TOUS: Role[] = ROLES_PERSONNEL;

/* Rubriques de l'espace de gestion et rôles qui y ont accès par défaut.
   La Direction peut restreindre ou élargir les rubriques de chaque personne (colonne profils.sections). */
export const SECTIONS_GESTION = [
  { key: "tableau", label: "Tableau de bord", href: "/gestion", roles: TOUS },
  { key: "profil", label: "Mon profil", href: "/gestion/profil", roles: TOUS },
  { key: "recherche", label: "Recherche", href: "/gestion/recherche", roles: TOUS },
  { key: "comptes", label: "Comptes & rôles", href: "/gestion/comptes", roles: ["dg"] },
  { key: "inscriptions", label: "Inscriptions", href: "/gestion/inscriptions", roles: ["dg", "admin", "secretaire", "webmaster"] },
  { key: "apprenants", label: "Apprenants & cartes", href: "/gestion/apprenants", roles: TOUS },
  { key: "paiements", label: "Paiements & reçus", href: "/gestion/paiements", roles: ["dg", "admin", "comptable", "secretaire"] },
  { key: "presences", label: "Présences", href: "/gestion/presences", roles: ["dg", "pedagogique", "admin", "secretaire", "surveillant", "professeur"] },
  { key: "demandes", label: "Permissions & retards", href: "/gestion/demandes", roles: ["dg", "pedagogique", "admin", "secretaire", "surveillant"] },
  { key: "professeurs", label: "Professeurs", href: "/gestion/professeurs", roles: ["dg", "pedagogique", "admin"] },
  { key: "filieres", label: "Filières & matières", href: "/gestion/filieres", roles: ["dg", "pedagogique", "admin"] },
  { key: "publications", label: "Publications", href: "/gestion/publications", roles: ["dg", "pedagogique", "admin", "secretaire"] },
  { key: "documents", label: "Documents", href: "/gestion/documents", roles: ["dg", "admin", "secretaire"] },
  { key: "messages", label: "Annonces aux groupes", href: "/gestion/messages", roles: TOUS },
  { key: "rapports", label: "Rapports", href: "/gestion/rapports", roles: TOUS },
  { key: "site", label: "Studio du site", href: "/gestion/site", roles: ["dg", "webmaster"] },
  { key: "journal", label: "Journal des actions", href: "/gestion/journal", roles: ["dg"] },
] as const;
export type SectionKey = (typeof SECTIONS_GESTION)[number]["key"];

/* Rubriques toujours ouvertes au personnel */
const TOUJOURS: string[] = ["tableau", "profil", "recherche"];

export function sectionsAutorisees(role: string, sections: string[] | null): SectionKey[] {
  if (role === "dg" || ROLES_DIRECTION.includes(role as Role)) return SECTIONS_GESTION.map((s) => s.key);
  const parDefaut = SECTIONS_GESTION.filter((s) => (s.roles as readonly string[]).includes(role)).map((s) => s.key);
  if (!sections) return parDefaut;
  return SECTIONS_GESTION.filter((s) => TOUJOURS.includes(s.key) || sections.includes(s.key)).map((s) => s.key);
}

/* Date et heure lisibles pour toutes les validations */
export const dateHeure = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lome" }) : "";

/* Circuit des inscriptions */
export const STATUTS_INSCRIPTION: Record<string, { label: string; className: string; etape: number }> = {
  en_attente: { label: "Reçue — en attente", className: "is-pending", etape: 1 },
  en_traitement: { label: "En traitement (secrétariat)", className: "is-progress", etape: 2 },
  transmis_admin: { label: "Transmise à l'administration", className: "is-progress", etape: 3 },
  dossier_complet: { label: "Dossier soumis à la Direction", className: "is-progress", etape: 4 },
  valide: { label: "Inscription validée", className: "is-ok", etape: 5 },
  refuse: { label: "Non retenue", className: "is-ko", etape: 5 },
};

export const STATUTS_PRESENCE = [
  { value: "present", label: "Présent" },
  { value: "absent", label: "Absent" },
  { value: "retard", label: "En retard" },
  { value: "excuse", label: "Absence excusée" },
] as const;

/* Pièces du dossier d'inscription définitive */
export const PIECES = [
  "Copie du dernier diplôme",
  "Copie de l'acte de naissance",
  "2 photos d'identité",
  "Copie de la pièce d'identité",
  "Certificat de résidence",
];
