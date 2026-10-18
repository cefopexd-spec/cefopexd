"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertGestion, nomComplet } from "@/lib/session";
import { ROLES, SECTIONS_GESTION } from "@/lib/roles";
import { notifierParEmail } from "@/lib/email";

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
  }).select("id").single();
  if (errApp || !apprenant) throw new Error("Création de l'apprenant impossible : " + errApp?.message);

  await supabase.from("inscriptions").update({ statut: "valide", apprenant_id: apprenant.id }).eq("id", id);

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
   PUBLICATIONS (site public ou annonces internes)
   ============================================= */
export async function enregistrerPublication(_: Etat, fd: FormData): Promise<Etat> {
  try {
    const { supabase, user } = await assertGestion("publications");
    const id = t(fd, "id");
    const champs = {
      titre: t(fd, "titre"),
      resume: tn(fd, "resume"),
      contenu: t(fd, "contenu"),
      categorie: t(fd, "categorie") || "actualite",
      public: fd.get("public") === "on",
      cible: t(fd, "cible") || "tous",
      date_evenement: tn(fd, "date_evenement"),
      image_url: tn(fd, "image_url"),
      publie: fd.get("publie") === "on",
    };
    if (!champs.titre || !champs.contenu) return { erreur: "Titre et contenu obligatoires." };
    const { error } = id
      ? await supabase.from("publications").update(champs).eq("id", id)
      : await supabase.from("publications").insert({ ...champs, auteur_id: user!.id });
    if (error) return { erreur: error.message };
    revalidatePath("/gestion/publications");
    revalidatePath("/informations/actualites");
    revalidatePath("/");
    return { ok: champs.publie ? (champs.public ? "Publié sur le site." : "Annonce interne publiée.") : "Brouillon enregistré." };
  } catch (e) { return echec(e); }
}

export async function supprimerPublication(id: string) {
  const { supabase } = await assertGestion("publications");
  await supabase.from("publications").delete().eq("id", id);
  revalidatePath("/gestion/publications");
  revalidatePath("/informations/actualites");
}

/* =============================================
   MESSAGES
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
    return { ok: `Message envoyé par ${nomComplet(profil)}.` };
  } catch (e) { return echec(e); }
}

/* =============================================
   RAPPORTS (soumis au DG)
   ============================================= */
export async function soumettreRapport(_: Etat, fd: FormData): Promise<Etat> {
  try {
    const { supabase, user, profil } = await assertGestion("rapports");
    const titre = t(fd, "titre");
    const contenu = t(fd, "contenu");
    if (!titre || !contenu) return { erreur: "Titre et contenu obligatoires." };
    const { error } = await supabase.from("rapports").insert({ auteur_id: user!.id, titre, periode: tn(fd, "periode"), contenu });
    if (error) return { erreur: error.message };
    await notifierParEmail(["dg"], `Nouveau rapport : ${titre}`, `${nomComplet(profil)} vous a soumis un rapport${t(fd, "periode") ? ` (${t(fd, "periode")})` : ""}.`, "/gestion/rapports");
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
