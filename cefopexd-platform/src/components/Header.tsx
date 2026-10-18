"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SocialIcons from "@/components/SocialIcons";
import { createClient } from "@/lib/supabase/client";
import {
  Menu, X, ChevronDown, Search, LogIn, LogOut,
  GraduationCap, Building2, BookOpen, Calendar, Info, Phone,
  Home, Newspaper, Mail, UserRound
} from "lucide-react";

/* =============================================
   DONNÉES DU MENU DE NAVIGATION
   ============================================= */
const NAV_ITEMS = [
  { label: "Accueil", href: "/", icon: Home },
  {
    label: "À propos",
    href: "/a-propos",
    icon: Info,
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
    icon: BookOpen,
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
    icon: Calendar,
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
    icon: GraduationCap,
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
    icon: Newspaper,
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
  const [compte, setCompte] = useState<{ prenom: string; photo: string | null } | null>(null);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Compte Google connecté : affiché à la place de « Se connecter » */
  useEffect(() => {
    const supabase = createClient();
    type MaybeUser = { user_metadata?: Record<string, string>; email?: string } | null;
    const apply = (user: MaybeUser) => {
      if (!user) return setCompte(null);
      const meta = user.user_metadata ?? {};
      const nom = meta.full_name || meta.name || user.email || "";
      setCompte({ prenom: meta.given_name || nom.split(" ")[0], photo: meta.avatar_url || meta.picture || null });
    };
    supabase.auth.getUser().then(({ data }) => apply(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

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

  /* Ouverture au survol, fermeture avec un léger délai pour atteindre le sous-menu */
  const openDropdown = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(label);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 180);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ========== HEADER PRINCIPAL ========== */}
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="container header-container">
          <div className="header-row">

            {/* ---- Logo officiel ---- */}
            <Link href="/" className="header-logo" aria-label="CeFoPExD — Accueil">
              <Image
                src="/logo-cefopexd.png"
                alt="Logo CeFoPExD"
                fill
                sizes="168px"
                style={{ objectFit: "contain", objectPosition: "left center" }}
                priority
              />
            </Link>

            {/* ---- Contacts rapides (grand écran) ---- */}
            <div className="header-contact">
              <a href="tel:+22870881306">
                <span className="header-contact-ico" style={{ background: "rgba(34,192,3,0.12)", color: "var(--secondary-text)" }}>
                  <Phone size={15} />
                </span>
                <span><small>Appelez-nous</small>+228 70 88 13 06</span>
              </a>
              <a href="mailto:info@cefopexd.com">
                <span className="header-contact-ico" style={{ background: "rgba(248,35,3,0.1)", color: "var(--accent-text)" }}>
                  <Mail size={15} />
                </span>
                <span><small>Écrivez-nous</small>info@cefopexd.com</span>
              </a>
              <div className="header-social">
                <SocialIcons variant="light" size={14} />
              </div>
            </div>

            {/* ---- Actions droite ---- */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "auto" }}>
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
                      width: "150px",
                      fontFamily: "var(--font-body)",
                    }}
                    onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                  />
                  <button onClick={() => setSearchOpen(false)} aria-label="Fermer la recherche" style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                    <X size={14} color="var(--muted)" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Rechercher"
                  className="header-icon-btn header-search"
                >
                  <Search size={18} />
                </button>
              )}

              {/* Connexion (ou accès à l'espace personnel si connecté) */}
              {compte ? (
                <Link href="/mon-espace" className="header-login header-account" aria-label="Mon espace">
                  {compte.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={compte.photo} alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <UserRound size={15} />
                  )}
                  <span className="login-text">Mon espace</span>
                </Link>
              ) : (
                <Link href="/connexion" className="header-login" aria-label="Se connecter">
                  <LogIn size={15} />
                  <span className="login-text">Se connecter</span>
                </Link>
              )}

              {/* Bouton S'inscrire */}
              <Link href="/inscription/formulaire" className="header-cta">
                S&#39;inscrire
              </Link>

              {/* Burger mobile */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
                className="header-icon-btn show-mobile"
                style={{ borderRadius: "12px" }}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* ========== LIGNE DU MENU HORIZONTAL ========== */}
        <div className="header-nav-row">
          <div className="container header-container">
            {/* ---- Menu desktop avec sous-menus ---- */}
            <nav ref={dropdownRef} className="main-nav" aria-label="Menu principal">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  style={{ position: "relative" }}
                  onMouseEnter={item.children ? () => openDropdown(item.label) : undefined}
                  onMouseLeave={item.children ? scheduleClose : undefined}
                >
                  {item.children ? (
                    <>
                      <button
                        onClick={() =>
                          setActiveDropdown(activeDropdown === item.label ? null : item.label)
                        }
                        className={`nav-link ${isActive(item.href) ? "is-active" : ""}`}
                        aria-expanded={activeDropdown === item.label}
                      >
                        <item.icon size={15} className="nav-ico" />
                        {item.label}
                        <ChevronDown
                          size={14}
                          style={{
                            transition: "transform 0.2s",
                            transform: activeDropdown === item.label ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        />
                      </button>
  
                      {/* Sous-menu */}
                      {activeDropdown === item.label && (
                        <div className="nav-dropdown">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`dropdown-link ${isActive(child.href) ? "is-active" : ""}`}
                            >
                              <span className="dropdown-icon"><child.icon size={16} /></span>
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`nav-link ${isActive(item.href) ? "is-active" : ""}`}
                    >
                      <item.icon size={15} className="nav-ico" />
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* ---- Menu mobile : liens principaux défilables au doigt ---- */}
            <nav className="nav-strip" aria-label="Menu principal (mobile)">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`nav-strip-link ${isActive(item.href) ? "is-active" : ""}`}
                >
                  <item.icon size={15} />
                  {item.label}
                </Link>
              ))}
            </nav>
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
          background: "rgba(5,11,71,0.55)",
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
          width: "310px",
          maxWidth: "88vw",
          background: "white",
          zIndex: 100,
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowY: "auto",
          boxShadow: "-8px 0 32px rgba(5,11,71,0.2)",
          display: "flex",
          flexDirection: "column",
        }}
        aria-hidden={!mobileOpen}
      >
        {/* En-tête panneau : logo sur fond blanc + bande 4 couleurs */}
        <div style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 20px",
          borderBottom: "1px solid var(--border)",
        }}>
          <Link href="/" style={{ position: "relative", width: "150px", height: "42px" }} onClick={() => setMobileOpen(false)}>
            <Image src="/logo-cefopexd.png" alt="Logo CeFoPExD" fill sizes="150px" style={{ objectFit: "contain", objectPosition: "left center" }} />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
            className="header-icon-btn"
            style={{ width: "36px", height: "36px", borderRadius: "10px" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Liens du menu mobile */}
        <nav style={{ flex: 1, padding: "12px" }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const rowStyle: React.CSSProperties = {
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              padding: "12px 14px",
              marginBottom: "2px",
              borderRadius: "12px",
              border: "none",
              background: active ? "var(--primary-dark)" : "transparent",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.95rem",
              color: active ? "white" : "var(--text)",
              fontFamily: "var(--font-display)",
              textAlign: "left",
              textDecoration: "none",
            };
            return (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                      style={rowStyle}
                      aria-expanded={mobileExpanded === item.label}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <item.icon size={17} />
                        {item.label}
                      </span>
                      <ChevronDown
                        size={16}
                        style={{
                          transition: "transform 0.2s",
                          transform: mobileExpanded === item.label ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </button>
                    {mobileExpanded === item.label && (
                      <div style={{ padding: "4px 0 8px 12px" }}>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`dropdown-link ${isActive(child.href) ? "is-active" : ""}`}
                            onClick={() => setMobileOpen(false)}
                          >
                            <span className="dropdown-icon"><child.icon size={16} /></span>
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={item.href} style={{ ...rowStyle, justifyContent: "flex-start" }} onClick={() => setMobileOpen(false)}>
                    <item.icon size={17} />
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer du panneau */}
        <div style={{ padding: "20px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link
            href={compte ? "/mon-espace" : "/connexion"}
            className="header-login"
            style={{ justifyContent: "center", padding: "12px", width: "auto", height: "auto" }}
            onClick={() => setMobileOpen(false)}
          >
            {compte ? <><UserRound size={16} /> Mon espace ({compte.prenom})</> : <><LogIn size={16} /> Se connecter avec Google</>}
          </Link>
          {compte && (
            <form action="/auth/deconnexion" method="post">
              <button type="submit" className="btn-logout" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
                <LogOut size={16} /> Se déconnecter
              </button>
            </form>
          )}
          <Link
            href="/inscription/formulaire"
            className="header-cta"
            style={{ justifyContent: "center", padding: "12px" }}
            onClick={() => setMobileOpen(false)}
          >
            S&#39;inscrire maintenant
          </Link>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <SocialIcons variant="light" size={15} />
          </div>
          <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.78rem" }}>
            <div>📞 +228 70 88 13 06</div>
            <div>📞 +228 79 95 20 20</div>
          </div>
        </div>
      </div>
    </>
  );
}
