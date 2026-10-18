"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertGestion, nomComplet } from "@/lib/session";
import { ROLES, ROLES_RESPONSABLES, SECTIONS_GESTION, roleLabel } from "@/lib/roles";
import { emailsDesProfils, emailsDesRoles, envoyerEmail, notifierParEmail } from "@/lib/email";
import { lireFichiers, versDocuments } from "@/lib/fichiers";
import { MESSAGE_CLE_MANQUANTE, adminClient } from "@/lib/supabase/admin";

export type Etat = { erreur?: string; ok?: string };

const t = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const tn = (fd: FormData, k: string) => t(fd, k) || null;
const echec = (e: unknown): Etat => ({ erreur: e instanceof Error ? e.message : "Action impossible." });

/* =============================================
   COMPTES & RÔLES (Directeur Général uniquement)
   ============================================= */
export async function majCompte(_: Etat, fd: FormData): Promise<Etat> {
  try {
    const { supabase } = await assertGestion("comptes", ["dg"]);
    const role = t(fd, "role");
    const statut = t(fd, "statut");
    if (!ROLES.some((r) => r.value === role)) return { erreur: "Rôle invalide." };
    if (!["en_attente", "valide", "refuse"].includes(statut)) return { erreur: "Statut invalide." };
    const choisies = fd.getAll("sections").map(String).filter((s) => SECTIONS_GESTION.some((x) => x.key === s));
    const sections = fd.get("sections_perso") === "on" ? choisies : null;
    const { error } = await supabase.from("profils").update({ role, statut, sections }).eq("id", t(fd, "id"));
    if (error) return { erreur: error.message };
    revalidatePath("/gestion/comptes");
    return { ok: "Compte mis à jour." };
  } catch (e) { return echec(e); }
}

/* =============================================
   INSCRIPTIONS : secrétariat -> administration -> DG
   ============================================= */
