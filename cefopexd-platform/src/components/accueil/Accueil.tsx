"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, ArrowRight, CalendarDays, Quote } from "lucide-react";
import { Icone } from "@/lib/site/icones";
import { nonOptimise } from "@/lib/site/images";
import type { Bouton, FiliereSite, SiteConfig } from "@/lib/site/types";

export type Actu = { titre: string; date: string; extrait: string; image: string; href: string };

const CLASSES_BOUTON: Record<string, string> = {
  primaire: "btn-hero-primary",
  rouge: "btn-hero-red",
  contour: "btn-hero-ghost",
  jaune: "header-cta",
};

export function BoutonSite({ b, className = "" }: { b: Bouton; className?: string }) {
  return (
    <Link href={b.href || "/"} className={`${CLASSES_BOUTON[b.style ?? "primaire"] ?? "btn-hero-primary"} ${className}`}>
      {b.icone === "pen-line" && <Icone nom="pen-line" size={17} />}
      {b.label}
      {b.icone && b.icone !== "pen-line" && <Icone nom={b.icone} size={17} />}
    </Link>
  );
}

/* Teinte légère d'une couleur (#RRGGBB → rgba) pour les pastilles */
function teinte(couleur: string, alpha: number) {
  const m = /^#([0-9a-f]{6})$/i.exec(couleur.trim());
  if (!m) return "var(--bg-soft)";
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/* =============================================
   HOOK : COMPTEUR ANIMÉ
   ============================================= */
function useCountUp(target: number, duration = 2000, start = false, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let frame = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame = requestAnimationFrame(() => setCount(target));
      return () => cancelAnimationFrame(frame);
    }
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp + delay;
      const progress = Math.min(Math.max((timestamp - startTime) / duration, 0), 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, start, delay]);
  return count;
}

type Stat = SiteConfig["accueil"]["stats"]["items"][number];
function StatCard({ stat, animate, index }: { stat: Stat; animate: boolean; index: number }) {
  const delay = index * 180;
  const valeur = Number(stat.valeur) || 0;
  const count = useCountUp(valeur, 2200, animate, delay + 250);
  const done = animate && count === valeur;
  return (
    <div
      className={`stat-tile ${animate ? "is-visible" : ""} ${done ? "is-done" : ""}`}
      style={{ "--delay": `${delay}ms`, "--p": valeur ? count / valeur : 0, "--ring": stat.couleur } as React.CSSProperties}
    >
      <div className="stat-icon-wrap">
        <div className="stat-icon" style={{ background: teinte(stat.couleur, 0.12), color: stat.couleur }}>
          <Icone nom={stat.icone} size={24} />
        </div>
      </div>
      <div>
        <div className="stat-value">
          <span className="stat-number">{count}</span>{stat.suffixe}
        </div>
        <div className="stat-label">{stat.label}</div>
      </div>
    </div>
  );
}

/* =============================================
   PAGE D'ACCUEIL (toutes les sections viennent du Studio)
   ============================================= */
