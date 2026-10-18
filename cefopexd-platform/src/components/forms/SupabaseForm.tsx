"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle, AlertCircle, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { FichierDepose } from "./FileUpload";
import { CONTACT } from "@/lib/site-content";

/* =============================================
   FORMULAIRE ENREGISTRÉ DANS UNE TABLE SUPABASE
   Les politiques RLS autorisent l'insertion publique (anon)
   sur les tables inscriptions et contacts, sans lecture.
   ============================================= */
export default function SupabaseForm({
  table,
  submitLabel,
  successTitle,
  successText,
  nextSteps,
  apresEnvoi,
  children,
}: {
  table: "inscriptions" | "contacts";
  submitLabel: string;
  successTitle: string;
  successText: string;
  nextSteps?: string[];
  /** Server Action appelée après l'enregistrement (ex. e-mail au personnel) */
  apresEnvoi?: (id: string) => Promise<void>;
  children: ReactNode;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [receipt, setReceipt] = useState<{ ref: string; nom: string } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");

    // Champs vides -> null ; la case de consentement n'est pas stockée ;
    // les fichiers déposés (« fichier:<catégorie> ») sont traités à part
    const data: Record<string, string | null> = {};
    const fichiers: FichierDepose[] = [];
    new FormData(form).forEach((value, key) => {
      if (key === "consentement") return;
      const v = String(value).trim();
      if (key.startsWith("fichier:")) {
        if (v) fichiers.push(JSON.parse(v) as FichierDepose);
        return;
      }
      data[key] = v === "" ? null : v;
    });

    // L'identifiant est généré ici pour pouvoir afficher une référence
    // (la lecture de la table n'est pas autorisée au public)
    const id = crypto.randomUUID();

    try {
      const supabase = createClient();
      const photo = fichiers.find((f) => f.categorie === "photo");
      const { error } = await supabase.from(table).insert({ id, ...data, ...(photo && table === "inscriptions" ? { photo_path: photo.chemin } : {}) });
      if (error) throw error;
      if (fichiers.length && table === "inscriptions") {
        const { error: errDocs } = await supabase.from("documents").insert(
          fichiers.map((f) => ({
            categorie: f.categorie, bucket: f.bucket, chemin: f.chemin, nom_fichier: f.nom,
            taille: f.taille, type_mime: f.type, titre: f.nom, inscription_id: id,
          }))
        );
        if (errDocs) console.error("Documents non enregistrés :", errDocs.message);
      }
      form.reset();
      setReceipt({
        ref: `${table === "inscriptions" ? "INS" : "MSG"}-${id.slice(0, 8).toUpperCase()}`,
        nom: [data.prenom, data.nom].filter(Boolean).join(" "),
      });
      setStatus("sent");
      apresEnvoi?.(id).catch(() => {});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Envoi du formulaire impossible :", err);
      setStatus("error");
    }
  };

  if (status === "sent" && receipt) {
    return (
      <div className="form-success" role="status">
        <CheckCircle size={44} />
        <h2>{successTitle}</h2>
        <p>
          {receipt.nom && <>Merci {receipt.nom}. </>}
          {successText}
        </p>
        <div className="form-receipt">
          <span>Votre numéro de référence</span>
          <strong>{receipt.ref}</strong>
          <small>Conservez-le : il vous sera demandé lors de votre passage au centre.</small>
        </div>
        {nextSteps && (
          <ol className="form-next">
            {nextSteps.map((step, i) => (
              <li key={step}><span>{i + 1}</span>{step}</li>
            ))}
          </ol>
        )}
        <div className="form-success-actions">
          {table === "inscriptions" && (
            <a href="/mon-espace" className="btn-hero-primary">Suivre ma demande dans « Mon espace »</a>
          )}
          <a
            href={`${CONTACT.whatsapp}?text=${encodeURIComponent(`Bonjour, je viens d'envoyer une demande au CeFoPExD (référence ${receipt.ref}).`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-btn"
          >
            Prévenir le centre sur WhatsApp
          </a>
          <button type="button" className="btn-hero-ghost" onClick={() => setStatus("idle")}>
            Envoyer une autre demande
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="site-form" onSubmit={handleSubmit}>
      {children}

      {status === "error" && (
        <div className="form-error" role="alert">
          <AlertCircle size={18} />
          <span>
            L&#39;envoi a échoué. Réessayez dans un instant, ou contactez-nous directement au{" "}
            <a href={`tel:${CONTACT.telephones[0].replace(/\s/g, "")}`}>{CONTACT.telephones[0]}</a>.
          </span>
        </div>
      )}

      <button type="submit" className="btn-hero-primary form-submit" disabled={status === "sending"}>
        {status === "sending" ? "Envoi en cours…" : submitLabel}
        <Send size={17} />
      </button>
    </form>
  );
}

/* Champ libellé + saisie */
export function Field({
  label,
  name,
  required,
  type = "text",
  placeholder,
  autoComplete,
  defaultValue,
  readOnly,
  hint,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
  readOnly?: boolean;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}{required && <em> *</em>}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        readOnly={readOnly}
      />
      {hint && <small className="field-hint">{hint}</small>}
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  values,
  required,
  defaultLabel,
  defaultValue = "",
}: {
  label: string;
  name: string;
  options: string[];
  values?: string[];
  required?: boolean;
  defaultLabel: string;
  defaultValue?: string;
}) {
  return (
    <label className="field">
      <span>{label}{required && <em> *</em>}</span>
      <select name={name} required={required} defaultValue={defaultValue}>
        <option value="" disabled>{defaultLabel}</option>
        {options.map((o, i) => <option key={o} value={values?.[i] ?? o}>{o}</option>)}
      </select>
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  required,
  placeholder,
  defaultValue,
  rows = 5,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <label className="field field-full">
      <span>{label}{required && <em> *</em>}</span>
      <textarea name={name} required={required} rows={rows} placeholder={placeholder} defaultValue={defaultValue} />
    </label>
  );
}
