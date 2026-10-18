/* =============================================
   RÔLES, TYPES DE DEMANDEURS ET RUBRIQUES DE GESTION
   ============================================= */

export type Role = "visiteur" | "apprenant" | "parent" | "professeur" | "secretaire" | "admin" | "dg";

export const ROLES: { value: Role; label: string }[] = [
  { value: "visiteur", label: "Visiteur (sans accès particulier)" },
  { value: "apprenant", label: "Apprenant / étudiant" },
  { value: "parent", label: "Parent / tuteur" },
  { value: "professeur", label: "Professeur" },
  { value: "secretaire", label: "Secrétariat" },
  { value: "admin", label: "Administration" },
  { value: "dg", label: "Directeur Général" },
];
export const roleLabel = (r: string) => ROLES.find((x) => x.value === r)?.label ?? r;

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

/* Personnel ayant accès à l'espace de gestion */
export const ROLES_PERSONNEL: Role[] = ["dg", "admin", "secretaire", "professeur"];

/* Rubriques de l'espace de gestion et rôles qui y ont accès par défaut.
   Le DG peut restreindre ou élargir les rubriques de chaque personne (colonne profils.sections). */
export const SECTIONS_GESTION = [
  { key: "tableau", label: "Tableau de bord", href: "/gestion", roles: ["dg", "admin", "secretaire", "professeur"] },
  { key: "comptes", label: "Comptes & rôles", href: "/gestion/comptes", roles: ["dg"] },
  { key: "inscriptions", label: "Inscriptions", href: "/gestion/inscriptions", roles: ["dg", "admin", "secretaire"] },
  { key: "apprenants", label: "Apprenants", href: "/gestion/apprenants", roles: ["dg", "admin", "secretaire", "professeur"] },
  { key: "professeurs", label: "Professeurs", href: "/gestion/professeurs", roles: ["dg", "admin"] },
  { key: "filieres", label: "Filières & matières", href: "/gestion/filieres", roles: ["dg", "admin"] },
  { key: "presences", label: "Présences", href: "/gestion/presences", roles: ["dg", "admin", "secretaire", "professeur"] },
  { key: "publications", label: "Publications", href: "/gestion/publications", roles: ["dg", "admin", "secretaire"] },
  { key: "messages", label: "Messages", href: "/gestion/messages", roles: ["dg", "admin", "secretaire", "professeur"] },
  { key: "rapports", label: "Rapports", href: "/gestion/rapports", roles: ["dg", "admin", "secretaire", "professeur"] },
  { key: "journal", label: "Journal des actions", href: "/gestion/journal", roles: ["dg"] },
] as const;
export type SectionKey = (typeof SECTIONS_GESTION)[number]["key"];

export function sectionsAutorisees(role: string, sections: string[] | null): SectionKey[] {
  if (role === "dg") return SECTIONS_GESTION.map((s) => s.key);
  const parDefaut = SECTIONS_GESTION.filter((s) => (s.roles as readonly string[]).includes(role)).map((s) => s.key);
  if (!sections) return parDefaut;
  // Le tableau de bord reste toujours accessible au personnel
  return SECTIONS_GESTION.filter((s) => s.key === "tableau" || sections.includes(s.key)).map((s) => s.key);
}

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
