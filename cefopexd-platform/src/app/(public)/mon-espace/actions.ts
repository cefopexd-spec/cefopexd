"use server";

import { revalidatePath } from "next/cache";
import { getSession, roleActif } from "@/lib/session";
import type { EtatFormulaire } from "../mon-compte/actions";

const texte = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

/* Parent : rattacher son enfant (matricule + date de naissance vérifiés par la base) */
export async function lierEnfant(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const { supabase, user } = await getSession();
  if (!user) return { erreur: "Votre session a expiré. Reconnectez-vous." };
  const matricule = texte(fd, "matricule");
  const naissance = texte(fd, "date_naissance");
  if (!matricule || !naissance) return { erreur: "Indiquez le matricule et la date de naissance de l'enfant." };
  const { data, error } = await supabase.rpc("lier_enfant", {
    p_matricule: matricule,
    p_date_naissance: naissance,
    p_lien: texte(fd, "lien") || null,
  });
  if (error) return { erreur: error.message };
  if (data === "introuvable") {
    return { erreur: "Aucun apprenant ne correspond à ce matricule et cette date de naissance. Vérifiez auprès du secrétariat." };
  }
  revalidatePath("/mon-espace");
  return { ok: `${data} est maintenant rattaché(e) à votre compte.` };
}

export async function marquerNotificationsLues() {
  const { supabase, user } = await getSession();
  if (!user) return;
  await supabase.from("notifications").update({ lu: true }).eq("destinataire_id", user.id).eq("lu", false);
  revalidatePath("/mon-espace");
  revalidatePath("/gestion");
}

/* Apprenant ou parent : écrire au secrétariat, à l'administration ou au DG */
export async function envoyerMessageFamille(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const { supabase, user, profil } = await getSession();
  if (!user || !roleActif(profil)) return { erreur: "Votre compte doit être validé pour envoyer des messages." };
  const cible = texte(fd, "cible_role");
  if (!["secretaire", "admin", "dg"].includes(cible)) return { erreur: "Destinataire invalide." };
  const sujet = texte(fd, "sujet");
  const contenu = texte(fd, "contenu");
  if (!sujet || !contenu) return { erreur: "Indiquez un sujet et un message." };
  const { error } = await supabase.from("messages").insert({ expediteur_id: user.id, cible_role: cible, sujet, contenu });
  if (error) return { erreur: error.message };
  revalidatePath("/mon-espace/messages");
  return { ok: "Message envoyé." };
}
