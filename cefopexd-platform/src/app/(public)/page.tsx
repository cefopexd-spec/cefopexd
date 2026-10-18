"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CHIFFRES, DIRECTEUR } from "@/lib/site-content";
import {
  Monitor, Settings, Leaf,
  Sun, Languages, Wrench, CheckCircle, Award,
  Building2, Handshake, TrendingUp, ArrowRight,
  Users, BookOpen, Percent, Star, PenLine, CalendarDays, Quote
} from "lucide-react";

/* =============================================
   DONNÉES : SLIDES DU HERO
   ============================================= */
const HERO_SLIDES = [
  {
    id: 1,
    image: "/images/campus-cefopexd.jpg",
    alt: "Vue aérienne du campus du CeFoPExD à Dévikinmé",
    caption: "Le campus de Dévikinmé",
    pretitle: "BIENVENUE AU CeFoPExD",
    title: "Votre avenir professionnel",
    accent: "commence ici !",
    subtitle:
      "Le Centre de Formation Professionnelle d'Excellence de Dévikinmé vous offre une formation de qualité, adaptée aux besoins du marché de l'emploi et aux défis de demain.",
  },
  {
    id: 2,
    image: "/images/eleves-cefopexd.jpg",
    alt: "Élèves du CeFoPExD en séance de formation",
    caption: "Nos apprenants en séance",
    pretitle: "EXCELLENCE & INNOVATION",
    title: "Des formations pour créer",
    accent: "l'emploi de demain",
    subtitle:
      "Nous formons des cadres capables de créer de l'emploi dans leur domaine de formation. L'excellence et l'intégrité sont au cœur de notre pédagogie.",
  },
  {
    id: 3,
    image: "/images/batiment-cefopexd.jpg",
    alt: "Bâtiment de formation du CeFoPExD",
    caption: "Nos bâtiments de formation",
    pretitle: "6 FILIÈRES D'EXCELLENCE",
    title: "Informatique, Mécatronique,",
    accent: "Énergie et plus encore",
    subtitle:
      "De l'informatique appliquée à l'énergie renouvelable, en passant par l'agro-alimentaire et la langue allemande, trouvez la filière qui correspond à vos ambitions.",
  },
];

/* =============================================
   DONNÉES : ATOUTS
   ============================================= */
const ATOUTS = [
  { icon: Award, label: "Formations qualifiantes", desc: "Des compétences pour réussir" },
  { icon: Users, label: "Encadrement professionnel", desc: "Une équipe pédagogique expérimentée" },
  { icon: Building2, label: "Infrastructures modernes", desc: "Des équipements à la pointe" },
  { icon: Handshake, label: "Partenariats solides", desc: "Avec les entreprises et institutions" },
  { icon: TrendingUp, label: "Insertion professionnelle", desc: "Un tremplin vers l'emploi" },
];

/* =============================================
   DONNÉES : FILIÈRES
   ============================================= */
const FILIERES = [
  {
    slug: "informatique",
    icon: Monitor,
    color: "var(--logo-blue)",
    text: "var(--primary)",
    title: "Informatique appliquée",
    desc: "Développez vos compétences en programmation, réseaux, bases de données et bureautique.",
    image: "/images/filiere-informatique.jpg",
  },
  {
    slug: "mecatronique",
    icon: Settings,
    color: "var(--logo-red)",
    text: "var(--accent-text)",
    title: "Mécatronique",
    desc: "Maîtrisez la mécanique, l'électronique, l'automatisme et la maintenance des équipements.",
    image: "https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=600&q=80",
  },
  {
    slug: "agro-alimentaire",
    icon: Leaf,
    color: "var(--logo-green)",
    text: "var(--secondary-text)",
    title: "Agro-alimentaire",
    desc: "Transformez et valorisez les produits agricoles dans le respect des normes sanitaires.",
    image: "/images/filiere-agro.jpg",
  },
  {
    slug: "energie-renouvelable",
    icon: Sun,
    color: "var(--logo-orange)",
    text: "var(--primary-dark)",
    title: "Énergie renouvelable",
    desc: "Formez-vous aux solutions énergétiques durables pour un avenir plus vert.",
    image: "/images/filiere-energie.jpg",
  },
  {
    slug: "langue-allemande",
    icon: Languages,
    color: "var(--logo-blue)",
    text: "var(--primary)",
    title: "Langue allemande",
    desc: "Apprenez l'allemand de A1 à B2 avec préparation aux examens certifiants.",
    image: "/images/eleves-cefopexd.jpg",
  },
  {
    slug: "formations-courtes",
    icon: Wrench,
    color: "var(--logo-green)",
    text: "var(--secondary-text)",
    title: "Formations courtes",
    desc: "Des modules courts en artisanat et informatique pour acquérir rapidement de nouvelles compétences.",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80",
  },
];

