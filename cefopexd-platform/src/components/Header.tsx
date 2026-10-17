"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, ChevronDown, Search, LogIn,
  GraduationCap, Building2, BookOpen, Calendar, Info, Phone
} from "lucide-react";

/* =============================================
   DONNÉES DU MENU DE NAVIGATION
   ============================================= */
const NAV_ITEMS = [
  { label: "Accueil", href: "/" },
  {
    label: "À propos",
    href: "/a-propos",
    children: [
      { label: "Présentation du centre", href: "/a-propos/presentation", icon: Building2 },
      { label: "Mot du Directeur Général", href: "/a-propos/mot-du-dg", icon: GraduationCap },
      { label: "Vision, mission et valeurs", href: "/a-propos/vision-mission", icon: BookOpen },
      { label: "Nos buts et objectifs", href: "/a-propos/objectifs", icon: BookOpen },
      { label: "Équipe administrative", href: "/a-propos/equipe", icon: Building2 },
      { label: "Infrastructures", href: "/a-propos/infrastructures", icon: Building2 },
      { label: "Partenaires", href: "/a-propos/partenaires", icon: Building2 },
    ],
  },
  {
    label: "Nos filières",
    href: "/filieres",
    children: [
      { label: "Informatique appliquée", href: "/filieres/informatique", icon: BookOpen },
      { label: "Mécatronique", href: "/filieres/mecatronique", icon: BookOpen },
      { label: "Agro-alimentaire", href: "/filieres/agro-alimentaire", icon: BookOpen },
      { label: "Énergie renouvelable", href: "/filieres/energie-renouvelable", icon: BookOpen },
      { label: "Langue allemande", href: "/filieres/langue-allemande", icon: BookOpen },
      { label: "Formations courtes", href: "/filieres/formations-courtes", icon: BookOpen },
    ],
  },
  {
    label: "Formations",
    href: "/formations",
    children: [
      { label: "Calendrier académique", href: "/formations/calendrier", icon: Calendar },
      { label: "Sessions à venir", href: "/formations/sessions", icon: Calendar },
      { label: "Séminaires et ateliers", href: "/formations/seminaires", icon: Calendar },
      { label: "Formations sur mesure", href: "/formations/sur-mesure", icon: Calendar },
    ],
  },
  {
    label: "Inscription",
    href: "/inscription",
    children: [
      { label: "Comment s'inscrire", href: "/inscription/procedure", icon: GraduationCap },
      { label: "Pièces à fournir", href: "/inscription/pieces", icon: GraduationCap },
      { label: "Frais de formation", href: "/inscription/frais", icon: GraduationCap },
      { label: "Pré-inscription en ligne", href: "/inscription/formulaire", icon: GraduationCap },
    ],
  },
  {
    label: "S'informer",
    href: "/informations",
    children: [
      { label: "Actualités & annonces", href: "/informations/actualites", icon: Info },
      { label: "Événements", href: "/informations/evenements", icon: Calendar },
      { label: "Publications", href: "/informations/publications", icon: BookOpen },
      { label: "Galerie photos/vidéos", href: "/informations/galerie", icon: Building2 },
      { label: "FAQ", href: "/informations/faq", icon: Info },
    ],
  },
  { label: "Contact", href: "/contact", icon: Phone },
];

/* =============================================
   COMPOSANT HEADER
   ============================================= */
