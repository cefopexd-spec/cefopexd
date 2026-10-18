import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLES_PERSONNEL, sectionsAutorisees, type Role, type SectionKey } from "@/lib/roles";

/* =============================================
   SESSION : utilisateur connecté + son profil (table profils)
   ============================================= */
export type ProfilDb = {
  id: string;
  email: string;
  pseudo: string;
  nom: string | null;
  prenom: string | null;
  date_naissance: string | null;
  lieu_naissance: string | null;
  telephone: string | null;
  photo_url: string | null;
  photo_path: string | null;
  type_demandeur: string | null;
  motif: string | null;
  role: Role;
  sections: string[] | null;
  statut: "en_attente" | "valide" | "refuse";
  profil_complet: boolean;
};

export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profil: null };
  const { data: profil } = await supabase.from("profils").select("*").eq("id", user.id).maybeSingle<ProfilDb>();
  return { supabase, user, profil };
}

/* Rôle réellement actif (un compte non validé n'a aucun droit) */
export const roleActif = (profil: ProfilDb | null): Role | null =>
  profil && profil.statut === "valide" ? profil.role : null;

/* Page réservée aux personnes connectées dont le profil est complété */
export async function requireProfil(next: string) {
  const session = await getSession();
  if (!session.user) redirect(`/connexion?next=${encodeURIComponent(next)}`);
  if (!session.profil?.profil_complet) redirect(`/mon-compte/completer?next=${encodeURIComponent(next)}`);
  return session as typeof session & { profil: ProfilDb };
}

/* Page de l'espace de gestion : personnel validé ayant accès à la rubrique */
export async function requireGestion(section: SectionKey) {
  const session = await requireProfil(section === "tableau" ? "/gestion" : `/gestion/${section}`);
  const role = roleActif(session.profil);
  if (!role || !ROLES_PERSONNEL.includes(role)) redirect("/mon-espace?acces=refuse");
  const autorisees = sectionsAutorisees(role, session.profil.sections);
  if (!autorisees.includes(section)) redirect("/gestion?acces=refuse");
  return { ...session, role, autorisees };
}

/* Même contrôle pour les Server Actions (renvoie une erreur au lieu de rediriger) */
export async function assertGestion(section: SectionKey, roles?: Role[]) {
  const session = await getSession();
  const role = roleActif(session.profil);
  if (!session.user || !session.profil || !role || !ROLES_PERSONNEL.includes(role)) {
    throw new Error("Accès refusé.");
  }
  if (!sectionsAutorisees(role, session.profil.sections).includes(section)) throw new Error("Accès refusé.");
  if (roles && !roles.includes(role)) throw new Error("Action réservée à : " + roles.join(", "));
  return { ...session, profil: session.profil, role };
}

export const nomComplet = (p: { prenom?: string | null; nom?: string | null; pseudo?: string | null } | null) =>
  p ? [p.prenom, p.nom].filter(Boolean).join(" ") || p.pseudo || "" : "";
