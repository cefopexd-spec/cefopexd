"use client";

import { useState } from "react";
import FileUpload from "./FileUpload";
import { CATEGORIES_DOCUMENT, DOCUMENTS_PAR_TYPE, TYPES_DEMANDEUR } from "@/lib/roles";

/* « Qui êtes-vous ? » + les documents à joindre selon la réponse */
export default function TypeEtDocuments({ defaut }: { defaut?: string | null }) {
  const [type, setType] = useState(defaut ?? "");
  const documents = DOCUMENTS_PAR_TYPE[type] ?? [];

  return (
    <>
      <label className="field">
        <span>Vous êtes<em> *</em></span>
        <select name="type_demandeur" required value={type} onChange={(e) => setType(e.target.value)}>
          <option value="" disabled>— Choisir —</option>
          {TYPES_DEMANDEUR.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </label>
      {documents.length > 0 && (
        <div className="field-full upload-group">
          <p className="field-hint">Documents à joindre pour ce type de demande (PDF, Word ou photo, 10 Mo maximum) :</p>
          <div className="upload-grid">
            {documents.map((d) => (
              <FileUpload key={`${type}-${d.categorie}`} label={CATEGORIES_DOCUMENT[d.categorie]} categorie={d.categorie} required={d.requis} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