/* =============================================
   DONNÉES : ACTUALITÉS (démo)
   ============================================= */
const ACTUALITES = [
  {
    id: 1,
    titre: "Ouverture des inscriptions 2025-2026",
    date: "12 avril 2025",
    extrait: "Les inscriptions pour la nouvelle rentrée académique sont ouvertes. Ne manquez pas cette opportunité !",
    image: "/images/eleves-cefopexd.jpg",
    href: "/inscription/formulaire",
  },
  {
    id: 2,
    titre: "Journée portes ouvertes au CeFoPExD",
    date: "28 mars 2025",
    extrait: "Découvrez nos infrastructures et rencontrez notre équipe pédagogique lors de notre journée portes ouvertes.",
    image: "/images/batiment-cefopexd.jpg",
    href: "/informations/evenements",
  },
  {
    id: 3,
    titre: "Lancement de la filière Énergie renouvelable",
    date: "14 mars 2025",
    extrait: "Une nouvelle filière pour répondre aux enjeux de demain et aux besoins croissants en énergies vertes.",
    image: "/images/filiere-energie.jpg",
    href: "/filieres/energie-renouvelable",
  },
];

/* =============================================
   DONNÉES : COMPTEURS
   ============================================= */
const STATS = [
  { icon: Users,    color: "var(--secondary-text)", tint: "rgba(34,192,3,0.12)" },
  { icon: BookOpen, color: "var(--accent-text)",    tint: "rgba(248,35,3,0.10)" },
  { icon: Percent,  color: "var(--logo-blue)",      tint: "rgba(10,31,232,0.10)" },
  { icon: Star,     color: "#9A5B00",               tint: "rgba(253,166,3,0.18)" },
].map((style, i) => ({ ...style, ...CHIFFRES[i] }));

/* =============================================
   HOOK : COMPTEUR ANIMÉ
   ============================================= */
function useCountUp(target: number, duration = 2000, start = false, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    // Animations réduites : affiche directement la valeur finale
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(target);
      return;
    }
    let frame = 0;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp + delay;
      const progress = Math.min(Math.max((timestamp - startTime) / duration, 0), 1);
      // Décélération (easeOutExpo) : rapide au départ, ralentit en arrivant
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, start, delay]);
  return count;
}

/* =============================================
   COMPOSANT : STAT CARD
   ============================================= */
function StatCard({ stat, animate, index }: { stat: typeof STATS[0]; animate: boolean; index: number }) {
  const delay = index * 180;
  const count = useCountUp(stat.value, 2200, animate, delay + 250);
  const done = animate && count === stat.value;
  return (
    <div
      className={`stat-tile ${animate ? "is-visible" : ""} ${done ? "is-done" : ""}`}
      style={{ "--delay": `${delay}ms`, "--p": stat.value ? count / stat.value : 0, "--ring": stat.color } as React.CSSProperties}
    >
      <div className="stat-icon-wrap">
        <div className="stat-icon" style={{ background: stat.tint, color: stat.color }}>
          <stat.icon size={24} />
        </div>
      </div>
      <div>
        <div className="stat-value">
          <span className="stat-number">{count}</span>{stat.suffix}
        </div>
        <div className="stat-label">{stat.label}</div>
      </div>
    </div>
  );
}

/* =============================================
   PAGE D'ACCUEIL
   ============================================= */
