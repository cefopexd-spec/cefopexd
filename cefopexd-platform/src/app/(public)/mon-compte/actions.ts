"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, nomComplet } from "@/lib/session";
import { TYPES_DEMANDEUR } from "@/lib/roles";
import { notifierParEmail } from "@/lib/email";

export type EtatFormulaire = { erreur?: string; ok?: string };

const texte = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const cheminSur = (p: string) => (p.startsWith("/") && !p.startsWith("//") ? p : "/mon-espace");

/* Première connexion : complète le profil, puis prévient le DG et l'administration */
export async function completerProfil(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const { supabase, user, profil } = await getSession();
  if (!user || !profil) return { erreur: "Votre session a expiré. Reconnectez-vous." };

  const champs = {
    nom: texte(fd, "nom"),
    prenom: texte(fd, "prenom"),
    date_naissance: texte(fd, "date_naissance"),
    lieu_naissance: texte(fd, "lieu_naissance"),
    telephone: texte(fd, "telephone"),
    type_demandeur: texte(fd, "type_demandeur"),
    motif: texte(fd, "motif"),
  };
  if (Object.entries(champs).some(([k, v]) => k !== "telephone" && !v)) {
    return { erreur: "Merci de remplir tous les champs obligatoires." };
  }
  if (!TYPES_DEMANDEUR.some((t) => t.value === champs.type_demandeur)) {
    return { erreur: "Choisissez qui vous êtes dans la liste." };
  }
  const naissance = new Date(champs.date_naissance);
  if (Number.isNaN(naissance.getTime()) || naissance > new Date() || naissance.getFullYear() < 1920) {
    return { erreur: "La date de naissance n'est pas valide." };
  }

  const { error } = await supabase
    .from("profils")
    .update({ ...champs, telephone: champs.telephone || null, profil_complet: true })
    .eq("id", user.id);
  if (error) return { erreur: "Enregistrement impossible : " + error.message };

  if (!profil.profil_complet) {
    await notifierParEmail(
      ["dg", "admin"],
      "Nouvelle demande de compte — CeFoPExD",
      `${nomComplet(champs)} (${user.email}) a créé son compte.\nType : ${champs.type_demandeur}\nMotif : ${champs.motif}\n\nLe Directeur Général doit valider le compte et attribuer un rôle.`,
      "/gestion/comptes"
    );
  }

  revalidatePath("/mon-espace");
  redirect(cheminSur(texte(fd, "next")));
}

/* Modification du profil depuis « Mon espace » (pseudo compris) */
export async function modifierProfil(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const { supabase, user } = await getSession();
  if (!user) return { erreur: "Votre session a expiré. Reconnectez-vous." };

  const pseudo = texte(fd, "pseudo").toLowerCase();
  if (!/^[a-z0-9._]{3,30}$/.test(pseudo)) {
    return { erreur: "Le pseudo doit contenir 3 à 30 caractères : lettres, chiffres, point ou tiret bas." };
  }
  const { error } = await supabase
    .from("profils")
    .update({
      pseudo,
      nom: texte(fd, "nom"),
      prenom: texte(fd, "prenom"),
      telephone: texte(fd, "telephone") || null,
      lieu_naissance: texte(fd, "lieu_naissance"),
      date_naissance: texte(fd, "date_naissance") || null,
    })
    .eq("id", user.id);
  if (error) {
    return { erreur: error.code === "23505" ? "Ce pseudo est déjà pris, choisissez-en un autre." : error.message };
  }
  revalidatePath("/mon-espace");
  return { ok: "Profil mis à jour." };
}
