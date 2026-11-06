"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Loader2, Trash2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* =============================================
   MÉDIATHÈQUE DU SITE
   Images publiques stockées dans Supabase (bucket « site ») + images d'origine du site.
   ============================================= */
const IMAGES_ORIGINE = [
  "/logo-cefopexd.png",
  "/logo-mark.png",
  "/images/campus-cefopexd.jpg",
  "/images/batiment-cefopexd.jpg",
  "/images/eleves-cefopexd.jpg",
  "/images/filiere-informatique.jpg",
  "/images/filiere-mecatronique-atelier.jpg",
  "/images/filiere-agro.jpg",
  "/images/filiere-energie.jpg",
];
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/x-icon", "application/pdf"];
const LIMITE_MO = 10;

const nomPropre = (nom: string) =>
  nom.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");

type Media = { nom: string; url: string; taille?: number };

export default function Mediatheque({ choisir, fermer, integre }: { choisir?: (url: string) => void; fermer?: () => void; integre?: boolean }) {
  const [medias, setMedias] = useState<Media[]>([]);
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [copie, setCopie] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("site").list("", { limit: 500, sortBy: { column: "created_at", order: "desc" } });
    if (error) setErreur("Médiathèque indisponible : " + error.message + " (la mise à jour de la base Supabase a-t-elle été appliquée ?)");
    setMedias(
      (data ?? [])
        .filter((f) => f.name && !f.name.startsWith("."))
        .map((f) => ({ nom: f.name, url: supabase.storage.from("site").getPublicUrl(f.name).data.publicUrl, taille: (f.metadata as { size?: number } | null)?.size }))
    );
    setChargement(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    charger();
  }, [charger]);

  const envoyer = async (fichiers: FileList | null) => {
    if (!fichiers?.length) return;
    setErreur("");
    setEnvoi(true);
    const supabase = createClient();
    for (const f of Array.from(fichiers)) {
      if (!TYPES.includes(f.type)) { setErreur(`${f.name} : format non accepté (JPG, PNG, WebP, GIF, AVIF, ICO ou PDF).`); continue; }
      if (f.size > LIMITE_MO * 1024 * 1024) { setErreur(`${f.name} : fichier trop lourd (${LIMITE_MO} Mo maximum).`); continue; }
      const chemin = `${Date.now()}-${nomPropre(f.name) || "image"}`;
      const { error } = await supabase.storage.from("site").upload(chemin, f, { contentType: f.type, cacheControl: "31536000", upsert: false });
      if (error) setErreur(`${f.name} : ${error.message}`);
    }
    setEnvoi(false);
    if (input.current) input.current.value = "";
    charger();
  };

  const supprimer = async (m: Media) => {
    if (!confirm(`Supprimer définitivement « ${m.nom} » ? Les pages qui utilisent cette image ne l'afficheront plus.`)) return;
    const supabase = createClient();
    const { error } = await supabase.storage.from("site").remove([m.nom]);
    if (error) setErreur(error.message);
    charger();
  };

  const copier = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopie(url);
      setTimeout(() => setCopie(""), 1500);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  const grille = (liste: Media[], supprimable: boolean) => (
    <div className="st-media-grille">
      {liste.map((m) => (
        <figure key={m.url} className="st-media">
          <button type="button" className="st-media-img" onClick={() => choisir?.(m.url)} disabled={!choisir} title={choisir ? "Choisir cette image" : m.nom}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {m.nom.endsWith(".pdf") ? <span className="st-media-pdf">PDF</span> : <img src={m.url} alt={m.nom} loading="lazy" />}
          </button>
          <figcaption>
            <span title={m.nom}>{m.nom}</span>
            <span className="st-mini-actions">
              <button type="button" title="Copier le lien" onClick={() => copier(m.url)}>{copie === m.url ? <Check size={13} /> : <Copy size={13} />}</button>
              {supprimable && <button type="button" title="Supprimer" className="is-danger" onClick={() => supprimer(m)}><Trash2 size={13} /></button>}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );

  const contenu = (
    <div className="st-mediatheque">
      <div className="st-media-tete">
        <div>
          <h2>Médiathèque</h2>
          <p>{choisir ? "Cliquez sur une image pour la choisir, ou envoyez-en une nouvelle." : "Toutes les images du site. Envoyez vos photos ici, puis choisissez-les dans les autres onglets."}</p>
        </div>
        {fermer && <button type="button" className="st-btn" onClick={fermer} aria-label="Fermer"><X size={16} /></button>}
      </div>

      <label className="st-depot">
        <input ref={input} type="file" accept={TYPES.join(",")} multiple onChange={(e) => envoyer(e.target.files)} disabled={envoi} />
        {envoi ? <Loader2 size={20} className="spin" /> : <Upload size={20} />}
        <span><strong>{envoi ? "Envoi en cours…" : "Envoyer des images"}</strong> depuis l&#39;ordinateur ou le téléphone (JPG, PNG, WebP — {LIMITE_MO} Mo max.)</span>
      </label>
      {erreur && <p className="st-erreur">{erreur}</p>}

      <h3>Vos images envoyées</h3>
      {chargement ? <p className="st-note"><Loader2 size={14} className="spin" /> Chargement…</p> : medias.length ? grille(medias, true) : <p className="st-note">Aucune image envoyée pour l&#39;instant.</p>}

      <h3>Images d&#39;origine du site</h3>
      {grille(IMAGES_ORIGINE.map((u) => ({ nom: u.split("/").pop() ?? u, url: u })), false)}
    </div>
  );

  if (integre) return contenu;
  return (
    <div className="st-modale" role="dialog" aria-modal="true" aria-label="Médiathèque" onClick={(e) => e.target === e.currentTarget && fermer?.()}>
      <div className="st-modale-boite">{contenu}</div>
    </div>
  );
}