async function changerStatut(id: string, statut: string, extra: Record<string, unknown> = {}) {
  const { supabase, user } = await assertGestion("inscriptions");
  const { error } = await supabase.from("inscriptions").update({ statut, ...extra }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/gestion/inscriptions");
  revalidatePath(`/gestion/inscriptions/${id}`);
  return { supabase, user };
}

export async function prendreEnCharge(id: string) {
  const { user } = await assertGestion("inscriptions", ["secretaire", "admin", "dg"]);
  await changerStatut(id, "en_traitement", { traite_par: user!.id });
}

export async function enregistrerNotes(_: Etat, fd: FormData): Promise<Etat> {
  try {
    const { supabase } = await assertGestion("inscriptions");
    const { error } = await supabase.from("inscriptions").update({ notes_secretariat: tn(fd, "notes") }).eq("id", t(fd, "id"));
    if (error) return { erreur: error.message };
    revalidatePath(`/gestion/inscriptions/${t(fd, "id")}`);
    return { ok: "Notes enregistrées." };
  } catch (e) { return echec(e); }
}

export async function transmettreAdmin(id: string) {
  await assertGestion("inscriptions", ["secretaire", "admin", "dg"]);
  const { supabase } = await changerStatut(id, "transmis_admin");
  const { data } = await supabase.from("inscriptions").select("nom, prenom, filiere").eq("id", id).single();
  await notifierParEmail(["admin"], `Dossier transmis : ${data?.prenom} ${data?.nom}`, `Le secrétariat vous a transmis le dossier de ${data?.prenom} ${data?.nom} (${data?.filiere}) pour compléter l'inscription définitive.`, `/gestion/inscriptions/${id}`);
}

/* Fiche d'inscription définitive remplie par l'administration */
export async function enregistrerDossier(_: Etat, fd: FormData): Promise<Etat> {
  try {
    const { supabase, user } = await assertGestion("inscriptions", ["admin", "dg"]);
    const dossier = {
      sexe: tn(fd, "sexe"),
      nationalite: tn(fd, "nationalite"),
      adresse: tn(fd, "adresse"),
      filiere_slug: tn(fd, "filiere_slug"),
      niveau_etude: tn(fd, "niveau_etude"),
      annee_academique: tn(fd, "annee_academique"),
      tuteur_nom: tn(fd, "tuteur_nom"),
      tuteur_lien: tn(fd, "tuteur_lien"),
      tuteur_telephone: tn(fd, "tuteur_telephone"),
      tuteur_email: tn(fd, "tuteur_email"),
      pieces: fd.getAll("pieces").map(String),
      observations: tn(fd, "observations"),
    };
    const { error } = await supabase.from("inscriptions").update({ dossier, complete_par: user!.id }).eq("id", t(fd, "id"));
    if (error) return { erreur: error.message };
    revalidatePath(`/gestion/inscriptions/${t(fd, "id")}`);
    return { ok: "Dossier enregistré. Vous pouvez le soumettre au Directeur Général." };
  } catch (e) { return echec(e); }
}

export async function soumettreDG(id: string) {
  await assertGestion("inscriptions", ["admin", "dg"]);
  const { supabase } = await changerStatut(id, "dossier_complet");
  const { data } = await supabase.from("inscriptions").select("nom, prenom, filiere").eq("id", id).single();
  await notifierParEmail(["dg"], `Dossier à valider : ${data?.prenom} ${data?.nom}`, `L'administration vous soumet le dossier d'inscription définitive de ${data?.prenom} ${data?.nom} (${data?.filiere}).`, `/gestion/inscriptions/${id}`);
}

/* Validation par le DG : création de l'apprenant avec matricule automatique */
export async function validerInscription(id: string) {
  const { supabase } = await assertGestion("inscriptions", ["dg"]);
  const { data: ins, error } = await supabase.from("inscriptions").select("*").eq("id", id).single();
  if (error || !ins) throw new Error("Inscription introuvable.");
  if (ins.apprenant_id) redirect(`/gestion/inscriptions/${id}`);

  const d = (ins.dossier ?? {}) as Record<string, string | null>;
  const slug = d.filiere_slug;
  const { data: filiere } = slug
    ? await supabase.from("filieres").select("id").eq("slug", slug).maybeSingle()
    : await supabase.from("filieres").select("id").eq("nom", ins.filiere).maybeSingle();

  const { data: apprenant, error: errApp } = await supabase.from("apprenants").insert({
    profil_id: ins.type_demandeur === "parent" ? null : ins.user_id,
    inscription_id: ins.id,
    nom: ins.nom,
    prenom: ins.prenom,
    sexe: d.sexe,
    date_naissance: ins.date_naissance,
    lieu_naissance: ins.lieu_naissance,
    nationalite: d.nationalite,
    telephone: ins.telephone,
    email: ins.email,
    adresse: d.adresse,
    filiere_id: filiere?.id ?? null,
    niveau_etude: d.niveau_etude ?? ins.niveau_etude,
    annee_academique: d.annee_academique,
    tuteur_nom: d.tuteur_nom,
    tuteur_lien: d.tuteur_lien,
    tuteur_telephone: d.tuteur_telephone,
    tuteur_email: d.tuteur_email,
    photo_path: ins.photo_path,
  }).select("id").single();
  if (errApp || !apprenant) throw new Error("Création de l'apprenant impossible : " + errApp?.message);

  await supabase.from("inscriptions").update({ statut: "valide", apprenant_id: apprenant.id }).eq("id", id);
  // Les documents de la demande suivent l'apprenant
  await supabase.from("documents").update({ apprenant_id: apprenant.id }).eq("inscription_id", id);

  // Le demandeur obtient l'accès correspondant (apprenant ou parent) si son compte n'avait pas encore de rôle
  if (ins.user_id) {
    const nouveauRole = ins.type_demandeur === "parent" ? "parent" : "apprenant";
    await supabase.from("profils").update({ role: nouveauRole, statut: "valide" }).eq("id", ins.user_id).eq("role", "visiteur");
    if (ins.type_demandeur === "parent") {
      await supabase.from("parents_apprenants").insert({ parent_id: ins.user_id, apprenant_id: apprenant.id, lien: d.tuteur_lien });
    }
  }
  revalidatePath("/gestion/inscriptions");
  revalidatePath("/gestion/apprenants");
  redirect(`/gestion/inscriptions/${id}?valide=1`);
}

export async function refuserInscription(_: Etat, fd: FormData): Promise<Etat> {
  try {
    await assertGestion("inscriptions", ["dg"]);
    await changerStatut(t(fd, "id"), "refuse", { notes_secretariat: tn(fd, "motif_refus") });
    return { ok: "Inscription refusée." };
  } catch (e) { return echec(e); }
}

/* =============================================
   APPRENANTS
   ============================================= */
function champsApprenant(fd: FormData) {
  return {
    nom: t(fd, "nom"),
    prenom: t(fd, "prenom"),
    sexe: tn(fd, "sexe"),
    date_naissance: tn(fd, "date_naissance"),
    lieu_naissance: tn(fd, "lieu_naissance"),
    nationalite: tn(fd, "nationalite"),
    telephone: tn(fd, "telephone"),
    email: tn(fd, "email"),
    adresse: tn(fd, "adresse"),
    filiere_id: tn(fd, "filiere_id"),
    niveau_etude: tn(fd, "niveau_etude"),
    annee_academique: tn(fd, "annee_academique"),
    tuteur_nom: tn(fd, "tuteur_nom"),
    tuteur_lien: tn(fd, "tuteur_lien"),
    tuteur_telephone: tn(fd, "tuteur_telephone"),
    tuteur_email: tn(fd, "tuteur_email"),
  };
}

export async function creerApprenant(_: Etat, fd: FormData): Promise<Etat> {
  try {
    const { supabase } = await assertGestion("apprenants", ["dg", "admin", "secretaire"]);
    const champs = champsApprenant(fd);
    if (!champs.nom || !champs.prenom) return { erreur: "Nom et prénom obligatoires." };
    const { data, error } = await supabase.from("apprenants").insert(champs).select("id, matricule").single();
    if (error) return { erreur: error.message };
    revalidatePath("/gestion/apprenants");
    return { ok: `Apprenant créé — matricule ${data.matricule}.` };
  } catch (e) { return echec(e); }
}

export async function majApprenant(_: Etat, fd: FormData): Promise<Etat> {
  try {
    const { supabase } = await assertGestion("apprenants", ["dg", "admin", "secretaire"]);
    const { error } = await supabase.from("apprenants").update({ ...champsApprenant(fd), statut: t(fd, "statut") || "actif" }).eq("id", t(fd, "id"));
    if (error) return { erreur: error.message };
    revalidatePath(`/gestion/apprenants/${t(fd, "id")}`);
    return { ok: "Fiche mise à jour." };
  } catch (e) { return echec(e); }
}

/* =============================================
   PROFESSEURS ET MATIÈRES
   ============================================= */
export async function enregistrerProfesseur(_: Etat, fd: FormData): Promise<Etat> {
  try {
    const { supabase } = await assertGestion("professeurs", ["dg", "admin"]);
    const id = t(fd, "id");
    const email = tn(fd, "email")?.toLowerCase() ?? null;
    // Rattachement automatique au compte du professeur s'il existe (même e-mail)
    const { data: compte } = email ? await supabase.from("profils").select("id").eq("email", email).maybeSingle() : { data: null };
    const champs = {
      nom: t(fd, "nom"),
      prenom: t(fd, "prenom"),
      email,
      telephone: tn(fd, "telephone"),
      specialite: tn(fd, "specialite"),
      diplome: tn(fd, "diplome"),
      date_embauche: tn(fd, "date_embauche"),
      dossier: tn(fd, "dossier"),
      actif: fd.get("actif") !== "off",
      ...(compte ? { profil_id: compte.id } : {}),
    };
    if (!champs.nom || !champs.prenom) return { erreur: "Nom et prénom obligatoires." };
    const res = id
      ? await supabase.from("professeurs").update(champs).eq("id", id).select("id").single()
      : await supabase.from("professeurs").insert(champs).select("id").single();
    if (res.error) return { erreur: res.error.message };
    const profId = res.data.id;
    const matieres = fd.getAll("matieres").map(String);
    await supabase.from("professeur_matieres").delete().eq("professeur_id", profId);
    if (matieres.length) {
      await supabase.from("professeur_matieres").insert(matieres.map((m) => ({ professeur_id: profId, matiere_id: m })));
    }
    revalidatePath("/gestion/professeurs");
    return { ok: id ? "Professeur mis à jour." : "Professeur ajouté." };
  } catch (e) { return echec(e); }
}

export async function ajouterMatiere(_: Etat, fd: FormData): Promise<Etat> {
  try {
    const { supabase } = await assertGestion("filieres", ["dg", "admin"]);
    const nom = t(fd, "nom");
    if (!nom) return { erreur: "Nom de la matière obligatoire." };
    const { error } = await supabase.from("matieres").insert({
      nom,
      filiere_id: t(fd, "filiere_id"),
      coefficient: tn(fd, "coefficient"),
      volume_horaire: tn(fd, "volume_horaire"),
    });
    if (error) return { erreur: error.message };
    revalidatePath("/gestion/filieres");
    return { ok: "Matière ajoutée." };
  } catch (e) { return echec(e); }
}

export async function supprimerMatiere(id: string) {
  const { supabase } = await assertGestion("filieres", ["dg", "admin"]);
  await supabase.from("matieres").delete().eq("id", id);
  revalidatePath("/gestion/filieres");
}

/* =============================================
   PRÉSENCES (appel du jour)
   ============================================= */
export async function enregistrerPresences(_: Etat, fd: FormData): Promise<Etat> {
  try {
    const { supabase, user } = await assertGestion("presences");
    const jour = t(fd, "jour");
    if (!jour) return { erreur: "Choisissez la date." };
    const lignes = fd.getAll("apprenant_id").map(String).map((id) => ({
      apprenant_id: id,
      jour,
      statut: t(fd, `statut_${id}`) || "present",
      motif: tn(fd, `motif_${id}`),
      saisi_par: user!.id,
    }));
    if (!lignes.length) return { erreur: "Aucun apprenant dans cette filière." };
    const { error } = await supabase.from("presences").upsert(lignes, { onConflict: "apprenant_id,jour" });
    if (error) return { erreur: error.message };
    revalidatePath("/gestion/presences");
    const absents = lignes.filter((l) => l.statut === "absent").length;
    return { ok: `Appel enregistré : ${lignes.length} apprenant(s), ${absents} absent(s). Les parents rattachés voient les absences dans leur espace.` };
  } catch (e) { return echec(e); }
}

/* =============================================
   PUBLICATIONS : le personnel prépare et soumet, le DG publie
   ============================================= */
export async function enregistrerPublication(_: Etat, fd: FormData): Promise<Etat> {
  try {
    const { supabase, user, role } = await assertGestion("publications");
    const id = t(fd, "id");
    // brouillon | soumettre | publier (la case « Brouillon » l'emporte)
    const intentions = fd.getAll("intention").map(String);
    const intention = intentions.includes("brouillon") ? "brouillon" : intentions[0];
    const statut = role === "dg" && intention === "publier" ? "publiee" : intention === "brouillon" ? "brouillon" : "soumise";
    const champs = {
      titre: t(fd, "titre"),
      resume: tn(fd, "resume"),
      contenu: t(fd, "contenu"),
      categorie: t(fd, "categorie") || "actualite",
      public: fd.get("public") === "on",
      cible: t(fd, "cible") || "tous",
      date_evenement: tn(fd, "date_evenement"),
      image_url: tn(fd, "image_url"),
      statut,
    };
    if (!champs.titre || !champs.contenu) return { erreur: "Titre et contenu obligatoires." };
    const { error } = id
      ? await supabase.from("publications").update(champs).eq("id", id)
      : await supabase.from("publications").insert({ ...champs, auteur_id: user!.id });
    if (error) return { erreur: error.message };
    revalidatePath("/gestion/publications");
    revalidatePath("/informations/actualites");
    return {
      ok: statut === "publiee" ? (champs.public ? "Publié sur le site." : "Annonce interne publiée.")
        : statut === "soumise" ? "Publication soumise au Directeur Général pour validation." : "Brouillon enregistré.",
    };
  } catch (e) { return echec(e); }
}

export async function validerPublication(id: string) {
  const { supabase } = await assertGestion("publications", ["dg"]);
  await supabase.from("publications").update({ statut: "publiee", motif_refus: null }).eq("id", id);
  revalidatePath("/gestion/publications");
  revalidatePath("/informations/actualites");
}

export async function refuserPublication(_: Etat, fd: FormData): Promise<Etat> {
  try {
    const { supabase } = await assertGestion("publications", ["dg"]);
    const { error } = await supabase.from("publications").update({ statut: "refusee", motif_refus: tn(fd, "motif_refus") }).eq("id", t(fd, "id"));
    if (error) return { erreur: error.message };
    revalidatePath("/gestion/publications");
    return { ok: "Publication refusée ; l'auteur est notifié." };
  } catch (e) { return echec(e); }
}

export async function supprimerPublication(id: string) {
  const { supabase } = await assertGestion("publications");
  await supabase.from("publications").delete().eq("id", id);
  revalidatePath("/gestion/publications");
  revalidatePath("/informations/actualites");
}

/* =============================================
   ANNONCES AUX GROUPES (messages)
   ============================================= */
export async function envoyerMessage(_: Etat, fd: FormData): Promise<Etat> {
  try {
    const { supabase, user, profil } = await assertGestion("messages");
    const destinataire = t(fd, "destinataire");
    const sujet = t(fd, "sujet");
    const contenu = t(fd, "contenu");
    if (!destinataire || !sujet || !contenu) return { erreur: "Destinataire, sujet et message obligatoires." };
    const [type, valeur] = destinataire.split(":");
    const ligne: Record<string, string> = type === "role"
      ? { expediteur_id: user!.id, cible_role: valeur, sujet, contenu }
      : { expediteur_id: user!.id, destinataire_id: valeur, sujet, contenu };
    const { error } = await supabase.from("messages").insert(ligne);
    if (error) return { erreur: error.message };
    revalidatePath("/gestion/messages");

    // Copie par e-mail : le destinataire peut répondre directement à l'expéditeur
    if (fd.get("par_email") !== "on") return { ok: `Message envoyé par ${nomComplet(profil)}.` };
    if (!process.env.RESEND_API_KEY) return { ok: "Message envoyé dans les espaces (e-mail non configuré sur le serveur)." };
    const adresses = (type === "role" ? await emailsDesRoles([valeur]) : await emailsDesProfils([valeur])).filter((a) => a !== profil?.email);
    const envoyes = await envoyerEmail(
      adresses,
      `${sujet} — ${nomComplet(profil)}, CeFoPExD`,
      `Message de ${nomComplet(profil)} (${profil?.role === "dg" ? "Directeur Général" : roleLabel(profil?.role ?? "")}) :

${contenu}

— Pour répondre, répondez simplement à cet e-mail ou écrivez depuis votre espace CeFoPExD.`,
      "/mon-espace/messages",
      profil?.email ?? undefined,
    );
    return envoyes === adresses.length
      ? { ok: `Message envoyé dans les espaces et par e-mail à ${envoyes} personne(s).` }
      : { ok: `Message envoyé dans les espaces. E-mails : ${envoyes} envoyé(s) sur ${adresses.length}.` };
  } catch (e) { return echec(e); }
}

/* =============================================
   RAPPORTS (soumis au DG, avec pièces jointes ; non modifiables ensuite)
   ============================================= */
export async function soumettreRapport(_: Etat, fd: FormData): Promise<Etat> {
  try {
    const { supabase, user, profil } = await assertGestion("rapports");
    const titre = t(fd, "titre");
    const contenu = t(fd, "contenu");
    if (!titre || !contenu) return { erreur: "Titre et contenu obligatoires." };
    const { data: rapport, error } = await supabase.from("rapports").insert({ auteur_id: user!.id, titre, periode: tn(fd, "periode"), contenu }).select("id").single();
    if (error) return { erreur: error.message };
    const fichiers = lireFichiers(fd.entries(), user!.id);
    if (fichiers.length) {
      await supabase.from("documents").insert(versDocuments(fichiers.map((f) => ({ ...f, categorie: "rapport" })), { rapport_id: rapport.id }));
    }
    await notifierParEmail(["dg"], `Nouveau rapport : ${titre}`, `${nomComplet(profil)} vous a soumis un rapport${t(fd, "periode") ? ` (${t(fd, "periode")})` : ""}${fichiers.length ? ` avec ${fichiers.length} pièce(s) jointe(s)` : ""}.`, "/gestion/rapports");
    revalidatePath("/gestion/rapports");
    return { ok: "Rapport soumis au Directeur Général." };
  } catch (e) { return echec(e); }
}

export async function traiterRapport(_: Etat, fd: FormData): Promise<Etat> {
  try {
    const { supabase } = await assertGestion("rapports", ["dg"]);
    const { error } = await supabase.from("rapports").update({ statut: t(fd, "statut") || "lu", commentaire_dg: tn(fd, "commentaire_dg") }).eq("id", t(fd, "id"));
    if (error) return { erreur: error.message };
    revalidatePath("/gestion/rapports");
    return { ok: "Rapport mis à jour." };
  } catch (e) { return echec(e); }
}

/* =============================================
   DEMANDES : permission, absence, retard (secrétariat ; le DG peut revoir)
   ============================================= */
export async function traiterDemande(_: Etat, fd: FormData): Promise<Etat> {
  try {
    const { supabase } = await assertGestion("demandes", ["dg", "secretaire"]);
    const statut = t(fd, "decision");
    if (!["approuvee", "refusee"].includes(statut)) return { erreur: "Choisissez accepter ou refuser." };
    const { error } = await supabase.from("demandes").update({ statut, reponse: tn(fd, "reponse") }).eq("id", t(fd, "id"));
    if (error) return { erreur: error.message };
    revalidatePath("/gestion/demandes");
    return { ok: statut === "approuvee" ? "Demande acceptée : la famille est notifiée et la présence mise à jour." : "Demande refusée : la famille est notifiée." };
  } catch (e) { return echec(e); }
}

/* =============================================
   COMPTES DES RESPONSABLES (créés par le DG : e-mail + mot de passe)
   ============================================= */
function motDePasseProvisoire() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const octets = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(octets, (o) => alphabet.at(o % alphabet.length)).join("");
}

