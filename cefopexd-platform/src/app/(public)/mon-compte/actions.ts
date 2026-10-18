"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, nomComplet } from "@/lib/session";
import { TYPES_DEMANDEUR } from "@/lib/roles";
import { notifierParEmail } from "@/lib/email";
import { lireFichiers, versDocuments } from "@/lib/fichiers";

export type EtatFormulaire = { erreur?: string; ok?: string };

const texte = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const cheminSur = (p: string) => (p.startsWith("/") && !p.startsWith("//") ? p : "/mon-espace");

/* Première connexion : identité, photo d'identité, type de demande, motif et documents.
   La direction est ensuite prévenue. */
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

  const fichiers = lireFichiers(fd.entries(), user.id);
  const photo = fichiers.find((f) => f.categorie === "photo" && f.bucket === "photos");
  if (!photo && !profil.photo_path) return { erreur: "Ajoutez votre photo d'identité." };

  const { error } = await supabase
    .from("profils")
    .update({ ...champs, telephone: champs.telephone || null, photo_path: photo?.chemin ?? profil.photo_path, profil_complet: true })
    .eq("id", user.id);
  if (error) return { erreur: "Enregistrement impossible : " + error.message };

  if (fichiers.length) {
    const { error: errDocs } = await supabase.from("documents").insert(versDocuments(fichiers));
    if (errDocs) console.error("Documents du profil non enregistrés :", errDocs.message);
  }

  if (!profil.profil_complet) {
    await notifierParEmail(
      ["dg", "admin"],
      "Nouvelle demande de compte — CeFoPExD",
      `${nomComplet(champs)} (${user.email}) a créé son compte.\nType : ${champs.type_demandeur}\nMotif : ${champs.motif}\nDocuments joints : ${fichiers.length}\n\nLe Directeur Général doit valider le compte et attribuer un rôle.`,
      "/gestion/comptes"
    );
  }

  revalidatePath("/mon-espace");
  redirect(cheminSur(texte(fd, "next")));
}

/* Modification du profil depuis « Mon espace » (pseudo et photo compris) */
export async function modifierProfil(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const { supabase, user, profil } = await getSession();
  if (!user || !profil) return { erreur: "Votre session a expiré. Reconnectez-vous." };

  const pseudo = texte(fd, "pseudo").toLowerCase();
  if (!/^[a-z0-9._]{3,30}$/.test(pseudo)) {
    return { erreur: "Le pseudo doit contenir 3 à 30 caractères : lettres, chiffres, point ou tiret bas." };
  }
  const photo = lireFichiers(fd.entries(), user.id).find((f) => f.categorie === "photo" && f.bucket === "photos");
  const { error } = await supabase
    .from("profils")
    .update({
      pseudo,
      nom: texte(fd, "nom"),
      prenom: texte(fd, "prenom"),
      telephone: texte(fd, "telephone") || null,
      lieu_naissance: texte(fd, "lieu_naissance"),
      date_naissance: texte(fd, "date_naissance") || null,
      ...(photo ? { photo_path: photo.chemin } : {}),
    })
    .eq("id", user.id);
  if (error) {
    return { erreur: error.code === "23505" ? "Ce pseudo est déjà pris, choisissez-en un autre." : error.message };
  }
  if (photo) await supabase.from("documents").insert(versDocuments([photo]));
  revalidatePath("/mon-espace");
  return { ok: "Profil mis à jour." };
}

/* Ajout de documents (CV, diplômes…) depuis « Mon espace » */
export async function ajouterDocuments(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const { supabase, user } = await getSession();
  if (!user) return { erreur: "Votre session a expiré. Reconnectez-vous." };
  const fichiers = lireFichiers(fd.entries(), user.id);
  if (!fichiers.length) return { erreur: "Choisissez au moins un fichier." };
  const titre = texte(fd, "titre");
  const { error } = await supabase.from("documents").insert(versDocuments(fichiers).map((d) => ({ ...d, titre: titre || d.titre })));
  if (error) return { erreur: error.message };
  revalidatePath("/mon-espace");
  return { ok: `${fichiers.length} document(s) ajouté(s).` };
}

/* Comptes créés par le DG (e-mail + mot de passe) : changement du mot de passe */
export async function changerMotDePasse(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const { supabase, user } = await getSession();
  if (!user) return { erreur: "Votre session a expiré. Reconnectez-vous." };
  const mdp = texte(fd, "mot_de_passe");
  if (mdp.length < 8) return { erreur: "Le mot de passe doit contenir au moins 8 caractères." };
  if (mdp !== texte(fd, "confirmation")) return { erreur: "Les deux mots de passe ne correspondent pas." };
  const { error } = await supabase.auth.updateUser({ password: mdp });
  if (error) return { erreur: error.message };
  return { ok: "Mot de passe modifié." };
}
