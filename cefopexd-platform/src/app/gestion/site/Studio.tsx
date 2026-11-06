"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Eye, History, ImageIcon, Loader2, RotateCcw, Rocket, Save, Undo2 } from "lucide-react";
import { Icone } from "@/lib/site/icones";
import type { SiteConfig } from "@/lib/site/types";
import { Champs, StudioContexte } from "./Editeur";
import Mediatheque from "./Mediatheque";
import { ONGLETS } from "./schema";
import { abandonnerBrouillon, enregistrerBrouillon, publierSite, restaurerVersion, type EtatStudio } from "./actions";

export type Version = { id: number; note: string | null; publie_le: string; auteur: string };

const dateHeure = (d: string | null) =>
  d ? new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lome" }) : "jamais";

/* Page du site public correspondant à chaque onglet (pour l'aperçu) */
const PAGE_APERCU: Record<string, string> = {
  formulaires: "/contact",
  pages: "/a-propos",
  filieres: "/filieres",
  directeur: "/a-propos/mot-du-dg",
  contact: "/contact",
};

/* =============================================
   STUDIO CeFoPExD — constructeur du site
   ============================================= */
export default function Studio({
  initial,
  defaut,
  brouillonLe,
  publieLe,
  versions,
  baseManquante,
  enAttente,
}: {
  initial: SiteConfig;
  defaut: SiteConfig;
  brouillonLe: string | null;
  publieLe: string | null;
  versions: Version[];
  baseManquante: boolean;
  enAttente: boolean;
}) {
  const [config, setConfig] = useState<SiteConfig>(initial);
  const [reference, setReference] = useState(() => JSON.stringify(initial));
  const [onglet, setOnglet] = useState<string>(ONGLETS[0].cle);
  const [message, setMessage] = useState<EtatStudio | null>(null);
  const [dates, setDates] = useState({ brouillon: brouillonLe, publie: publieLe });
  const [nonPublie, setNonPublie] = useState(enAttente);
  const [mediatheque, setMediatheque] = useState<((url: string) => void) | null>(null);
  const [enCours, demarrer] = useTransition();
  const [action, setAction] = useState("");
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const modifie = useMemo(() => JSON.stringify(config) !== reference, [config, reference]);

  // Avertit avant de quitter la page avec des modifications non enregistrées
  useEffect(() => {
    const avant = (e: BeforeUnloadEvent) => {
      if (modifie) e.preventDefault();
    };
    window.addEventListener("beforeunload", avant);
    return () => window.removeEventListener("beforeunload", avant);
  }, [modifie]);

  const appliquer = useCallback((r: EtatStudio, publie = false) => {
    setMessage(r);
    if (r.donnees) {
      setConfig(r.donnees);
      setReference(JSON.stringify(r.donnees));
    }
    if (r.le) setDates((d) => ({ brouillon: r.le!, publie: publie ? r.le! : d.publie }));
    if (r.ok) setNonPublie(!publie);
  }, []);

  const sauver = useCallback(
    (ensuite?: () => void) => {
      setAction("sauver");
      demarrer(async () => {
        const r = await enregistrerBrouillon(configRef.current);
        appliquer(r);
        if (r.ok) ensuite?.();
      });
    },
    [appliquer]
  );

  // Ctrl+S / Cmd+S : enregistrer le brouillon
  useEffect(() => {
    const clavier = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        sauver();
      }
    };
    window.addEventListener("keydown", clavier);
    return () => window.removeEventListener("keydown", clavier);
  }, [sauver]);

  const publier = () => {
    const note = prompt("Publier le site maintenant ?\nToutes les modifications seront visibles immédiatement sur le site officiel.\n\nNote (facultatif) : qu'avez-vous modifié ?", "");
    if (note === null) return;
    setAction("publier");
    demarrer(async () => appliquer(await publierSite(configRef.current, note), true));
  };

  const apercu = () => {
    const page = PAGE_APERCU[onglet] ?? "/";
    // La fenêtre est ouverte tout de suite (sinon le navigateur la bloque), puis dirigée vers l'aperçu
    const fenetre = window.open("about:blank", "_blank");
    sauver(() => {
      const url = `/api/apercu?page=${encodeURIComponent(page)}`;
      if (fenetre) fenetre.location.href = url;
      else window.location.href = url;
    });
  };

  const restaurer = (v: Version) => {
    if (modifie && !confirm("Vos modifications non enregistrées seront perdues. Continuer ?")) return;
    setAction("restaurer");
    demarrer(async () => appliquer(await restaurerVersion(v.id)));
  };

  const abandonner = () => {
    if (!confirm("Abandonner le brouillon et repartir de la version actuellement en ligne ?")) return;
    setAction("abandonner");
    demarrer(async () => appliquer(await abandonnerBrouillon()));
  };

  const reinitialiserOnglet = () => {
    const def = ONGLETS.find((o) => o.cle === onglet);
    if (!def || !confirm(`Remettre « ${def.l} » comme à l'origine ? (Rien n'est perdu tant que vous n'enregistrez pas.)`)) return;
    setConfig((c) => ({ ...c, [onglet]: structuredClone(defaut[onglet as keyof SiteConfig]) }));
  };

  // Liens proposés dans les champs « lien » : toutes les pages du site
  const liensSite = useMemo(() => {
    const l = new Set<string>(["/", "/contact", "/inscription/formulaire", "/informations/actualites", "/connexion", "/mon-espace"]);
    for (const p of config.pages) {
      l.add(`/${p.slug}`);
      for (const sp of p.sousPages ?? []) l.add(`/${p.slug}/${sp.slug}`);
    }
    for (const f of config.filieres) l.add(`/filieres/${f.slug}`);
    return [...l];
  }, [config.pages, config.filieres]);

  const def = ONGLETS.find((o) => o.cle === onglet);
  const valeurOnglet = def ? config[def.cle as keyof SiteConfig] : null;

  return (
    <StudioContexte.Provider value={{ ouvrirMediatheque: (choisir) => setMediatheque(() => choisir) }}>
      <datalist id="st-liens-site">
        {liensSite.map((l) => <option key={l} value={l} />)}
      </datalist>

      <div className="st-barre">
        <div className="st-etat">
          {modifie ? (
            <span className="st-pastille is-modif"><AlertTriangle size={14} /> Modifications non enregistrées</span>
          ) : nonPublie ? (
            <span className="st-pastille is-brouillon"><Save size={14} /> Brouillon enregistré, non publié</span>
          ) : (
            <span className="st-pastille is-ok"><CheckCircle2 size={14} /> Le site en ligne est à jour</span>
          )}
          <small>Brouillon : {dateHeure(dates.brouillon)} · En ligne : {dateHeure(dates.publie)}</small>
        </div>
        <div className="st-barre-actions">
          <button type="button" className="st-btn" onClick={() => sauver()} disabled={enCours || !modifie} title="Ctrl + S">
            {enCours && action === "sauver" ? <Loader2 size={15} className="spin" /> : <Save size={15} />} Enregistrer
          </button>
          <button type="button" className="st-btn" onClick={apercu} disabled={enCours}>
            <Eye size={15} /> Aperçu
          </button>
          <button type="button" className="st-btn st-btn-publier" onClick={publier} disabled={enCours}>
            {enCours && action === "publier" ? <Loader2 size={15} className="spin" /> : <Rocket size={15} />} Publier sur le site
          </button>
        </div>
      </div>

      {baseManquante && (
        <p className="st-erreur">
          La base de données n&#39;a pas encore reçu la mise à jour du Studio (fichier <code>supabase/migrations/20261106090000_studio_site.sql</code>).
          Vous pouvez tout préparer, mais l&#39;enregistrement et la publication seront possibles une fois cette mise à jour appliquée.
        </p>
      )}
      {message && <p className={message.erreur ? "st-erreur" : "st-succes"} role="status">{message.erreur ?? message.ok}</p>}

      <div className="st-layout">
        <nav className="st-onglets" aria-label="Parties du site">
          {ONGLETS.map((o) => (
            <button key={o.cle} type="button" className={onglet === o.cle ? "is-active" : ""} onClick={() => setOnglet(o.cle)}>
              <Icone nom={o.icone} size={16} /> {o.l}
            </button>
          ))}
          <span className="st-onglets-sep" />
          <button type="button" className={onglet === "medias" ? "is-active" : ""} onClick={() => setOnglet("medias")}>
            <ImageIcon size={16} /> Médiathèque
          </button>
          <button type="button" className={onglet === "historique" ? "is-active" : ""} onClick={() => setOnglet("historique")}>
            <History size={16} /> Historique & publication
          </button>
        </nav>

        <section className="st-panneau">
          {def && (
            <>
              <div className="st-panneau-tete">
                <div>
                  <h2>{def.l}</h2>
                  <p>{def.aide}</p>
                </div>
                <button type="button" className="st-btn st-btn-lien" onClick={reinitialiserOnglet}>
                  <RotateCcw size={14} /> Revenir à l&#39;original
                </button>
              </div>
              <Champs
                champs={def.champs}
                valeur={valeurOnglet}
                onChange={(v) => setConfig((c) => ({ ...c, [def.cle]: v }))}
              />
            </>
          )}

          {onglet === "medias" && <Mediatheque integre />}

          {onglet === "historique" && (
            <div>
              <div className="st-panneau-tete">
                <div>
                  <h2>Historique & publication</h2>
                  <p>Chaque publication est conservée. Vous pouvez recharger une ancienne version dans le brouillon, puis la republier.</p>
                </div>
                <button type="button" className="st-btn" onClick={abandonner} disabled={enCours}>
                  <Undo2 size={14} /> Abandonner le brouillon
                </button>
              </div>
              {versions.length === 0 ? (
                <p className="st-note">Aucune publication pour l&#39;instant. Le site affiche le contenu d&#39;origine.</p>
              ) : (
                <table className="g-table g-table-compact">
                  <thead><tr><th>Publié le</th><th>Par</th><th>Note</th><th /></tr></thead>
                  <tbody>
                    {versions.map((v, i) => (
                      <tr key={v.id}>
                        <td>{dateHeure(v.publie_le)} {i === 0 && <span className="statut is-ok">en ligne</span>}</td>
                        <td>{v.auteur}</td>
                        <td>{v.note ?? "—"}</td>
                        <td><button type="button" className="st-btn st-btn-lien" onClick={() => restaurer(v)} disabled={enCours}>Recharger</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </section>
      </div>

      {mediatheque && (
        <Mediatheque
          choisir={(url) => {
            mediatheque(url);
            setMediatheque(null);
          }}
          fermer={() => setMediatheque(null)}
        />
      )}
    </StudioContexte.Provider>
  );
}
