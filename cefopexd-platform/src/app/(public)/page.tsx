"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Monitor, Settings, Leaf,
  Sun, Languages, Wrench, CheckCircle, Award,
  Building2, Handshake, TrendingUp, ArrowRight,
  Users, BookOpen, Percent, Star, GraduationCap, PenLine
} from "lucide-react";

/* =============================================
   DONNÉES : SLIDES DU HERO
   ============================================= */
const HERO_SLIDES = [
  {
    id: 1,
    image: "/images/campus-cefopexd.jpg",
    alt: "Vue aérienne du campus du CeFoPExD à Dévikinmé",
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
  },
  {
    id: 2,
    titre: "Journée portes ouvertes au CeFoPExD",
    date: "28 mars 2025",
    extrait: "Découvrez nos infrastructures et rencontrez notre équipe pédagogique lors de notre journée portes ouvertes.",
    image: "/images/batiment-cefopexd.jpg",
  },
  {
    id: 3,
    titre: "Lancement de la filière Énergie renouvelable",
    date: "14 mars 2025",
    extrait: "Une nouvelle filière pour répondre aux enjeux de demain et aux besoins croissants en énergies vertes.",
    image: "/images/filiere-energie.jpg",
  },
];

/* =============================================
   DONNÉES : COMPTEURS
   ============================================= */
const STATS = [
  { icon: Users,   value: 500,  suffix: "+", label: "Étudiants formés" },
  { icon: BookOpen, value: 6,   suffix: "",  label: "Filières d'excellence" },
  { icon: Percent, value: 85,   suffix: "%", label: "Taux d'insertion" },
  { icon: Star,    value: 12,   suffix: "+", label: "Partenaires" },
];

/* =============================================
   HOOK : COMPTEUR ANIMÉ
   ============================================= */
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

/* =============================================
   COMPOSANT : STAT CARD
   ============================================= */