export default function Header() {
  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* Écoute du scroll */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Fermeture si clic dehors */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Focus recherche */
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  /* Fermeture menu mobile sur changement de page */
  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ========== HEADER PRINCIPAL ========== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-white"
        }`}
        style={{ borderBottom: scrolled ? "none" : "1px solid #E5E7EB" }}
      >
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", height: "72px", gap: "16px" }}>

            {/* ---- Logo + Nom ---- */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 }}>
              <div style={{ position: "relative", width: "52px", height: "52px" }}>
                <Image
                  src="/logo-cefopexd.png"
                  alt="Logo CeFoPExD"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                <span style={{
                  fontFamily: "var(--font-poppins, 'Poppins')",
                  fontWeight: 800,
                  fontSize: "1.15rem",
                  color: "var(--primary-dark)"
                }}>
                  <span style={{ color: "var(--secondary)" }}>CeFo</span>
                  <span style={{ color: "var(--accent)" }}>PExD</span>
                </span>
                <span style={{
                  fontSize: "0.62rem",
                  color: "var(--muted)",
                  fontWeight: 500,
                  maxWidth: "180px",
                  lineHeight: 1.2
                }}>
                  Centre de Formation Prof. d'Excellence
                </span>
              </div>
            </Link>

            {/* ---- Navigation desktop ---- */}
            <nav
              ref={dropdownRef}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                flex: 1,
                justifyContent: "center",
              }}
              className="hidden-mobile"
            >
              {NAV_ITEMS.map((item) => (
                <div key={item.label} style={{ position: "relative" }}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() =>
                          setActiveDropdown(activeDropdown === item.label ? null : item.label)
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontFamily: "var(--font-poppins, 'Poppins')",
                          fontWeight: 600,
                          fontSize: "0.88rem",
                          color: isActive(item.href) ? "var(--primary)" : "var(--text)",
                          transition: "var(--transition)",
                          borderBottom: isActive(item.href)
                            ? "2px solid var(--highlight)"
                            : "2px solid transparent",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={() => setActiveDropdown(item.label)}
                        onMouseLeave={() => {
                          setTimeout(() => setActiveDropdown(null), 200);
                        }}
                        aria-expanded={activeDropdown === item.label}
                      >
                        {item.label}
                        <ChevronDown
                          size={14}
                          style={{
                            transition: "transform 0.2s",
                            transform: activeDropdown === item.label ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        />
                      </button>

                      {/* Dropdown */}
                      {activeDropdown === item.label && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 8px)",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "white",
                            borderRadius: "14px",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                            padding: "8px",
                            minWidth: "240px",
                            zIndex: 100,
                            border: "1px solid var(--border)",
                            animation: "slideInDown 0.2s ease",
                          }}
                          onMouseEnter={() => setActiveDropdown(item.label)}
                          onMouseLeave={() => setActiveDropdown(null)}
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 14px",
                                borderRadius: "10px",
                                textDecoration: "none",
                                color: isActive(child.href) ? "var(--primary)" : "var(--text)",
                                fontWeight: isActive(child.href) ? 600 : 500,
                                fontSize: "0.88rem",
                                background: isActive(child.href) ? "var(--bg-soft)" : "transparent",
                                transition: "var(--transition)",
                              }}
                              className="dropdown-link"
                            >
                              <span style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: "var(--highlight)",
                                flexShrink: 0
                              }} />
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontFamily: "var(--font-poppins, 'Poppins')",
                        fontWeight: 600,
                        fontSize: "0.88rem",
                        color: isActive(item.href) ? "var(--primary)" : "var(--text)",
                        borderBottom: isActive(item.href)
                          ? "2px solid var(--highlight)"
                          : "2px solid transparent",
                        transition: "var(--transition)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* ---- Actions droite ---- */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              {/* Recherche */}
              {searchOpen ? (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "var(--bg-soft)",
                  borderRadius: "var(--radius-full)",
                  padding: "6px 12px",
                  border: "2px solid var(--primary)",
                  animation: "fadeInRight 0.2s ease",
                }}>
                  <Search size={16} color="var(--muted)" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      border: "none",
                      background: "transparent",
                      outline: "none",
                      fontSize: "0.88rem",
                      width: "160px",
                      fontFamily: "var(--font-inter, 'Inter')",
                    }}
                    onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                  />
                  <button onClick={() => setSearchOpen(false)} style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                    <X size={14} color="var(--muted)" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Rechercher"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    border: "1px solid var(--border)",
                    background: "transparent",
                    cursor: "pointer",
                    transition: "var(--transition)",
                    color: "var(--text)",
                  }}
                  className="hidden-mobile"
                >
                  <Search size={18} />
                </button>
              )}

              {/* Connexion */}
              <Link
                href="/connexion"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border)",
                  textDecoration: "none",
                  color: "var(--text)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  transition: "var(--transition)",
                  fontFamily: "var(--font-poppins, 'Poppins')",
                  whiteSpace: "nowrap",
                }}
                className="hidden-mobile"
              >
                <LogIn size={15} />
                Se connecter
              </Link>

              {/* Bouton S'inscrire */}
              <Link
                href="/inscription/formulaire"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 18px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--highlight)",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  boxShadow: "0 4px 15px rgba(245,166,35,0.35)",
                  transition: "var(--transition)",
                  fontFamily: "var(--font-poppins, 'Poppins')",
                  whiteSpace: "nowrap",
                }}
              >
                S&#39;inscrire
              </Link>

              {/* Burger mobile */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--text)",
                }}
                className="show-mobile"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========== MENU MOBILE (panneau latéral) ========== */}
      {/* Overlay */}
      <div
        onClick={() => setMobileOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 90,
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Panneau */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "300px",
          maxWidth: "85vw",
          background: "white",
          zIndex: 100,
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowY: "auto",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
        }}
        aria-hidden={!mobileOpen}
      >
        {/* En-tête panneau */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--primary-dark)",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px" }} onClick={() => setMobileOpen(false)}>
            <div style={{ position: "relative", width: "40px", height: "40px" }}>
              <Image src="/logo-cefopexd.png" alt="Logo CeFoPExD" fill style={{ objectFit: "contain" }} />
            </div>
            <span style={{ color: "white", fontWeight: 700, fontSize: "1rem", fontFamily: "Poppins" }}>CeFoPExD</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ border: "none", background: "rgba(255,255,255,0.15)", color: "white", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Liens du menu mobile */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {NAV_ITEMS.map((item) => (
            <div key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 20px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      color: "var(--text)",
                      fontFamily: "Poppins",
                      textAlign: "left",
                      borderLeft: isActive(item.href) ? "3px solid var(--highlight)" : "3px solid transparent",
                    }}
                  >
                    {item.label}
                    <ChevronDown
                      size={16}
                      style={{
                        transition: "transform 0.2s",
                        transform: mobileExpanded === item.label ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                  {mobileExpanded === item.label && (
                    <div style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "12px 32px",
                            textDecoration: "none",
                            color: "var(--muted)",
                            fontSize: "0.88rem",
                            fontWeight: 500,
                            borderLeft: isActive(child.href) ? "3px solid var(--highlight)" : "3px solid transparent",
                            marginLeft: "0",
                          }}
                          onClick={() => setMobileOpen(false)}
                        >
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--highlight)", flexShrink: 0 }} />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "14px 20px",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: isActive(item.href) ? "var(--primary)" : "var(--text)",
                    fontFamily: "Poppins",
                    borderLeft: isActive(item.href) ? "3px solid var(--highlight)" : "3px solid transparent",
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer du panneau */}
        <div style={{ padding: "20px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link
            href="/connexion"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border)",
              textDecoration: "none",
              color: "var(--text)",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
            onClick={() => setMobileOpen(false)}
          >
            <LogIn size={16} /> Se connecter
          </Link>
          <Link
            href="/inscription/formulaire"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px",
              borderRadius: "var(--radius-full)",
              background: "var(--highlight)",
              color: "white",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
            onClick={() => setMobileOpen(false)}
          >
            S&#39;inscrire maintenant
          </Link>
          <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.78rem" }}>
            <div>📞 +228 70 88 13 06</div>
            <div>📞 +228 79 95 20 20</div>
          </div>
        </div>
      </div>

      {/* Styles inline pour responsive */}
      <style jsx>{`
        .hidden-mobile { display: flex !important; }
        .show-mobile   { display: none !important; }
        .dropdown-link:hover {
          background: var(--bg-soft) !important;
          color: var(--primary) !important;
        }
        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
      `}</style>
    </>
  );
}
