"use client";

import { createContext, useContext, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Copy, Eye, EyeOff, ImageIcon, Plus, Trash2 } from "lucide-react";
import { ICONES, Icone } from "@/lib/site/icones";
import { POLICES } from "@/components/ThemeSite";
import { LIBELLES_COULEURS, SECTIONS_ACCUEIL, THEMES, TYPES_BLOCS, type Champ } from "./schema";

/* =============================================
   ÉDITEUR GÉNÉRIQUE DU STUDIO
   Affiche le bon contrôle pour chaque type de champ décrit dans schema.ts
   ============================================= */
type Valeur = unknown;
type Objet = Record<string, unknown>;

export const StudioContexte = createContext<{ ouvrirMediatheque: (choisir: (url: string) => void) => void }>({
  ouvrirMediatheque: () => {},
});

const lire = (obj: Valeur, k: string): Valeur => (k === "" ? obj : (obj as Objet | undefined)?.[k]);
const ecrire = (obj: Valeur, k: string, v: Valeur): Valeur => (k === "" ? v : { ...((obj as Objet) ?? {}), [k]: v });
const cloner = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export function Champs({ champs, valeur, onChange }: { champs: Champ[]; valeur: Valeur; onChange: (v: Valeur) => void }) {
  return (
    <div className="st-champs">
      {champs.map((c, i) =>
        c.t === "note" ? (
          <p key={i} className="st-note">{c.texte}</p>
        ) : (
          <ChampVue key={`${c.k}-${i}`} champ={c} valeur={lire(valeur, c.k)} parent={valeur} onChange={(v) => onChange(ecrire(valeur, c.k, v))} />
        )
      )}
    </div>
  );
}

function Libelle({ texte, aide }: { texte: string; aide?: string }) {
  return (
    <span className="st-libelle">
      {texte}
      {aide && <small>{aide}</small>}
    </span>
  );
}

