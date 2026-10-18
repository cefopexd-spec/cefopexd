"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import type { EtatFormulaire } from "../mon-compte/actions";

const texte = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

/* Connexion du personnel : e-mail OU pseudo + mot de passe (comptes créés par le DG) */
export async function seConnecterPersonnel(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const identifiant = texte(fd, "identifiant").toLowerCase();
  const motDePasse = String(fd.get("mot_de_passe") ?? "");
  const next = texte(fd, "next");
  if (!identifiant || !motDePasse) return { erreur: "Indiquez votre e-mail (ou pseudo) et votre mot de passe." };

  let email = identifiant;
  if (!identifiant.includes("@")) {
    // Pseudo : on retrouve l'e-mail correspondant côté serveur
    const admin = adminClient();
    if (!admin) return { erreur: "Connexion par pseudo indisponible pour le moment : utilisez votre adresse e-mail." };
    const { data } = await admin.from("profils").select("email").eq("pseudo", identifiant).maybeSingle();
    if (!data) return { erreur: "Identifiant ou mot de passe incorrect." };
    email = data.email;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
  if (error) return { erreur: "Identifiant ou mot de passe incorrect." };

  // Le personnel arrive sur son espace de gestion
  redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/gestion");
}
