"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/forms/SupabaseForm";
import { GoogleLogo } from "./GoogleButton";
import { COOKIE_IDENTITE } from "@/lib/identite";

/* =============================================
   CRÉATION DE COMPTE EN DEUX TEMPS
   1. nom, prénom, date et lieu de naissance
   2. « Continuer avec Google »
   L'identité est gardée une heure dans un cookie, puis enregistrée dans le
   profil au retour de Google (/auth/callback). La personne complète ensuite
   le reste (photo, documents, motif) dans son espace.
   ============================================= */
export default function CreationCompte({ next = "/mon-espace" }: { next?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const identite = Object.fromEntries(
      ["nom", "prenom", "date_naissance", "lieu_naissance"].map((k) => [k, String(fd.get(k) ?? "").trim().slice(0, 120)])
    );
    const naissance = new Date(identite.date_naissance);
    if (Number.isNaN(naissance.getTime()) || naissance > new Date() || naissance.getFullYear() < 1920) {
      setError("Vérifiez votre date de naissance.");
      return;
    }
    setError("");
    setLoading(true);
    document.cookie = `${COOKIE_IDENTITE}=${encodeURIComponent(JSON.stringify(identite))}; path=/; max-age=3600; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;

    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      console.error("Connexion Google impossible :", error.message);
      setError("La connexion à Google a échoué. Réessayez dans un instant.");
      setLoading(false);
    }
  };

  return (
    <form className="creation-compte" onSubmit={onSubmit}>
      <div className="form-grid">
        <Field label="Nom" name="nom" required autoComplete="family-name" />
        <Field label="Prénom(s)" name="prenom" required autoComplete="given-name" />
        <Field label="Date de naissance" name="date_naissance" type="date" required autoComplete="bday" />
        <Field label="Lieu de naissance" name="lieu_naissance" required placeholder="Ville, pays" />
      </div>
      <p className="auth-small creation-etape">
        Étape suivante : choisissez votre compte Google. Vous compléterez ensuite votre photo et vos documents dans votre espace.
      </p>
      <button type="submit" className="google-btn" disabled={loading}>
        <GoogleLogo />
        {loading ? "Redirection vers Google…" : "Créer mon compte et continuer avec Google"}
      </button>
      {error && <p className="google-error" role="alert">{error}</p>}
    </form>
  );
}