export async function creerResponsable(_: Etat, fd: FormData): Promise<Etat> {
  try {
    const { supabase, profil } = await assertGestion("comptes", ["dg"]);
    const admin = adminClient();
    if (!admin) return { erreur: MESSAGE_CLE_MANQUANTE };
    const email = t(fd, "email").toLowerCase();
    const role = t(fd, "role");
    const nom = t(fd, "nom");
    const prenom = t(fd, "prenom");
    const pseudo = t(fd, "pseudo").toLowerCase();
    if (!email || !nom || !prenom) return { erreur: "Nom, prénom et e-mail obligatoires." };
    if (!ROLES_RESPONSABLES.includes(role as never)) return { erreur: "Rôle invalide." };
    if (pseudo && !/^[a-z0-9._]{3,30}$/.test(pseudo)) return { erreur: "Pseudo : 3 à 30 caractères (lettres, chiffres, point, tiret bas)." };
    const motDePasse = t(fd, "mot_de_passe") || motDePasseProvisoire();
    if (motDePasse.length < 8) return { erreur: "Le mot de passe doit contenir au moins 8 caractères." };

    const { data: cree, error } = await admin.auth.admin.createUser({
      email, password: motDePasse, email_confirm: true, user_metadata: { given_name: prenom, family_name: nom },
    });
    if (error || !cree.user) return { erreur: error?.message.includes("already") ? "Un compte existe déjà avec cet e-mail : attribuez-lui un rôle dans la liste ci-dessous." : error?.message ?? "Création impossible." };

    // Le profil est créé par la base ; le DG lui attribue rôle et accès (date et heure de validation enregistrées)
    const { error: errProfil } = await supabase.from("profils").update({
      nom, prenom, role, statut: "valide", profil_complet: true, telephone: tn(fd, "telephone"),
      type_demandeur: "administration", motif: `Compte ${role} créé par le Directeur Général`,
      ...(pseudo ? { pseudo } : {}),
    }).eq("id", cree.user.id);
    if (errProfil) return { erreur: "Compte créé, mais profil incomplet : " + errProfil.message };

    await admin.from("notifications").insert({
      destinataire_id: cree.user.id,
      titre: "Bienvenue dans l'espace de gestion du CeFoPExD",
      message: `Votre compte a été créé par ${nomComplet(profil)}. Pensez à changer votre mot de passe dans « Mon espace ».`,
      lien: "/gestion",
    });
    await envoyerEmail([email], "Votre accès à l'espace de gestion du CeFoPExD",
      `Bonjour ${prenom},\n\nLe Directeur Général vous a ouvert un accès à l'espace de gestion du CeFoPExD.\n\nIdentifiant : ${email}${pseudo ? ` (ou le pseudo « ${pseudo} »)` : ""}\nMot de passe provisoire : ${motDePasse}\n\nConnectez-vous sur www.cefopexd.com/connexion (rubrique « Personnel du centre »), puis changez votre mot de passe dans « Mon espace ».`,
      "/connexion");
    revalidatePath("/gestion/comptes");
    return { ok: `Compte créé pour ${prenom} ${nom}. Identifiant : ${email}${pseudo ? ` ou ${pseudo}` : ""} — mot de passe provisoire : ${motDePasse} (transmettez-le en main propre si l'e-mail n'est pas configuré).` };
  } catch (e) { return echec(e); }
}