function StatCard({ stat, animate }: { stat: typeof STATS[0]; animate: boolean }) {
  const count = useCountUp(stat.value, 2000, animate);
  return (
    <div style={{
      textAlign: "center",
      padding: "32px 24px",
      background: "rgba(255,255,255,0.08)",
      borderRadius: "var(--radius-lg)",
      border: "1px solid rgba(255,255,255,0.15)",
      backdropFilter: "blur(10px)",
    }}>
      <div style={{
        width: "56px", height: "56px", borderRadius: "50%",
        background: "var(--highlight)", display: "flex",
        alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px"
      }}>
        <stat.icon size={24} color="var(--ink)" />
      </div>
      <div style={{
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "2.8rem",
        color: "white",
        lineHeight: 1,
        marginBottom: "8px"
      }}>
        {count}{stat.suffix}
      </div>
      <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", fontWeight: 500 }}>
        {stat.label}
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
  const prev = () => goTo((currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const next = () => goTo((currentSlide + 1) % HERO_SLIDES.length);

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
          1. HERO CARROUSEL
          ============================================= */}
      <section className="hero" aria-label="Carrousel principal">
        {/* Fond : photo floutée de la slide en cours */}
        <div className="hero-bg" aria-hidden="true">
          <Image src={slide.image} alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
        </div>

        <div className="container hero-grid">
          {/* ---- Texte ---- */}
          <div>
            <div key={`pre-${currentSlide}`} className="hero-pretitle hero-anim">
              <span className="hero-pretitle-dot" />
              {slide.pretitle}
            </div>

            <h1 key={`title-${currentSlide}`} className="hero-title hero-anim" style={{ animationDelay: "0.08s" }}>
              {slide.title}{" "}
              <span className="hero-title-accent">{slide.accent}</span>
            </h1>

            <p key={`sub-${currentSlide}`} className="hero-subtitle hero-anim" style={{ animationDelay: "0.16s" }}>
              {slide.subtitle}
            </p>

            <div key={`btns-${currentSlide}`} className="hero-actions hero-anim" style={{ animationDelay: "0.24s" }}>
              <Link href="/filieres" className="btn-hero-primary">
                <GraduationCap size={19} />
                Découvrir nos filières
                <ArrowRight size={18} />
              </Link>
              <Link href="/inscription/formulaire" className="btn-hero-ghost">
                <PenLine size={18} />
                S&#39;inscrire maintenant
              </Link>
            </div>

            {/* Phrase manuscrite */}
            <div className="hero-script hero-anim" style={{ animationDelay: "0.32s" }}>
              Formations qualifiantes pour un avenir durable
              <svg width="230" height="14" viewBox="0 0 230 14" fill="none" aria-hidden="true">
                <path
                  d="M3 10 C 60 2, 140 2, 227 7"
                  stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray="260" style={{ animation: "draw 1.2s 0.6s ease both" }}
                />
              </svg>
            </div>
          </div>

          {/* ---- Visuel : photos réelles du centre ---- */}
          <div className="hero-visual">
            <div className="hero-frame">
              <div className="hero-frame-inner">
                {HERO_SLIDES.map((s, i) => (
                  <Image
                    key={s.id}
                    src={s.image}
                    alt={s.alt}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 960px) 92vw, 540px"
                    quality={90}
                    className={`hero-slide-img ${i === currentSlide ? "is-active" : ""}`}
                  />
                ))}
              </div>
            </div>

            {/* Badges flottants */}
            <div className="hero-badge hero-badge-logo">
              <div style={{ position: "relative", width: "128px", height: "36px" }}>
                <Image src="/logo-cefopexd.png" alt="CeFoPExD" fill sizes="128px" style={{ objectFit: "contain" }} />
              </div>
            </div>
            <div className="hero-badge hero-badge-stat">
              <div className="hero-badge-icon"><Users size={20} /></div>
              <div>
                <strong>500+</strong>
                <span>étudiants formés</span>
              </div>
            </div>

            {/* Navigation du carrousel */}
            <div className="hero-nav">
              <button onClick={prev} aria-label="Slide précédente" className="hero-arrow">
                <ChevronLeft size={20} />
              </button>
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Aller à la slide ${i + 1}`}
                  className="hero-dot"
                  style={{
                    width: i === currentSlide ? "30px" : "10px",
                    background: i === currentSlide ? "var(--logo-orange)" : "rgba(255,255,255,0.35)",
                  }}
                />
              ))}
              <button onClick={next} aria-label="Slide suivante" className="hero-arrow">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

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
            {ATOUTS.map((atout, i) => (
              <div
                key={atout.label}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  padding: "28px 16px", textAlign: "center",
                  borderRight: i < ATOUTS.length - 1 ? "1px solid var(--border)" : "none",
                  borderBottom: "3px solid transparent",
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
            <div className="orange-line orange-line-center" />
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              Choisissez la filière qui correspond à vos ambitions et construisez votre avenir avec nous.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
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
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "48px", alignItems: "start"
          }}>
            {/* ---- À PROPOS ---- */}
            <div>
              <span className="section-label">À PROPOS DE NOUS</span>
              <h2 className="section-title">Le CeFoPExD, un centre d'excellence</h2>
              <div className="orange-line" />

              {/* Photo du centre */}
              <div style={{
                position: "relative", height: "240px", borderRadius: "var(--radius-lg)",
                overflow: "hidden", marginBottom: "24px",
                boxShadow: "var(--shadow-lg)"
              }}>
                <Image
                  src="/images/campus-cefopexd.jpg"
                  alt="Vue aérienne du campus du CeFoPExD"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div style={{
                  position: "absolute", bottom: "16px", left: "16px",
                  background: "var(--primary-dark)", color: "white",
                  padding: "6px 14px", borderRadius: "var(--radius-full)",
                  fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.82rem"
                }}>
                  CeFoPExD — Lomé, Togo
                </div>
              </div>

              <p style={{ color: "var(--muted)", lineHeight: 1.75, fontSize: "0.9rem", marginBottom: "24px" }}>
                Le Centre de Formation Professionnelle d&#39;Excellence de Dévikinmé est un établissement engagé dans la formation de jeunes talents, capables de répondre aux besoins du monde professionnel et de contribuer au développement durable de notre pays.
              </p>

              {/* Vision / Mission / Valeurs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: "Notre vision", desc: "Développer les compétences", icon: "🎯", color: "var(--primary)" },
                  { label: "Notre mission", desc: "Former pour l'emploi", icon: "🚀", color: "var(--secondary-text)" },
                  { label: "Nos valeurs", desc: "Excellence, Intégrité, Solidarité", icon: "⭐", color: "var(--accent-text)" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex", alignItems: "center", gap: "14px",
                      padding: "14px 18px", borderRadius: "var(--radius-md)",
                      background: "var(--bg-soft)", border: "1px solid var(--border)",
                      cursor: "pointer", transition: "var(--transition)",
                    }}
                    className="vmv-item"
                  >
                    <span style={{ fontSize: "1.4rem" }}>{item.icon}</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem", color: item.color }}>{item.label}</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "24px" }}>
                <Link href="/a-propos/presentation" className="btn-primary">
                  En savoir plus <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* ---- ACTUALITÉS ---- */}
            <div>
              <span className="section-label">ACTUALITÉS & ANNONCES</span>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>Restez informé</h2>
                <Link href="/informations/actualites" style={{
                  color: "var(--primary)", textDecoration: "none", fontWeight: 600,
                  fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px"
                }}>
                  Voir toutes <ArrowRight size={14} />
                </Link>
              </div>
              <div className="orange-line" />

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {ACTUALITES.map((actu) => (
                  <article
                    key={actu.id}
                    style={{
                      display: "flex", gap: "16px", padding: "16px",
                      borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
                      background: "white", transition: "var(--transition)",
                      cursor: "pointer",
                    }}
                    className="actu-item"
                  >
                    <div style={{
                      position: "relative", width: "90px", height: "70px",
                      borderRadius: "10px", overflow: "hidden", flexShrink: 0
                    }}>
                      <Image
                        src={actu.image}
                        alt={actu.titre}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="90px"
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        display: "inline-block", background: "var(--bg-soft)", color: "var(--muted)",
                        fontSize: "0.72rem", padding: "2px 8px", borderRadius: "4px",
                        marginBottom: "6px", fontWeight: 500
                      }}>
                        📅 {actu.date}
                      </span>
                      <h3 style={{
                        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem",
                        color: "var(--text)", marginBottom: "6px",
                        overflow: "hidden", textOverflow: "ellipsis",
                        display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
                      }}>
                        {actu.titre}
                      </h3>
                      <p style={{
                        color: "var(--muted)", fontSize: "0.8rem", lineHeight: 1.5,
                        overflow: "hidden", textOverflow: "ellipsis",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      }}>
                        {actu.extrait}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              {/* Bloc S'inscrire */}
              <div style={{
                marginTop: "24px", padding: "24px",
                borderRadius: "var(--radius-lg)",
                background: "radial-gradient(circle at 90% 0%, rgba(10,31,232,0.7), transparent 60%), var(--ink)",
                color: "white", textAlign: "center", borderTop: "4px solid transparent",
                borderImage: "var(--brand-stripe) 1"
              }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "8px" }}>
                  Prêt à rejoindre le CeFoPExD ?
                </h3>
                <p style={{ fontSize: "0.85rem", opacity: 0.85, marginBottom: "16px" }}>
                  Déposez votre pré-inscription en ligne ou venez nous rendre visite.
                </p>
                <Link href="/inscription/formulaire" className="btn-highlight">
                  Pré-inscription en ligne
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================
          5. COMPTEURS ANIMÉS
          ============================================= */}
      <section
        ref={statsRef}
        style={{
          background: "radial-gradient(circle at 80% 0%, rgba(10,31,232,0.6), transparent 60%), var(--ink)",
          padding: "80px 0",
        }}
      >
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              color: "white", marginBottom: "12px"
            }}>
              Le CeFoPExD en chiffres
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem" }}>
              Notre impact au service de la jeunesse togolaise
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "24px"
          }}>
            {STATS.map((stat) => (
              <StatCard key={stat.label} stat={stat} animate={statsVisible} />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <Link href="/inscription/formulaire" className="btn-highlight" style={{ fontSize: "1rem", padding: "14px 32px" }}>
              Rejoignez-nous aujourd'hui !
            </Link>
          </div>
        </div>
      </section>

      {/* =============================================
          6. VALEURS & ENGAGEMENT
          ============================================= */}
      <section className="section" style={{ background: "var(--bg-soft)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="section-label">NOS ENGAGEMENTS</span>
            <h2 className="section-title">Pourquoi choisir le CeFoPExD ?</h2>
            <div className="orange-line orange-line-center" />
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px"
          }}>
            {[
              {
                icon: "🎓", title: "Formation d'excellence",
                desc: "Un enseignement de qualité qui fait de l'excellence sa priorité, en créant la différence pour devenir une référence.",
                color: "var(--primary)"
              },
              {
                icon: "💼", title: "Insertion professionnelle",
                desc: "Nous formons des cadres capables de créer de l'emploi dans leur domaine, pas seulement d'en demander.",
                color: "var(--accent-text)"
              },
              {
                icon: "🤝", title: "Égalité des chances",
                desc: "Nous respectons les différences et favorisons l'égalité des chances car la diversité est une richesse.",
                color: "var(--secondary-text)"
              },
              {
                icon: "🔬", title: "Recherche & Innovation",
                desc: "Une place essentielle est accordée à la recherche, notamment en entrepreneuriat, pour innover et progresser.",
                color: "var(--logo-blue)"
              },
              {
                icon: "🌱", title: "Adaptation continue",
                desc: "Nos formations sont sans cesse adaptées à l'évolution de la société et aux besoins du marché de l'emploi.",
                color: "var(--primary)"
              },
              {
                icon: "⚖️", title: "Valeurs humaines",
                desc: "Paix, tolérance, intégrité et équité : nous formons des hommes et femmes acteurs responsables de la société.",
                color: "var(--secondary-text)"
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "white", borderRadius: "var(--radius-lg)",
                  padding: "28px 24px", border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)", transition: "var(--transition)",
                  display: "flex", gap: "16px",
                }}
                className="engage-card"
              >
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px",
                  background: "var(--bg-soft)", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "1.5rem", flexShrink: 0
                }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: item.color, marginBottom: "8px" }}>
                    {item.title}
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.65 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
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
            <CheckCircle size={48} color="var(--secondary-text)" style={{ marginBottom: "20px" }} />
            <h2 className="section-title">
              Prêt à construire votre avenir avec nous ?
            </h2>
            <div className="orange-line orange-line-center" />
            <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.75, marginBottom: "32px" }}>
              Les inscriptions se font en présentiel au centre. Remplissez le formulaire de pré-inscription en ligne pour prendre rendez-vous avec notre équipe d'admission.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/inscription/formulaire" className="btn-highlight" style={{ fontSize: "1rem", padding: "14px 32px" }}>
                Pré-inscription en ligne
              </Link>
              <Link href="/contact" className="btn-primary" style={{ fontSize: "1rem", padding: "14px 32px" }}>
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
        .atout-item:hover { border-bottom-color: var(--highlight) !important; }
        .atout-item:hover .atout-icon { background: var(--primary) !important; border-color: var(--primary) !important; }
        .atout-item:hover .atout-icon svg { color: white !important; }
        .filiere-img { transform: scale(1); }
        .card:hover .filiere-img { transform: scale(1.05) !important; }
        .filiere-btn:hover { background: var(--bg-soft); }
        .actu-item:hover { border-color: var(--primary) !important; box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .vmv-item:hover { border-color: var(--primary) !important; box-shadow: var(--shadow-sm); }
        .engage-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
      `}</style>
    </>
  );
}
