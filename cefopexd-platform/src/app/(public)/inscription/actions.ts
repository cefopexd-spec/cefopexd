"use server";

import { getSession } from "@/lib/session";
import { notifierParEmail } from "@/lib/email";

/* Après l'envoi d'une pré-inscription : e-mail au secrétariat, à l'administration et au DG.
   (La notification dans l'espace de gestion est créée automatiquement par la base.) */
export async function alerteNouvelleInscription(id: string) {
  const { supabase, user } = await getSession();
  if (!user) return;
  // La sécurité de la base ne renvoie la demande que si elle appartient à l'utilisateur
  const { data } = await supabase
    .from("inscriptions")
    .select("id, nom, prenom, filiere, niveau_etude, telephone, type_demandeur, motif")
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  await notifierParEmail(
    ["secretaire", "admin", "dg"],
    `Nouvelle pré-inscription — ${data.prenom} ${data.nom}`,
    `Filière : ${data.filiere}\nNiveau : ${data.niveau_etude}\nTéléphone : ${data.telephone}\nProfil : ${data.type_demandeur ?? "—"}\nMotif : ${data.motif ?? "—"}`,
    `/gestion/inscriptions/${data.id}`
  );
}