export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const slideInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Auto-play carrousel */
  const startAutoplay = () => {
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
  };
  const stopAutoplay = () => {
    if (slideInterval.current) clearInterval(slideInterval.current);
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, []);

  const goTo = (idx: number) => {
    setCurrentSlide(idx);
    stopAutoplay();
    startAutoplay();
  };

  /* Intersection Observer pour les compteurs */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <>
      {/* =============================================
          1. HERO
          ============================================= */}
      <section className="hero" aria-label="Présentation du CeFoPExD">
        {/* Photo du campus en filigrane */}
        <div className="hero-bg" aria-hidden="true">
          <Image src="/images/campus-cefopexd.jpg" alt="" fill sizes="100vw" quality={60} style={{ objectFit: "cover" }} />
        </div>
        <div className="container hero-grid">
          {/* ---- Texte ---- */}
          <div>
            <div key={`pre-${currentSlide}`} className="hero-pretitle hero-anim">
              <span className="hero-pretitle-dot" />
              {slide.pretitle}
            </div>

            <h1 key={`title-${currentSlide}`} className="hero-anim" style={{ animationDelay: "0.08s" }}>
              <span className="hero-title">{slide.title}</span>
              <span className="hero-title-accent">{slide.accent}</span>
            </h1>

            <p key={`sub-${currentSlide}`} className="hero-subtitle hero-anim" style={{ animationDelay: "0.16s" }}>
              {slide.subtitle}
            </p>

            <div className="hero-actions">
              <Link href="/filieres" className="btn-hero-primary">
                Découvrir nos filières
                <ArrowRight size={18} />
              </Link>
              <Link href="/inscription/formulaire" className="btn-hero-red">
                <PenLine size={17} />
                S&#39;inscrire maintenant
              </Link>
            </div>

            <div className="hero-trust">
              <span><CheckCircle size={15} /> Formations qualifiantes</span>
              <span><CheckCircle size={15} /> Encadrement professionnel</span>
              <span><CheckCircle size={15} /> Insertion professionnelle</span>
            </div>
          </div>

          {/* ---- Photos réelles du centre ---- */}
          <div className="hero-photo">
            {HERO_SLIDES.map((s, i) => (
              <Image
                key={s.id}
                src={s.image}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="(max-width: 1023px) 100vw, 580px"
                quality={90}
                className={`hero-slide-img ${i === currentSlide ? "is-active" : ""}`}
              />
            ))}
            <div className="hero-caption">
              <span className="hero-caption-logo">
                <Image src="/logo-mark.png" alt="" fill sizes="28px" style={{ objectFit: "contain" }} />
              </span>
              {slide.caption}
            </div>
            <div className="hero-dots">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Aller à la photo ${i + 1}`}
                  className="hero-dot"
                  style={{
                    width: i === currentSlide ? "24px" : "8px",
                    background: i === currentSlide ? "white" : "rgba(255,255,255,0.6)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- Statistiques aux couleurs du logo ---- */}
      <div className="stats-bar" ref={statsRef}>
        <div className="container">
          <div className="stats-grid">
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} animate={statsVisible} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* =============================================
          2. BANDEAU D'ATOUTS
          ============================================= */}
      <section style={{ background: "white", padding: "0", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div className="container" style={{ padding: "0 24px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0",
          }}>
            {ATOUTS.map((atout) => (
              <div
                key={atout.label}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
                  padding: "28px 16px", textAlign: "center",
                  transition: "var(--transition)",
                  cursor: "default",
                }}
                className="atout-item"
              >
                <div style={{
                  width: "52px", height: "52px", borderRadius: "14px",
                  background: "var(--bg-soft)", display: "flex", alignItems: "center",
                  justifyContent: "center", marginBottom: "12px",
                  border: "1px solid var(--border)", transition: "var(--transition)",
                }} className="atout-icon">
                  <atout.icon size={24} color="var(--primary)" />
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.88rem", color: "var(--text)", marginBottom: "4px" }}>
                  {atout.label}
                </div>
                <div style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                  {atout.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          3. NOS FILIÈRES
          ============================================= */}
      <section className="section" style={{ background: "var(--bg-soft)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="section-label">— NOS FILIÈRES —</span>
            <h2 className="section-title">Nos filières de formation</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Choisissez la filière qui correspond à vos ambitions et construisez votre avenir avec nous.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))",
            gap: "28px"
          }}>
            {FILIERES.map((filiere) => (
              <article key={filiere.slug} className="card" style={{ position: "relative" }}>
                {/* Image */}
                <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
                  <Image
                    src={filiere.image}
                    alt={filiere.title}
                    fill
                    style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="filiere-img"
                  />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `linear-gradient(to top, rgba(0,0,0,0.5), transparent)`,
                  }} />
                  {/* Pastille icône */}
                  <div style={{
                    position: "absolute", bottom: "-20px", left: "20px",
                    width: "48px", height: "48px", borderRadius: "14px",
                    background: filiere.color, display: "flex", alignItems: "center",
                    justifyContent: "center", boxShadow: "0 6px 16px rgba(5,11,71,0.25)",
                    border: "3px solid white", zIndex: 1,
                  }}>
                    <filiere.icon size={22} color="white" />
                  </div>
                </div>

                {/* Contenu */}
                <div style={{ padding: "32px 24px 24px" }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: filiere.text, marginBottom: "10px" }}>
                    {filiere.title}
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.65, marginBottom: "20px" }}>
                    {filiere.desc}
                  </p>
                  <Link
                    href={`/filieres/${filiere.slug}`}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      color: filiere.text, fontWeight: 700, fontSize: "0.88rem",
                      textDecoration: "none", fontFamily: "var(--font-display)",
                      padding: "8px 18px", borderRadius: "var(--radius-full)",
                      border: `1.5px solid ${filiere.text}`,
                      transition: "var(--transition)",
                    }}
                    className="filiere-btn"
                  >
                    Détails <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Link href="/filieres" className="btn-primary">
              Voir toutes les filières <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =============================================
          4. À PROPOS + ACTUALITÉS
          ============================================= */}
      <section className="section" style={{ background: "white" }}>
        <div className="container about-grid">
          {/* ---- À PROPOS ---- */}
          <div>
            <span className="section-label">À propos de nous</span>
            <h2 className="section-title">Le CeFoPExD, un centre d&#39;excellence</h2>

            <div className="about-photo">
              <Image
                src="/images/campus-cefopexd.jpg"
                alt="Vue aérienne du campus du CeFoPExD"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 1023px) 100vw, 50vw"
              />
              <span className="about-photo-tag">CeFoPExD — Dévikinmé, Togo</span>
            </div>

            <p className="about-text">
              Le Centre de Formation Professionnelle d&#39;Excellence de Dévikinmé est un établissement engagé dans la formation de jeunes talents, capables de répondre aux besoins du monde professionnel et de contribuer au développement durable de notre pays.
            </p>

            {/* Vision / Mission / Valeurs : panneaux structurés */}
            <div className="vmv-grid">
              {[
                { label: "Vision", title: "Développer les compétences", desc: "Révéler le potentiel de chaque jeune par une formation exigeante.", color: "var(--primary)", tint: "rgba(10,31,232,0.07)" },
                { label: "Mission", title: "Former pour l'emploi", desc: "Des professionnels capables de créer de l'emploi, pas seulement d'en demander.", color: "var(--green-text)", tint: "rgba(34,192,3,0.09)" },
                { label: "Valeurs", title: "Excellence, intégrité, solidarité", desc: "Des principes qui guident notre pédagogie au quotidien.", color: "var(--accent-text)", tint: "rgba(248,35,3,0.07)" },
              ].map((item) => (
                <div key={item.label} className="vmv-card">
                  <span className="vmv-label" style={{ color: item.color, background: item.tint }}>{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>

            <Link href="/a-propos/presentation" className="btn-hero-primary" style={{ marginTop: "28px" }}>
              En savoir plus <ArrowRight size={16} />
            </Link>
          </div>

          {/* ---- ACTUALITÉS : panneau encadré ---- */}
          <aside className="news-panel" aria-labelledby="news-title">
            <div className="news-head">
              <div>
                <span className="section-label" style={{ marginBottom: "4px" }}>Actualités & annonces</span>
                <h2 id="news-title" className="news-title">Restez informé</h2>
              </div>
              <Link href="/informations/actualites" className="news-all">
                Voir toutes <ArrowRight size={14} />
              </Link>
            </div>

            <div className="news-list">
              {ACTUALITES.map((actu) => (
                <Link key={actu.id} href={actu.href} className="news-item">
                  <div className="news-thumb">
                    <Image src={actu.image} alt={actu.titre} fill style={{ objectFit: "cover" }} sizes="96px" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span className="news-date"><CalendarDays size={13} /> {actu.date}</span>
                    <h3>{actu.titre}</h3>
                    <p>{actu.extrait}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="news-cta">
              <div>
                <strong>Prêt à rejoindre le CeFoPExD ?</strong>
                <span>Déposez votre pré-inscription en ligne.</span>
              </div>
              <Link href="/inscription/formulaire" className="btn-hero-red btn-sm">
                S&#39;inscrire <ArrowRight size={15} />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* =============================================
          5. MOT DU DIRECTEUR GÉNÉRAL
          ============================================= */}
      <section className="section director-section">
        <div className="container director-grid">
          <div className="director-card">
            <div className="director-monogram" aria-hidden="true">BD</div>
            <div className="director-name">{DIRECTEUR.nom}</div>
            <div className="director-role">{DIRECTEUR.fonction}</div>
            <div className="director-logo">
              <Image src="/logo-cefopexd.png" alt="CeFoPExD" fill sizes="140px" style={{ objectFit: "contain" }} />
            </div>
          </div>
          <div>
            <span className="section-label">Mot du Directeur Général</span>
            <h2 className="section-title">Former aujourd&#39;hui les professionnels qui bâtiront demain</h2>
            <blockquote className="director-quote">
              <Quote size={28} aria-hidden="true" />
              <p>{DIRECTEUR.extrait}</p>
            </blockquote>
            <Link href="/a-propos/mot-du-dg" className="btn-hero-primary">
              Lire le message complet <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =============================================
          6. POURQUOI CHOISIR LE CEFOPEXD
          ============================================= */}
      <section className="section" style={{ background: "var(--bg-soft)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="section-label">Nos engagements</span>
            <h2 className="section-title">Pourquoi choisir le CeFoPExD ?</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Six engagements qui font de notre centre un tremplin vers la réussite professionnelle.
            </p>
          </div>

          <div className="why-grid">
            {[
              { title: "Formation d'excellence", desc: "Un enseignement de qualité qui fait de l'excellence sa priorité, en créant la différence pour devenir une référence.", color: "var(--primary)" },
              { title: "Insertion professionnelle", desc: "Nous formons des cadres capables de créer de l'emploi dans leur domaine, pas seulement d'en demander.", color: "var(--accent-text)" },
              { title: "Égalité des chances", desc: "Nous respectons les différences et favorisons l'égalité des chances, car la diversité est une richesse.", color: "var(--green-text)" },
              { title: "Recherche & innovation", desc: "Une place essentielle est accordée à la recherche, notamment en entrepreneuriat, pour innover et progresser.", color: "#9A5B00" },
              { title: "Adaptation continue", desc: "Nos formations sont sans cesse adaptées à l'évolution de la société et aux besoins du marché de l'emploi.", color: "var(--primary)" },
              { title: "Valeurs humaines", desc: "Paix, tolérance, intégrité et équité : nous formons des femmes et des hommes acteurs responsables de la société.", color: "var(--accent-text)" },
            ].map((item, i) => (
              <article key={item.title} className="why-card">
                <span className="why-num" style={{ color: item.color }}>{String(i + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          7. APPEL À L'ACTION FINAL
          ============================================= */}
      <section style={{ background: "white", padding: "80px 0" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <CheckCircle size={48} color="var(--green-text)" style={{ marginBottom: "20px" }} />
            <h2 className="section-title">
              Prêt à construire votre avenir avec nous ?
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.75, marginBottom: "32px" }}>
              Les inscriptions se font en présentiel au centre. Remplissez le formulaire de pré-inscription en ligne pour prendre rendez-vous avec notre équipe d'admission.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/inscription/formulaire" className="btn-hero-red">
                Pré-inscription en ligne <ArrowRight size={17} />
              </Link>
              <Link href="/contact" className="btn-hero-primary">
                Nous contacter
              </Link>
            </div>
            <div style={{ marginTop: "24px", color: "var(--muted)", fontSize: "0.88rem" }}>
              📞 +228 70 88 13 06 · +228 79 95 20 20
            </div>
          </div>
        </div>
      </section>

      {/* Styles hover */}
      <style jsx>{`
        .filiere-img { transform: scale(1); }
        .card:hover .filiere-img { transform: scale(1.05) !important; }
        .filiere-btn:hover { background: var(--bg-soft); }
      `}</style>
    </>
  );
}
