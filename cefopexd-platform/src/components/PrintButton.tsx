"use client";

import { Printer } from "lucide-react";

/* Ouvre la boîte d'impression : choisir « Enregistrer au format PDF » pour obtenir le fichier */
export default function PrintButton({ label = "Imprimer / Enregistrer en PDF" }: { label?: string }) {
  return (
    <button type="button" className="btn-hero-primary btn-sm no-print" onClick={() => window.print()}>
      <Printer size={16} /> {label}
    </button>
  );
}
