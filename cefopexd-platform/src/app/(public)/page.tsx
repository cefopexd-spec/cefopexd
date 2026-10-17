"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Monitor, Settings, Leaf,
  Sun, Languages, Wrench, CheckCircle, Award,
  Building2, Handshake, TrendingUp, ArrowRight,
  Users, BookOpen, Percent, Star
} from "lucide-react";

/* =============================================
   DONNÉES : SLIDES DU HERO
   ============================================= */
const HERO_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80",
    pretitle: "BIENVENUE AU CeFoPExD",
    title: "Votre avenir professionnel commence ici !",
    subtitle:
      "Le Centre de Formation Professionnelle d'Excellence de Dévikinmé vous offre une formation de qualité, adaptée aux besoins du marché de l'emploi et aux défis de demain.",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80",
    pretitle: "EXCELLENCE & INNOVATION",
    title: "Des formations pour créer l'emploi de demain",
    subtitle:
      "Nous formons des cadres capables de créer de l'emploi dans leur domaine de formation. L'excellence et l'intégrité sont au cœur de notre pédagogie.",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80",
    pretitle: "6 FILIÈRES D'EXCELLENCE",
    title: "Informatique, Mécatronique, Énergie et plus encore",
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
    color: "#1E40D8",
    bg: "#EEF2FF",
    title: "Informatique appliquée",
    desc: "Développez vos compétences en programmation, réseaux, bases de données et bureautique.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
  },
  {
    slug: "mecatronique",
    icon: Settings,
    color: "#E8231A",
    bg: "#FEF2F2",
    title: "Mécatronique",
    desc: "Maîtrisez la mécanique, l'électronique, l'automatisme et la maintenance des équipements.",
    image: "https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=600&q=80",
  },
  {
    slug: "agro-alimentaire",
    icon: Leaf,
    color: "#1FB31F",
    bg: "#F0FDF4",
    title: "Agro-alimentaire",
    desc: "Transformez et valorisez les produits agricoles dans le respect des normes sanitaires.",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80",
  },
  {
    slug: "energie-renouvelable",
    icon: Sun,
    color: "#F5A623",
    bg: "#FFFBEB",
    title: "Énergie renouvelable",
    desc: "Formez-vous aux solutions énergétiques durables pour un avenir plus vert.",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
  },
  {
    slug: "langue-allemande",
    icon: Languages,
    color: "#8B5CF6",
    bg: "#F5F3FF",
    title: "Langue allemande",
    desc: "Apprenez l'allemand de A1 à B2 avec préparation aux examens certifiants.",
    image: "https://images.unsplash.com/photo-1527866959252-de096ac32d6f?w=600&q=80",
  },
  {
    slug: "formations-courtes",
    icon: Wrench,
    color: "#06B6D4",
    bg: "#F0FDFF",
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
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&q=80",
  },
  {
    id: 2,
    titre: "Journée portes ouvertes au CeFoPExD",
    date: "28 mars 2025",
    extrait: "Découvrez nos infrastructures et rencontrez notre équipe pédagogique lors de notre journée portes ouvertes.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&q=80",
  },
  {
    id: 3,
    titre: "Lancement de la filière Énergie renouvelable",
    date: "14 mars 2025",
    extrait: "Une nouvelle filière pour répondre aux enjeux de demain et aux besoins croissants en énergies vertes.",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=200&q=80",
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
        <stat.icon size={24} color="white" />
      </div>
      <div style={{
        fontFamily: "Poppins",
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
      <section
        style={{ position: "relative", minHeight: "calc(100vh - 72px)", overflow: "hidden" }}
        aria-label="Carrousel principal"
      >
        {/* Photo de fond avec effet Ken Burns */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            style={{ objectFit: "cover", animation: "kenBurns 8s ease-in-out infinite alternate" }}
            priority
            sizes="100vw"
          />
          {/* Overlay dégradé bleu nuit */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(105deg, rgba(15,31,107,0.95) 0%, rgba(30,64,216,0.80) 55%, rgba(15,31,107,0.30) 100%)",
          }} />
        </div>

        {/* Contenu héro */}
        <div className="container" style={{
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column",
          justifyContent: "center", minHeight: "calc(100vh - 72px)",
          paddingTop: "60px", paddingBottom: "100px",
        }}>
          <div style={{ maxWidth: "640px" }}>
            {/* Surtitré */}
            <div
              key={`pre-${currentSlide}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "rgba(245,166,35,0.15)", border: "1px solid rgba(245,166,35,0.4)",
                borderRadius: "var(--radius-full)", padding: "6px 16px",
                marginBottom: "20px",
                animation: "fadeInUp 0.6s ease forwards",
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--highlight)" }} />
              <span style={{ color: "var(--highlight)", fontFamily: "Poppins", fontWeight: 600, fontSize: "0.78rem", letterSpacing: "2px" }}>
                {slide.pretitle}
              </span>
            </div>

            {/* Grand titre */}
            <h1
              key={`title-${currentSlide}`}
              style={{
                color: "white", fontFamily: "Poppins", fontWeight: 800,
                fontSize: "clamp(2rem, 5vw, 3.2rem)", lineHeight: 1.15,
                marginBottom: "20px",
                animation: "fadeInUp 0.6s 0.1s ease both",
              }}
            >
              {slide.title}
            </h1>

            {/* Sous-titre */}
            <p
              key={`sub-${currentSlide}`}
              style={{
                color: "rgba(255,255,255,0.85)", fontSize: "1rem",
                lineHeight: 1.7, marginBottom: "32px",
                animation: "fadeInUp 0.6s 0.2s ease both",
              }}
            >
              {slide.subtitle}
            </p>

            {/* Boutons */}
            <div
              key={`btns-${currentSlide}`}
              style={{
                display: "flex", gap: "16px", flexWrap: "wrap",
                marginBottom: "32px",
                animation: "fadeInUp 0.6s 0.3s ease both",
              }}
            >
              <Link href="/filieres" className="btn-highlight">
                Découvrir nos filières
              </Link>
              <Link href="/inscription/formulaire" className="btn-outline-white">
                S&#39;inscrire maintenant
              </Link>
            </div>

            {/* Phrase manuscrite */}
            <div
              key={`cursive-${currentSlide}`}
              style={{ animation: "fadeInUp 0.6s 0.4s ease both" }}
            >
              <span className="cursive-text" style={{ fontSize: "1.1rem" }}>
                « Formations qualifiantes pour un avenir durable »
              </span>
              <div style={{ width: "80px", height: "3px", background: "var(--highlight)", borderRadius: "2px", marginTop: "8px" }} />
            </div>
          </div>
        </div>

        {/* Flèches navigation */}
        <button
          onClick={prev}
          aria-label="Slide précédente"
          style={{
            position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", zIndex: 2,
            width: "48px", height: "48px", borderRadius: "50%",
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
            color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)", transition: "var(--transition)",
          }}
          className="carousel-btn"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={next}
          aria-label="Slide suivante"
          style={{
            position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", zIndex: 2,
            width: "48px", height: "48px", borderRadius: "50%",
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
            color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)", transition: "var(--transition)",
          }}
          className="carousel-btn"
        >
          <ChevronRight size={22} />
        </button>

        {/* Points de navigation */}
        <div style={{
          position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: "10px", zIndex: 2
        }}>
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Aller à la slide ${i + 1}`}
              style={{
                width: i === currentSlide ? "28px" : "10px",
                height: "10px",
                borderRadius: "5px",
                background: i === currentSlide ? "var(--highlight)" : "rgba(255,255,255,0.4)",
                border: "none", cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          ))}
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
                <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.88rem", color: "var(--text)", marginBottom: "4px" }}>
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
                    justifyContent: "center", boxShadow: `0 4px 16px ${filiere.color}60`,
                    border: "3px solid white", zIndex: 1,
                  }}>
                    <filiere.icon size={22} color="white" />
                  </div>
                </div>

                {/* Contenu */}
                <div style={{ padding: "32px 24px 24px" }}>
                  <h3 style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "1.1rem", color: filiere.color, marginBottom: "10px" }}>
                    {filiere.title}
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.65, marginBottom: "20px" }}>
                    {filiere.desc}
                  </p>
                  <Link
                    href={`/filieres/${filiere.slug}`}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      color: filiere.color, fontWeight: 600, fontSize: "0.88rem",
                      textDecoration: "none", fontFamily: "Poppins",
                      padding: "8px 18px", borderRadius: "var(--radius-full)",
                      border: `1.5px solid ${filiere.color}`,
                      transition: "var(--transition)",
                    }}
                    className="filiere-btn"
                    style2={{ background: filiere.bg }}
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
                  src="https://images.unsplash.com/photo-1562774053-701939374585?w=700&q=80"
                  alt="Centre CeFoPExD"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div style={{
                  position: "absolute", bottom: "16px", left: "16px",
                  background: "var(--primary-dark)", color: "white",
                  padding: "6px 14px", borderRadius: "var(--radius-full)",
                  fontFamily: "Poppins", fontWeight: 600, fontSize: "0.82rem"
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
                  { label: "Notre mission", desc: "Former pour l'emploi", icon: "🚀", color: "var(--secondary)" },
                  { label: "Nos valeurs", desc: "Excellence, Intégrité, Solidarité", icon: "⭐", color: "var(--highlight)" },
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
                      <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.9rem", color: item.color }}>{item.label}</div>
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
                        fontFamily: "Poppins", fontWeight: 700, fontSize: "0.9rem",
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
                background: "linear-gradient(135deg, var(--primary-dark), var(--primary))",
                color: "white", textAlign: "center"
              }}>
                <h3 style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "1.1rem", marginBottom: "8px" }}>
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
          background: "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)",
          padding: "80px 0",
        }}
      >
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{
              fontFamily: "Poppins", fontWeight: 800,
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
                color: "var(--highlight)"
              },
              {
                icon: "🤝", title: "Égalité des chances",
                desc: "Nous respectons les différences et favorisons l'égalité des chances car la diversité est une richesse.",
                color: "var(--secondary)"
              },
              {
                icon: "🔬", title: "Recherche & Innovation",
                desc: "Une place essentielle est accordée à la recherche, notamment en entrepreneuriat, pour innover et progresser.",
                color: "var(--accent)"
              },
              {
                icon: "🌱", title: "Adaptation continue",
                desc: "Nos formations sont sans cesse adaptées à l'évolution de la société et aux besoins du marché de l'emploi.",
                color: "#8B5CF6"
              },
              {
                icon: "⚖️", title: "Valeurs humaines",
                desc: "Paix, tolérance, intégrité et équité : nous formons des hommes et femmes acteurs responsables de la société.",
                color: "#06B6D4"
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
                  <h3 style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.95rem", color: item.color, marginBottom: "8px" }}>
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
            <CheckCircle size={48} color="var(--secondary)" style={{ marginBottom: "20px" }} />
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
        .carousel-btn:hover { background: rgba(255,255,255,0.25) !important; }
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