function ChampVue({ champ, valeur, parent, onChange }: { champ: Exclude<Champ, { t: "note" }>; valeur: Valeur; parent: Valeur; onChange: (v: Valeur) => void }) {
  const { ouvrirMediatheque } = useContext(StudioContexte);
  const aide = "aide" in champ ? champ.aide : undefined;

  switch (champ.t) {
    case "texte":
      return (
        <label className="st-champ">
          <Libelle texte={champ.l} aide={aide} />
          <input
            type="text"
            value={String(valeur ?? "")}
            placeholder={champ.ph}
            list={champ.k === "href" || champ.l.toLowerCase().startsWith("lien") ? "st-liens-site" : undefined}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      );

    case "zone":
      return (
        <label className="st-champ">
          <Libelle texte={champ.l} aide={aide} />
          <textarea rows={champ.lignes ?? 3} value={String(valeur ?? "")} onChange={(e) => onChange(e.target.value)} />
        </label>
      );

    case "nombre":
      return (
        <label className="st-champ st-champ-court">
          <Libelle texte={champ.l} aide={aide} />
          <input type="number" min={champ.min} max={champ.max} value={Number(valeur ?? 0)} onChange={(e) => onChange(Number(e.target.value))} />
        </label>
      );

    case "oui":
      return (
        <label className="st-interrupteur">
          <input type="checkbox" checked={valeur !== false} onChange={(e) => onChange(e.target.checked)} />
          <span className="st-bascule" aria-hidden="true" />
          <Libelle texte={champ.l} aide={aide} />
        </label>
      );

    case "couleur":
      return <ChampCouleur libelle={champ.l} valeur={String(valeur ?? "")} onChange={onChange} />;

    case "image": {
      const url = String(valeur ?? "");
      return (
        <div className="st-champ">
          <Libelle texte={champ.l} aide={aide} />
          <div className="st-image">
            <div className="st-image-apercu">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {url ? <img src={url} alt="" /> : <ImageIcon size={22} />}
            </div>
            <div className="st-image-actions">
              <input type="text" value={url} placeholder="/images/… ou https://…" onChange={(e) => onChange(e.target.value)} />
              <div>
                <button type="button" className="st-btn" onClick={() => ouvrirMediatheque((u) => onChange(u))}>
                  <ImageIcon size={14} /> Choisir / envoyer une image
                </button>
                {url && <button type="button" className="st-btn st-btn-lien" onClick={() => onChange("")}>Retirer</button>}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "icone":
      return (
        <label className="st-champ st-champ-court">
          <Libelle texte={champ.l} />
          <span className="st-icone">
            <span className="st-icone-apercu">{valeur ? <Icone nom={String(valeur)} size={18} /> : "—"}</span>
            <select value={String(valeur ?? "")} onChange={(e) => onChange(e.target.value)}>
              <option value="">— Aucune —</option>
              {Object.entries(ICONES).map(([nom, { label }]) => <option key={nom} value={nom}>{label}</option>)}
            </select>
          </span>
        </label>
      );

    case "choix":
      return (
        <label className="st-champ st-champ-court">
          <Libelle texte={champ.l} />
          <select value={String(valeur ?? "")} onChange={(e) => onChange(e.target.value)}>
            {champ.options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </label>
      );

    case "police":
      return (
        <label className="st-champ st-champ-court">
          <Libelle texte={champ.l} />
          <select value={String(valeur ?? "")} onChange={(e) => onChange(e.target.value)} style={{ fontFamily: String(valeur ?? "") }}>
            {Object.keys(POLICES).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
      );

    case "lien": {
      const l = (valeur as { label?: string; href?: string } | undefined) ?? {};
      return (
        <fieldset className="st-groupe st-groupe-lien">
          <legend>{champ.l}</legend>
          <div className="st-ligne">
            <label className="st-champ"><Libelle texte="Texte" /><input type="text" value={l.label ?? ""} onChange={(e) => onChange({ ...l, label: e.target.value })} /></label>
            <label className="st-champ"><Libelle texte="Lien" /><input type="text" list="st-liens-site" value={l.href ?? ""} onChange={(e) => onChange({ ...l, href: e.target.value })} /></label>
          </div>
        </fieldset>
      );
    }

    case "textes":
      return <ListeTextes champ={champ} valeur={(valeur as string[] | undefined) ?? []} onChange={onChange} />;

    case "groupe":
      return <Groupe titre={champ.l} aide={aide}><Champs champs={champ.champs} valeur={valeur ?? {}} onChange={onChange} /></Groupe>;

    case "liste":
      return (
        <Liste
          titre={champ.l}
          aide={aide}
          ajout={champ.ajout}
          valeur={(valeur as Objet[] | undefined) ?? []}
          titreItem={(item, i) => String((champ.titreItem && item[champ.titreItem]) || `Élément ${i + 1}`)}
          nouveau={() => cloner(champ.nouveau)}
          onChange={onChange}
          rendu={(item, maj) => <Champs champs={champ.champs} valeur={item} onChange={(v) => maj(v as Objet)} />}
        />
      );

    case "blocs":
      return <Blocs titre={champ.l} aide={aide} valeur={(valeur as Objet[] | undefined) ?? []} onChange={onChange} />;

    case "ordre":
      return <Ordre valeur={(valeur as string[] | undefined) ?? []} parent={parent as Objet} onChange={onChange} />;

    case "couleurs":
      return <Couleurs valeur={(valeur as Record<string, string> | undefined) ?? {}} onChange={onChange} />;
  }
}

/* ---------- Couleur ---------- */
function ChampCouleur({ libelle, valeur, onChange }: { libelle: string; valeur: string; onChange: (v: string) => void }) {
  const hex = /^#[0-9a-f]{6}$/i.test(valeur) ? valeur : "#000000";
  return (
    <label className="st-champ st-champ-court">
      <Libelle texte={libelle} />
      <span className="st-couleur">
        <input type="color" value={hex} onChange={(e) => onChange(e.target.value.toUpperCase())} aria-label={libelle} />
        <input type="text" value={valeur} placeholder="#0A1FE8" onChange={(e) => onChange(e.target.value)} />
      </span>
    </label>
  );
}

function Couleurs({ valeur, onChange }: { valeur: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  return (
    <div className="st-champ">
      <Libelle texte="Thèmes prêts à l'emploi" aide="Un clic applique toutes les couleurs du thème ; vous pouvez ensuite ajuster chaque couleur." />
      <div className="st-themes">
        {THEMES.map((t) => (
          <button key={t.nom} type="button" className="st-theme" onClick={() => onChange({ ...valeur, ...t.couleurs })}>
            <span className="st-theme-pastilles">
              {["primary", "primary-dark", "accent", "green", "highlight"].map((c) => <i key={c} style={{ background: t.couleurs[c] }} />)}
            </span>
            {t.nom}
          </button>
        ))}
      </div>
      <div className="st-grille-couleurs">
        {Object.keys(LIBELLES_COULEURS).map((cle) => (
          <ChampCouleur key={cle} libelle={LIBELLES_COULEURS[cle]} valeur={valeur[cle] ?? ""} onChange={(v) => onChange({ ...valeur, [cle]: v })} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Groupe repliable ---------- */
function Groupe({ titre, aide, children }: { titre: string; aide?: string; children: React.ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <div className={`st-groupe ${ouvert ? "is-open" : ""}`}>
      <button type="button" className="st-groupe-tete" onClick={() => setOuvert((o) => !o)} aria-expanded={ouvert}>
        {ouvert ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <strong>{titre}</strong>
      </button>
      {ouvert && (
        <div className="st-groupe-corps">
          {aide && <p className="st-note">{aide}</p>}
          {children}
        </div>
      )}
    </div>
  );
}

/* ---------- Liste de textes ---------- */
function ListeTextes({ champ, valeur, onChange }: { champ: Extract<Champ, { t: "textes" }>; valeur: string[]; onChange: (v: string[]) => void }) {
  const maj = (i: number, v: string) => onChange(valeur.map((x, j) => (j === i ? v : x)));
  return (
    <div className="st-champ">
      <Libelle texte={champ.l} aide={champ.aide} />
      <div className="st-textes">
        {valeur.map((texte, i) => (
          <div key={i} className="st-texte-ligne">
            {champ.long ? (
              <textarea rows={3} value={texte} onChange={(e) => maj(i, e.target.value)} />
            ) : (
              <input type="text" value={texte} onChange={(e) => maj(i, e.target.value)} />
            )}
            <div className="st-mini-actions">
              <button type="button" title="Monter" disabled={i === 0} onClick={() => onChange(deplacer(valeur, i, -1))}><ArrowUp size={14} /></button>
              <button type="button" title="Descendre" disabled={i === valeur.length - 1} onClick={() => onChange(deplacer(valeur, i, 1))}><ArrowDown size={14} /></button>
              <button type="button" title="Supprimer" className="is-danger" onClick={() => onChange(valeur.filter((_, j) => j !== i))}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        <button type="button" className="st-btn st-btn-ajout" onClick={() => onChange([...valeur, ""])}>
          <Plus size={14} /> {champ.ajout ?? "Ajouter"}
        </button>
      </div>
    </div>
  );
}

function deplacer<T>(liste: T[], i: number, sens: number) {
  const j = i + sens;
  if (j < 0 || j >= liste.length) return liste;
  const copie = [...liste];
  [copie[i], copie[j]] = [copie[j], copie[i]];
  return copie;
}

/* ---------- Liste d'éléments (réordonnable, repliable) ---------- */
function Liste({
  titre, aide, ajout, valeur, titreItem, nouveau, onChange, rendu, entete,
}: {
  titre: string;
  aide?: string;
  ajout?: string;
  valeur: Objet[];
  titreItem: (item: Objet, i: number) => string;
  nouveau: () => Objet;
  onChange: (v: Objet[]) => void;
  rendu: (item: Objet, maj: (v: Objet) => void) => React.ReactNode;
  entete?: React.ReactNode;
}) {
  const [ouvert, setOuvert] = useState<number | null>(null);
  const maj = (i: number, v: Objet) => onChange(valeur.map((x, j) => (j === i ? v : x)));

  return (
    <div className="st-liste">
      <div className="st-liste-tete">
        <Libelle texte={titre} aide={aide} />
        <span className="st-compte">{valeur.length}</span>
      </div>
      {valeur.map((item, i) => {
        const masque = item && typeof item === "object" && "visible" in item && item.visible === false;
        return (
          <div key={i} className={`st-item ${ouvert === i ? "is-open" : ""} ${masque ? "is-masque" : ""}`}>
            <div className="st-item-tete">
              <button type="button" className="st-item-titre" onClick={() => setOuvert(ouvert === i ? null : i)} aria-expanded={ouvert === i}>
                {ouvert === i ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                <span>{titreItem(item, i)}</span>
                {masque && <em>masqué</em>}
              </button>
              <div className="st-mini-actions">
                {item && typeof item === "object" && "visible" in item && (
                  <button type="button" title={masque ? "Afficher" : "Masquer"} onClick={() => maj(i, { ...item, visible: masque })}>
                    {masque ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                )}
                <button type="button" title="Monter" disabled={i === 0} onClick={() => { onChange(deplacer(valeur, i, -1)); setOuvert(null); }}><ArrowUp size={14} /></button>
                <button type="button" title="Descendre" disabled={i === valeur.length - 1} onClick={() => { onChange(deplacer(valeur, i, 1)); setOuvert(null); }}><ArrowDown size={14} /></button>
                <button type="button" title="Dupliquer" onClick={() => onChange([...valeur.slice(0, i + 1), cloner(item), ...valeur.slice(i + 1)])}><Copy size={14} /></button>
                <button
                  type="button"
                  title="Supprimer"
                  className="is-danger"
                  onClick={() => {
                    if (confirm(`Supprimer « ${titreItem(item, i)} » ?`)) {
                      onChange(valeur.filter((_, j) => j !== i));
                      setOuvert(null);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {ouvert === i && <div className="st-item-corps">{rendu(item, (v) => maj(i, v))}</div>}
          </div>
        );
      })}
      {entete ?? (
        <button type="button" className="st-btn st-btn-ajout" onClick={() => { onChange([...valeur, nouveau()]); setOuvert(valeur.length); }}>
          <Plus size={14} /> {ajout ?? "Ajouter"}
        </button>
      )}
    </div>
  );
}

/* ---------- Blocs de contenu ---------- */
function Blocs({ titre, aide, valeur, onChange }: { titre: string; aide?: string; valeur: Objet[]; onChange: (v: Objet[]) => void }) {
  const [type, setType] = useState("text");
  return (
    <Liste
      titre={titre}
      aide={aide ?? "Composez la page avec des blocs : texte, listes, cartes, images, vidéos, boutons…"}
      valeur={valeur}
      titreItem={(b) => {
        const def = TYPES_BLOCS[String(b.type)];
        const sous = (b.title || b.titre || b.legende || "") as string;
        return `${def?.l ?? String(b.type)}${sous ? ` — ${sous}` : ""}`;
      }}
      nouveau={() => cloner(TYPES_BLOCS[type].nouveau)}
      onChange={onChange}
      rendu={(bloc, maj) => {
        const def = TYPES_BLOCS[String(bloc.type)];
        if (!def) return <p className="st-note">Type de bloc inconnu.</p>;
        return (
          <>
            <p className="st-note">{def.aide}</p>
            {def.champs.length > 0 && <Champs champs={def.champs} valeur={bloc} onChange={(v) => maj(v as Objet)} />}
          </>
        );
      }}
      entete={
        <div className="st-ajout-bloc">
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Type de bloc à ajouter">
            {Object.entries(TYPES_BLOCS).map(([k, d]) => <option key={k} value={k}>{d.l}</option>)}
          </select>
          <button type="button" className="st-btn st-btn-ajout" onClick={() => onChange([...valeur, cloner(TYPES_BLOCS[type].nouveau)])}>
            <Plus size={14} /> Ajouter ce bloc
          </button>
        </div>
      }
    />
  );
}

/* ---------- Ordre des sections de l'accueil ---------- */
function Ordre({ valeur, parent, onChange }: { valeur: string[]; parent: Objet; onChange: (v: string[]) => void }) {
  const perso = ((parent?.sectionsPerso as { cle: string; titre: string }[] | undefined) ?? []).filter((s) => s.cle);
  const libelle = (cle: string) =>
    cle.startsWith("perso:") ? `Section personnalisée — ${perso.find((p) => p.cle === cle.slice(6))?.titre ?? cle.slice(6)}` : SECTIONS_ACCUEIL[cle] ?? cle;
  const disponibles = [...Object.keys(SECTIONS_ACCUEIL), ...perso.map((p) => `perso:${p.cle}`)].filter((c) => !valeur.includes(c));

  return (
    <div className="st-champ">
      <Libelle texte="Ordre des sections de la page d'accueil" aide="Montez ou descendez les sections. Retirez une section pour la cacher entièrement." />
      <ol className="st-ordre">
        {valeur.map((cle, i) => (
          <li key={cle}>
            <span className="st-ordre-num">{i + 1}</span>
            <span className="st-ordre-nom">{libelle(cle)}</span>
            <div className="st-mini-actions">
              <button type="button" title="Monter" disabled={i === 0} onClick={() => onChange(deplacer(valeur, i, -1))}><ArrowUp size={14} /></button>
              <button type="button" title="Descendre" disabled={i === valeur.length - 1} onClick={() => onChange(deplacer(valeur, i, 1))}><ArrowDown size={14} /></button>
              <button type="button" title="Retirer de la page" className="is-danger" onClick={() => onChange(valeur.filter((c) => c !== cle))}><Trash2 size={14} /></button>
            </div>
          </li>
        ))}
      </ol>
      {disponibles.length > 0 && (
        <div className="st-ordre-ajout">
          {disponibles.map((cle) => (
            <button key={cle} type="button" className="st-btn st-btn-ajout" onClick={() => onChange([...valeur, cle])}>
              <Plus size={14} /> {libelle(cle)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
