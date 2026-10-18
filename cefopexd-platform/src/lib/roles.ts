/* =============================================
   RÔLES, TYPES DE DEMANDEURS ET RUBRIQUES DE GESTION
   ============================================= */

export type Role = "visiteur" | "apprenant" | "parent" | "professeur" | "secretaire" | "pedagogique" | "admin" | "dg";

export const ROLES: { value: Role; label: string }[] = [
  { value: "visiteur", label: "Visiteur (sans accès particulier)" },
  { value: "apprenant", label: "Apprenant / étudiant" },
  { value: "parent", label: "Parent / tuteur" },
  { value: "professeur", label: "Professeur" },
  { value: "secretaire", label: "Secrétariat" },
  { value: "pedagogique", label: "Gestionnaire pédagogique" },
  { value: "admin", label: "Administration" },
  { value: "dg", label: "Directeur Général" },
];
export const roleLabel = (r: string) => ROLES.find((x) => x.value === r)?.label ?? r;

/* Responsables dont le DG crée directement le compte (connexion par e-mail ou pseudo + mot de passe) */
export const ROLES_RESPONSABLES: Role[] = ["admin", "secretaire", "pedagogique", "professeur"];

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

/* Personnel ayant accès à l'espace de gestion */
export const ROLES_PERSONNEL: Role[] = ["dg", "admin", "secretaire", "pedagogique", "professeur"];
const TOUS: Role[] = ["dg", "admin", "secretaire", "pedagogique", "professeur"];

/* Rubriques de l'espace de gestion et rôles qui y ont accès par défaut.
   Le DG peut restreindre ou élargir les rubriques de chaque personne (colonne profils.sections). */
export const SECTIONS_GESTION = [
  { key: "tableau", label: "Tableau de bord", href: "/gestion", roles: TOUS },
  { key: "recherche", label: "Recherche", href: "/gestion/recherche", roles: TOUS },
  { key: "comptes", label: "Comptes & rôles", href: "/gestion/comptes", roles: ["dg"] },
  { key: "inscriptions", label: "Inscriptions", href: "/gestion/inscriptions", roles: ["dg", "admin", "secretaire"] },
  { key: "demandes", label: "Permissions & retards", href: "/gestion/demandes", roles: ["dg", "admin", "secretaire", "pedagogique"] },
  { key: "apprenants", label: "Apprenants", href: "/gestion/apprenants", roles: TOUS },
  { key: "professeurs", label: "Professeurs", href: "/gestion/professeurs", roles: ["dg", "admin", "pedagogique"] },
  { key: "filieres", label: "Filières & matières", href: "/gestion/filieres", roles: ["dg", "admin", "pedagogique"] },
  { key: "presences", label: "Présences", href: "/gestion/presences", roles: TOUS },
  { key: "publications", label: "Publications", href: "/gestion/publications", roles: ["dg", "admin", "secretaire", "pedagogique"] },
  { key: "documents", label: "Documents", href: "/gestion/documents", roles: ["dg", "admin", "secretaire"] },
  { key: "messages", label: "Annonces aux groupes", href: "/gestion/messages", roles: TOUS },
  { key: "rapports", label: "Rapports", href: "/gestion/rapports", roles: TOUS },
  { key: "journal", label: "Journal des actions", href: "/gestion/journal", roles: ["dg"] },
] as const;
export type SectionKey = (typeof SECTIONS_GESTION)[number]["key"];

export function sectionsAutorisees(role: string, sections: string[] | null): SectionKey[] {
  if (role === "dg") return SECTIONS_GESTION.map((s) => s.key);
  const parDefaut = SECTIONS_GESTION.filter((s) => (s.roles as readonly string[]).includes(role)).map((s) => s.key);
  if (!sections) return parDefaut;
  // Le tableau de bord et la recherche restent toujours accessibles au personnel
  return SECTIONS_GESTION.filter((s) => s.key === "tableau" || s.key === "recherche" || sections.includes(s.key)).map((s) => s.key);
}

/* Date et heure lisibles pour toutes les validations */
export const dateHeure = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lome" }) : "";

/* Circuit des inscriptions */
export const STATUTS_INSCRIPTION: Record<string, { label: string; className: string; etape: number }> = {
  en_attente: { label: "Reçue — en attente", className: "is-pending", etape: 1 },
  en_traitement: { label: "En traitement (secrétariat)", className: "is-progress", etape: 2 },
  transmis_admin: { label: "Transmise à l'administration", className: "is-progress", etape: 3 },
  dossier_complet: { label: "Dossier soumis au DG", className: "is-progress", etape: 4 },
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
