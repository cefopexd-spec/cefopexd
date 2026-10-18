"use client";

import { useActionState, type ReactNode } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

/* =============================================
   FORMULAIRE RELIÉ À UNE SERVER ACTION
   Affiche l'erreur ou la confirmation renvoyée par l'action.
   ============================================= */
type Etat = { erreur?: string; ok?: string };

export default function ActionForm({
  action,
  children,
  submitLabel,
  className = "site-form",
  submitClassName = "btn-hero-primary form-submit",
}: {
  action: (etat: Etat, fd: FormData) => Promise<Etat>;
  children: ReactNode;
  submitLabel: string;
  className?: string;
  submitClassName?: string;
}) {
  const [etat, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className={className}>
      {children}
      {etat.erreur && (
        <div className="form-error" role="alert"><AlertCircle size={18} /><span>{etat.erreur}</span></div>
      )}
      {etat.ok && (
        <div className="form-ok" role="status"><CheckCircle size={18} /><span>{etat.ok}</span></div>
      )}
      <button type="submit" className={submitClassName} disabled={pending}>
        {pending ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}