export default function Accueil({
  accueil,
  filieres,
  directeur,
  identite,
  actualites,
  sectionsPerso,
}: {
  accueil: SiteConfig["accueil"];
  filieres: FiliereSite[];
  directeur: SiteConfig["directeur"];
  identite: SiteConfig["identite"];
  actualites: Actu[];
  sectionsPerso: Record<string, ReactNode>;
}) {
  const slides = accueil.hero.slides.length ? accueil.hero.slides : [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const slideInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const intervalle = Math.max(Number(accueil.hero.intervalle) || 6, 2) * 1000;

  const stopAutoplay = () => {
    if (slideInterval.current) clearInterval(slideInterval.current);
  };
  const startAutoplay = () => {
    stopAutoplay();
    if (slides.length < 2) return;
    slideInterval.current = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), intervalle);
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, intervalle]);

  const goTo = (idx: number) => {
    setCurrentSlide(idx);
    startAutoplay();
  };

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const slide = slides[Math.min(currentSlide, Math.max(slides.length - 1, 0))];
  const filieresVisibles = filieres.filter((f) => f.visible !== false);

  const sections: Record<string, () => ReactNode> = {
    /* ---------- 1. HERO ---------- */
    hero: () =>
      accueil.hero.visible && slide ? (
        <section key="hero" className="hero" aria-label={`Présentation du ${identite.nom}`}>
          <div className="hero-bg" aria-hidden="true">
            <Image src={identite.imageBandeau || slide.image} unoptimized={nonOptimise(identite.imageBandeau || slide.image)} alt="" fill sizes="100vw" quality={60} style={{ objectFit: "cover" }} />
          </div>
          <div className="container hero-grid">
            <div>
              {slide.surtitre && (
                <div key={`pre-${currentSlide}`} className="hero-pretitle hero-anim">
                  <span className="hero-pretitle-dot" />
                  {slide.surtitre}
                </div>
              )}
              <h1 key={`title-${currentSlide}`} className="hero-anim" style={{ animationDelay: "0.08s" }}>
                <span className="hero-title">{slide.titre}</span>
                {slide.accent && <span className="hero-title-accent">{slide.accent}</span>}
              </h1>
              {slide.sousTitre && (
                <p key={`sub-${currentSlide}`} className="hero-subtitle hero-anim" style={{ animationDelay: "0.16s" }}>
                  {slide.sousTitre}
                </p>
              )}
              {accueil.hero.boutons.length > 0 && (
                <div className="hero-actions">
                  {accueil.hero.boutons.map((b, i) => <BoutonSite key={`${b.href}-${i}`} b={b} />)}
                </div>
              )}
              {accueil.hero.garanties.length > 0 && (
                <div className="hero-trust">
                  {accueil.hero.garanties.map((g) => <span key={g}><CheckCircle size={15} /> {g}</span>)}
                </div>
              )}
            </div>

            <div className="hero-photo">
              {slides.map((s, i) => (
                <Image
                  key={`${s.image}-${i}`}
                  src={s.image}
                  unoptimized={nonOptimise(s.image)}
                  alt={s.alt}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1023px) 100vw, 580px"
                  quality={90}
                  className={`hero-slide-img ${i === currentSlide ? "is-active" : ""}`}
                />
              ))}
              {slide.legende && (
                <div className="hero-caption">
                  <span className="hero-caption-logo">
                    <Image src={identite.logoIcone || "/logo-mark.png"} unoptimized={nonOptimise(identite.logoIcone)} alt="" fill sizes="28px" style={{ objectFit: "contain" }} />
                  </span>
                  {slide.legende}
                </div>
              )}
              {slides.length > 1 && (
                <div className="hero-dots">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      aria-label={`Aller à la photo ${i + 1}`}
                      className="hero-dot"
                      style={{ width: i === currentSlide ? "24px" : "8px", background: i === currentSlide ? "white" : "rgba(255,255,255,0.6)" }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null,

    /* ---------- Chiffres clés ---------- */
    stats: () =>
      accueil.stats.visible && accueil.stats.items.length ? (
        <div key="stats" className="stats-bar" ref={statsRef}>
          <div className="container">
            <div className="stats-grid">
              {accueil.stats.items.map((stat, i) => <StatCard key={`${stat.label}-${i}`} stat={stat} animate={statsVisible} index={i} />)}
            </div>
          </div>
        </div>
      ) : null,

    /* ---------- 2. BANDEAU D'ATOUTS ---------- */
    atouts: () =>
      accueil.atouts.visible && accueil.atouts.items.length ? (
        <section key="atouts" style={{ background: "white", padding: "0", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <div className="container" style={{ padding: "0 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0" }}>
              {accueil.atouts.items.map((atout, i) => (
                <div
                  key={`${atout.titre}-${i}`}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "28px 16px", textAlign: "center", transition: "var(--transition)", cursor: "default" }}
                  className="atout-item"
                >
                  <div
                    style={{ width: "52px", height: "52px", borderRadius: "14px", background: "var(--bg-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px", border: "1px solid var(--border)", transition: "var(--transition)" }}
                    className="atout-icon"
                  >
                    <Icone nom={atout.icone} size={24} color="var(--primary)" />
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.88rem", color: "var(--text)", marginBottom: "4px" }}>{atout.titre}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.78rem" }}>{atout.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null,

    /* ---------- 3. NOS FILIÈRES ---------- */
    filieres: () =>
      accueil.filieres.visible ? (
        <section key="filieres" className="section" style={{ background: "var(--bg-soft)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              {accueil.filieres.surtitre && <span className="section-label">{accueil.filieres.surtitre}</span>}
              <h2 className="section-title">{accueil.filieres.titre}</h2>
              {accueil.filieres.sousTitre && <p className="section-subtitle" style={{ margin: "0 auto" }}>{accueil.filieres.sousTitre}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: "28px" }}>
              {filieresVisibles.map((filiere) => (
                <article key={filiere.slug} className="card" style={{ position: "relative" }}>
                  <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
                    {filiere.image && (
                      <Image src={filiere.image} unoptimized={nonOptimise(filiere.image)} alt={filiere.titre} fill style={{ objectFit: "cover", transition: "transform 0.5s ease" }} sizes="(max-width: 768px) 100vw, 33vw" className="filiere-img" />
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }} />
                    <div
                      style={{ position: "absolute", bottom: "-20px", left: "20px", width: "48px", height: "48px", borderRadius: "14px", background: filiere.couleur, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(5,11,71,0.25)", border: "3px solid white", zIndex: 1 }}
                    >
                      <Icone nom={filiere.icone} size={22} color="white" />
                    </div>
                  </div>
                  <div style={{ padding: "32px 24px 24px" }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: filiere.couleurTexte || filiere.couleur, marginBottom: "10px" }}>{filiere.titre}</h3>
                    <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.65, marginBottom: "20px" }}>{filiere.resume}</p>
                    <Link
                      href={`/filieres/${filiere.slug}`}
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: filiere.couleurTexte || filiere.couleur, fontWeight: 700, fontSize: "0.88rem", textDecoration: "none", fontFamily: "var(--font-display)", padding: "8px 18px", borderRadius: "var(--radius-full)", border: `1.5px solid ${filiere.couleurTexte || filiere.couleur}`, transition: "var(--transition)" }}
                      className="filiere-btn"
                    >
                      {accueil.filieres.texteBoutonCarte} <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {accueil.filieres.bouton?.label && (
              <div style={{ textAlign: "center", marginTop: "40px" }}>
                <Link href={accueil.filieres.bouton.href || "/filieres"} className="btn-primary">
                  {accueil.filieres.bouton.label} <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </section>
      ) : null,

    /* ---------- 4. À PROPOS + ACTUALITÉS ---------- */
    apropos: () => {
      const { apropos } = accueil;
      const actus = accueil.actualites;
      if (!apropos.visible && !actus.visible) return null;
      return (
        <section key="apropos" className="section" style={{ background: "white" }}>
          <div className={apropos.visible && actus.visible ? "container about-grid" : "container"}>
            {apropos.visible && (
              <div>
                {apropos.surtitre && <span className="section-label">{apropos.surtitre}</span>}
                <h2 className="section-title">{apropos.titre}</h2>
                {apropos.image && (
                  <div className="about-photo">
                    <Image src={apropos.image} unoptimized={nonOptimise(apropos.image)} alt={apropos.legendeImage || apropos.titre} fill style={{ objectFit: "cover" }} sizes="(max-width: 1023px) 100vw, 50vw" />
                    {apropos.legendeImage && <span className="about-photo-tag">{apropos.legendeImage}</span>}
                  </div>
                )}
                {apropos.texte && <p className="about-text">{apropos.texte}</p>}
                {apropos.cartes.length > 0 && (
                  <div className="vmv-grid">
                    {apropos.cartes.map((item, i) => (
                      <div key={`${item.label}-${i}`} className="vmv-card">
                        <span className="vmv-label" style={{ color: item.couleur, background: teinte(item.couleur, 0.08) }}>{item.label}</span>
                        <h3>{item.titre}</h3>
                        <p>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
                {apropos.bouton?.label && (
                  <Link href={apropos.bouton.href || "/"} className="btn-hero-primary" style={{ marginTop: "28px" }}>
                    {apropos.bouton.label} <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            )}

            {actus.visible && (
              <aside className="news-panel" aria-labelledby="news-title">
                <div className="news-head">
                  <div>
                    {actus.surtitre && <span className="section-label" style={{ marginBottom: "4px" }}>{actus.surtitre}</span>}
                    <h2 id="news-title" className="news-title">{actus.titre}</h2>
                  </div>
                  {actus.texteTout && (
                    <Link href="/informations/actualites" className="news-all">
                      {actus.texteTout} <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
                <div className="news-list">
                  {actualites.map((actu, i) => (
                    <Link key={`${actu.titre}-${i}`} href={actu.href || "/informations/actualites"} className="news-item">
                      <div className="news-thumb">
                        {actu.image && <Image src={actu.image} alt={actu.titre} fill style={{ objectFit: "cover" }} sizes="96px" unoptimized={nonOptimise(actu.image)} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <span className="news-date"><CalendarDays size={13} /> {actu.date}</span>
                        <h3>{actu.titre}</h3>
                        <p>{actu.extrait}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                {actus.encartTitre && (
                  <div className="news-cta">
                    <div>
                      <strong>{actus.encartTitre}</strong>
                      <span>{actus.encartTexte}</span>
                    </div>
                    {actus.encartBouton?.label && (
                      <Link href={actus.encartBouton.href || "/"} className="btn-hero-red btn-sm">
                        {actus.encartBouton.label} <ArrowRight size={15} />
                      </Link>
                    )}
                  </div>
                )}
              </aside>
            )}
          </div>
        </section>
      );
    },

    /* ---------- 5. MOT DU DIRECTEUR GÉNÉRAL ---------- */
    directeur: () =>
      accueil.directeur.visible ? (
        <section key="directeur" className="section director-section">
          <div className="container director-grid">
            <CarteDirecteur directeur={directeur} logo={identite.logo} />
            <div>
              {accueil.directeur.surtitre && <span className="section-label">{accueil.directeur.surtitre}</span>}
              <h2 className="section-title">{accueil.directeur.titre}</h2>
              <blockquote className="director-quote">
                <Quote size={28} aria-hidden="true" />
                <p>{directeur.extrait}</p>
              </blockquote>
              {accueil.directeur.bouton?.label && (
                <Link href={accueil.directeur.bouton.href || "/"} className="btn-hero-primary">
                  {accueil.directeur.bouton.label} <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </section>
      ) : null,

    /* ---------- 6. POURQUOI CHOISIR ---------- */
    pourquoi: () =>
      accueil.pourquoi.visible ? (
        <section key="pourquoi" className="section" style={{ background: "var(--bg-soft)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              {accueil.pourquoi.surtitre && <span className="section-label">{accueil.pourquoi.surtitre}</span>}
              <h2 className="section-title">{accueil.pourquoi.titre}</h2>
              {accueil.pourquoi.sousTitre && <p className="section-subtitle" style={{ margin: "0 auto" }}>{accueil.pourquoi.sousTitre}</p>}
            </div>
            <div className="why-grid">
              {accueil.pourquoi.items.map((item, i) => (
                <article key={`${item.titre}-${i}`} className="why-card">
                  <span className="why-num" style={{ color: item.couleur }}>{String(i + 1).padStart(2, "0")}</span>
                  <h3>{item.titre}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null,

    /* ---------- 7. APPEL À L'ACTION FINAL ---------- */
    appel: () =>
      accueil.appel.visible ? (
        <section key="appel" style={{ background: "white", padding: "80px 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <div style={{ maxWidth: "640px", margin: "0 auto" }}>
              <CheckCircle size={48} color="var(--green-text)" style={{ marginBottom: "20px" }} />
              <h2 className="section-title">{accueil.appel.titre}</h2>
              {accueil.appel.texte && <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.75, marginBottom: "32px" }}>{accueil.appel.texte}</p>}
              <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                {accueil.appel.boutons.map((b, i) => <BoutonSite key={`${b.href}-${i}`} b={b} />)}
              </div>
              {accueil.appel.note && <div style={{ marginTop: "24px", color: "var(--muted)", fontSize: "0.88rem" }}>{accueil.appel.note}</div>}
            </div>
          </div>
        </section>
      ) : null,
  };

  // Les sections personnalisées sont rendues côté serveur et passées ici
  const ordre = accueil.ordre.length ? accueil.ordre : Object.keys(sections);

  return (
    <>
      {ordre.map((cle) => (cle.startsWith("perso:") ? <div key={cle} style={{ display: "contents" }}>{sectionsPerso[cle.slice(6)] ?? null}</div> : sections[cle]?.() ?? null))}
      <style jsx>{`
        :global(.filiere-img) { transform: scale(1); }
        :global(.card:hover .filiere-img) { transform: scale(1.05) !important; }
        :global(.filiere-btn:hover) { background: var(--bg-soft); }
      `}</style>
    </>
  );
}

/* Carte du Directeur Général : photo si fournie, sinon initiales */
export function CarteDirecteur({ directeur, logo }: { directeur: SiteConfig["directeur"]; logo: string }) {
  return (
    <div className="director-card">
      {directeur.photo ? (
        <div className="director-photo">
          <Image src={directeur.photo} alt={directeur.nom} fill sizes="160px" style={{ objectFit: "cover" }} unoptimized={nonOptimise(directeur.photo)} />
        </div>
      ) : (
        <div className="director-monogram" aria-hidden="true">{directeur.initiales}</div>
      )}
      <div className="director-name">{directeur.nom}</div>
      <div className="director-role">{directeur.fonction}</div>
      <div className="director-logo">
        <Image src={logo} unoptimized={nonOptimise(logo)} alt="Logo" fill sizes="140px" style={{ objectFit: "contain" }} />
      </div>
    </div>
  );
}
