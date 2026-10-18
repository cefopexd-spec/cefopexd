"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle, FileText, Loader2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* =============================================
   DÉPÔT DE FICHIER (photo d'identité ou document)
   Le fichier part directement dans le stockage privé Supabase, dans le dossier
   de l'utilisateur ; le formulaire reçoit ensuite sa référence (champ caché).
   ============================================= */
const LIMITES = { photos: 5, documents: 10 }; // Mo
const TYPES = {
  photos: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
  documents: ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif",
    "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

export type FichierDepose = { bucket: "photos" | "documents"; chemin: string; nom: string; taille: number; type: string; categorie: string };

export default function FileUpload({
  label,
  categorie,
  bucket = "documents",
  required,
  hint,
  dossier,
  onUploaded,
}: {
  label: string;
  categorie: string;
  bucket?: "photos" | "documents";
  required?: boolean;
  hint?: string;
  dossier?: string;
  onUploaded?: (f: FichierDepose) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const obligatoire = useRef<HTMLInputElement>(null);
  const [fichier, setFichier] = useState<FichierDepose | null>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [etat, setEtat] = useState<"vide" | "envoi" | "ok" | "erreur">("vide");
  const [erreur, setErreur] = useState("");

  // Message affiché par le navigateur tant que le fichier obligatoire manque
  useEffect(() => {
    obligatoire.current?.setCustomValidity(fichier ? "" : `${label} : fichier obligatoire`);
  }, [fichier, label]);

  const choisir = async (file: File | undefined) => {
    if (!file) return;
    setErreur("");
    if (!TYPES[bucket].includes(file.type)) {
      setEtat("erreur");
      setErreur(bucket === "photos" ? "Choisissez une image (JPG, PNG, WEBP ou HEIC)." : "Format accepté : PDF, Word ou image.");
      return;
    }
    if (file.size > LIMITES[bucket] * 1024 * 1024) {
      setEtat("erreur");
      setErreur(`Fichier trop lourd : ${LIMITES[bucket]} Mo maximum.`);
      return;
    }
    setEtat("envoi");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Connectez-vous pour déposer un fichier.");
      const nomPropre = file.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
      const chemin = `${user.id}/${dossier ? `${dossier}/` : ""}${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${nomPropre}`;
      const { error } = await supabase.storage.from(bucket).upload(chemin, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const depot: FichierDepose = { bucket, chemin, nom: file.name, taille: file.size, type: file.type, categorie };
      setFichier(depot);
      setApercu(bucket === "photos" ? URL.createObjectURL(file) : null);
      setEtat("ok");
      onUploaded?.(depot);
    } catch (e) {
      setEtat("erreur");
      setErreur(e instanceof Error ? e.message : "Envoi impossible. Réessayez.");
    }
  };

  const retirer = () => {
    setFichier(null);
    setApercu(null);
    setEtat("vide");
    if (input.current) input.current.value = "";
  };

  return (
    <div className={`upload ${bucket === "photos" ? "upload-photo" : ""}`}>
      <span className="upload-label">{label}{required && <em> *</em>}</span>
      <div className="upload-zone">
        {apercu ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={apercu} alt="Aperçu de la photo" className="upload-preview" />
        ) : (
          <span className="upload-ico">{etat === "ok" ? <FileText size={22} /> : <Upload size={22} />}</span>
        )}
        <div className="upload-info">
          {etat === "envoi" && <span className="upload-status"><Loader2 size={15} className="spin" /> Envoi en cours…</span>}
          {etat === "ok" && fichier && <span className="upload-status is-ok"><CheckCircle size={15} /> {fichier.nom}</span>}
          {etat === "erreur" && <span className="upload-status is-ko">{erreur}</span>}
          {(etat === "vide" || etat === "erreur") && hint && <span className="upload-hint">{hint}</span>}
          <div className="upload-actions">
            <label htmlFor={id} className="btn-hero-ghost btn-sm upload-btn">
              {etat === "ok" ? "Remplacer" : bucket === "photos" ? "Choisir ou prendre une photo" : "Choisir un fichier"}
            </label>
            {etat === "ok" && (
              <button type="button" className="g-link-btn" onClick={retirer}><X size={14} /> Retirer</button>
            )}
          </div>
        </div>
      </div>
      <input
        ref={input}
        id={id}
        type="file"
        className="upload-input"
        accept={TYPES[bucket].join(",")}
        capture={bucket === "photos" ? "user" : undefined}
        onChange={(e) => choisir(e.target.files?.[0])}
      />
      {/* Référence du fichier transmise avec le formulaire */}
      <input type="hidden" name={`fichier:${categorie}`} value={fichier ? JSON.stringify(fichier) : ""} />
      {required && (
        <input ref={obligatoire} className="upload-required" tabIndex={-1} aria-hidden="true" required value={fichier ? "ok" : ""} onChange={() => {}} />
      )}
    </div>
  );
}