export async function reinitialiserMotDePasse(_: Etat, fd: FormData): Promise<Etat> {
  try {
    await assertGestion("comptes", ["dg"]);
    const admin = adminClient();
    if (!admin) return { erreur: MESSAGE_CLE_MANQUANTE };
    const motDePasse = motDePasseProvisoire();
    const { error } = await admin.auth.admin.updateUserById(t(fd, "id"), { password: motDePasse });
    if (error) return { erreur: error.message };
    return { ok: `Nouveau mot de passe provisoire : ${motDePasse}` };
  } catch (e) { return echec(e); }
}

/* DG : vérifie que l'envoi d'e-mails fonctionne (e-mail de test à sa propre adresse) */
export async function envoyerEmailTest(_: Etat, _fd: FormData): Promise<Etat> {
  try {
    const { profil } = await assertGestion("messages", ["dg"]);
    if (!process.env.RESEND_API_KEY) return { erreur: "RESEND_API_KEY n'est pas configurée sur Vercel." };
    if (!profil?.email) return { erreur: "Aucune adresse e-mail sur votre profil." };
    const envoyes = await envoyerEmail([profil.email], "Test d'envoi — CeFoPExD", `Bonjour ${nomComplet(profil)},\n\nCet e-mail confirme que le site CeFoPExD peut envoyer des e-mails aux membres.`, "/gestion/messages");
    return envoyes
      ? { ok: `E-mail de test envoyé à ${profil.email}. Vérifiez votre boîte de réception (et les spams).` }
      : { erreur: "L'envoi a échoué : vérifiez que le domaine cefopexd.com est « Verified » dans Resend." };
  } catch (e) { return echec(e); }
}
