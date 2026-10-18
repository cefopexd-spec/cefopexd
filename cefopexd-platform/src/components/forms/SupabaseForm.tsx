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
  nextSteps,
  children,
}: {
  table: "inscriptions" | "contacts";
  submitLabel: string;
  successTitle: string;
  successText: string;
  nextSteps?: string[];
  children: ReactNode;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [receipt, setReceipt] = useState<{ ref: string; nom: string } | null>(null);

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

    // L'identifiant est généré ici pour pouvoir afficher une référence
    // (la lecture de la table n'est pas autorisée au public)
    const id = crypto.randomUUID();

    try {
      const supabase = createClient();
      const { error } = await supabase.from(table).insert({ id, ...data });
      if (error) throw error;
      form.reset();
      setReceipt({
        ref: `${table === "inscriptions" ? "INS" : "MSG"}-${id.slice(0, 8).toUpperCase()}`,
        nom: [data.prenom, data.nom].filter(Boolean).join(" "),
      });
      setStatus("sent");
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
