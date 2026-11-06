"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SocialIcons from "@/components/SocialIcons";
import { createClient } from "@/lib/supabase/client";
import { Menu, X, ChevronDown, Search, LogIn, LogOut, Phone, Mail, UserRound } from "lucide-react";
import { Icone } from "@/lib/site/icones";
import { nonOptimise } from "@/lib/site/images";
import type { SiteConfig } from "@/lib/site/types";

/* =============================================
   DONNÉES DE L'EN-TÊTE (modifiables dans le Studio du site)
   ============================================= */
export type EnteteData = {
  logo: string;
  nom: string;
  entete: SiteConfig["entete"];
  telephones: string[];
  email: string;
  reseaux: SiteConfig["reseaux"];
};

/* =============================================
   COMPOSANT HEADER
   ============================================= */
export default function Header({ site }: { site: EnteteData }) {
  const { entete } = site;
  const NAV_ITEMS = entete.menu
    .filter((m) => m.visible !== false)
    .map((m) => {
      const enfants = (m.enfants ?? []).filter((c) => c.visible !== false);
      return { ...m, children: enfants.length ? enfants : undefined };
    });
  const tel = site.telephones[0] ?? "";
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
            <Link href="/" className="header-logo" aria-label={`${site.nom} — Accueil`}>
              <Image
                src={site.logo} unoptimized={nonOptimise(site.logo)}
                alt={`Logo ${site.nom}`}
                fill
                sizes="168px"
                style={{ objectFit: "contain", objectPosition: "left center" }}
                priority
              />
            </Link>

            {/* ---- Contacts rapides (grand écran) ---- */}
            {entete.afficherContacts && <div className="header-contact">
              {tel && <a href={`tel:${tel.replace(/\s/g, "")}`}>
                <span className="header-contact-ico" style={{ background: "rgba(34,192,3,0.12)", color: "var(--secondary-text)" }}>
                  <Phone size={15} />
                </span>
                <span><small>{entete.texteAppel}</small>{tel}</span>
              </a>}
              {site.email && <a href={`mailto:${site.email}`}>
                <span className="header-contact-ico" style={{ background: "rgba(248,35,3,0.1)", color: "var(--accent-text)" }}>
                  <Mail size={15} />
                </span>
                <span><small>{entete.texteEcrire}</small>{site.email}</span>
              </a>}
              {entete.afficherReseaux && <div className="header-social">
                <SocialIcons reseaux={site.reseaux} variant="light" size={14} />
              </div>}
            </div>}

            {/* ---- Actions droite ---- */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "auto" }}>
              {/* Recherche */}
              {!entete.afficherRecherche ? null : searchOpen ? (
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
                  <span className="login-text">{entete.texteConnexion}</span>
                </Link>
              )}

              {/* Bouton S'inscrire */}
              {entete.boutonCta?.label && (
                <Link href={entete.boutonCta.href || "/"} className="header-cta">
                  {entete.boutonCta.label}
                </Link>
              )}

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
                        <Icone nom={item.icone} size={15} className="nav-ico" />
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
                              <span className="dropdown-icon"><Icone nom={child.icone} size={16} /></span>
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
                      <Icone nom={item.icone} size={15} className="nav-ico" />
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
                  <Icone nom={item.icone} size={15} />
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
            <Image src={site.logo} unoptimized={nonOptimise(site.logo)} alt={`Logo ${site.nom}`} fill sizes="150px" style={{ objectFit: "contain", objectPosition: "left center" }} />
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
                        <Icone nom={item.icone} size={17} />
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
                            <span className="dropdown-icon"><Icone nom={child.icone} size={16} /></span>
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={item.href} style={{ ...rowStyle, justifyContent: "flex-start" }} onClick={() => setMobileOpen(false)}>
                    <Icone nom={item.icone} size={17} />
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
          {entete.boutonCta?.label && (
            <Link
              href={entete.boutonCta.href || "/"}
              className="header-cta"
              style={{ justifyContent: "center", padding: "12px" }}
              onClick={() => setMobileOpen(false)}
            >
              {entete.boutonCta.label}
            </Link>
          )}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <SocialIcons reseaux={site.reseaux} variant="light" size={15} />
          </div>
          <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.78rem" }}>
            {site.telephones.map((t) => <div key={t}>📞 {t}</div>)}
          </div>
        </div>
      </div>
    </>
  );
}
