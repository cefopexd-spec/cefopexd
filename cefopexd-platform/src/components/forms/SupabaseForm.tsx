"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle, AlertCircle, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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
  children,
}: {
  table: "inscriptions" | "contacts";
  submitLabel: string;
  successTitle: string;
  successText: string;
  children: ReactNode;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");

    // Champs vides -> null ; la case de consentement n'est pas stockée
    const data: Record<string, string | null> = {};
    new FormData(form).forEach((value, key) => {
      if (key === "consentement") return;
      const v = String(value).trim();
      data[key] = v === "" ? null : v;
    });

    try {
      const supabase = createClient();
      const { error } = await supabase.from(table).insert(data);
      if (error) throw error;
      form.reset();
      setStatus("sent");
    } catch (err) {
      console.error("Envoi du formulaire impossible :", err);
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="form-success" role="status">
        <CheckCircle size={40} />
        <h2>{successTitle}</h2>
        <p>{successText}</p>
        <button type="button" className="btn-hero-ghost" onClick={() => setStatus("idle")}>
          Envoyer une autre demande
        </button>
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
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="field">
      <span>{label}{required && <em> *</em>}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} autoComplete={autoComplete} />
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  required,
  defaultLabel,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  defaultLabel: string;
}) {
  return (
    <label className="field">
      <span>{label}{required && <em> *</em>}</span>
      <select name={name} required={required} defaultValue="">
        <option value="" disabled>{defaultLabel}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export function TextAreaField({ label, name, required, placeholder }: { label: string; name: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="field field-full">
      <span>{label}{required && <em> *</em>}</span>
      <textarea name={name} required={required} rows={5} placeholder={placeholder} />
    </label>
  );
}
