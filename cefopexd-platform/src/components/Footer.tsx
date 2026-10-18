"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MapPin, Phone, Mail, ArrowUp, ExternalLink } from "lucide-react";

function FacebookIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function YoutubeIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function LinkedinIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.54a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z"/>
    </svg>
  );
}

function TwitterIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

/* =============================================
   COMPOSANT FOOTER
   ============================================= */
export default function Footer() {
  const [showTop, setShowTop] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* ========== FOOTER PRINCIPAL ========== */}
      <footer style={{ background: "var(--ink)", color: "white", paddingTop: "64px", paddingBottom: "0", borderTop: "4px solid transparent", borderImage: "var(--brand-stripe) 1" }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "40px",
            paddingBottom: "48px",
          }}>

            {/* ---- Colonne 1 : Logo + infos ---- */}
            <div>
              <Link href="/" style={{ display: "inline-block", marginBottom: "14px", textDecoration: "none" }} aria-label="CeFoPExD — Accueil">
                <div style={{ background: "white", borderRadius: "16px", padding: "12px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
                  <div style={{ position: "relative", width: "180px", height: "50px" }}>
                    <Image src="/logo-cefopexd.png" alt="Logo CeFoPExD" fill sizes="180px" style={{ objectFit: "contain" }} />
                  </div>
                </div>
              </Link>
              <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.4, marginBottom: "16px" }}>
                Centre de Formation Professionnelle d&#39;Excellence de Dévikinmé
              </div>

              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: "24px" }}>
                Votre avenir professionnel commence ici. Des formations qualifiantes pour un avenir durable.
              </p>

              {/* Réseaux sociaux */}
              <div style={{ display: "flex", gap: "10px" }}>
                {[
                  { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com/cefopexd" },
                  { icon: YoutubeIcon, label: "YouTube", href: "https://youtube.com/@cefopexd" },
                  { icon: LinkedinIcon, label: "LinkedIn", href: "https://linkedin.com/company/cefopexd" },
                  { icon: TwitterIcon, label: "Twitter/X", href: "https://twitter.com/cefopexd" },
                ].map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.1)",
                      color: "white",
                      transition: "var(--transition)",
                      textDecoration: "none",
                    }}
                    className="social-btn"
                  >
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            </div>

            {/* ---- Colonne 2 : Liens rapides ---- */}
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", marginBottom: "20px", color: "var(--highlight)" }}>
                Liens rapides
              </h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "À propos du centre", href: "/a-propos/presentation" },
                  { label: "Nos filières", href: "/filieres" },
                  { label: "Comment s'inscrire", href: "/inscription/procedure" },
                  { label: "Pré-inscription en ligne", href: "/inscription/formulaire" },
                  { label: "Actualités & annonces", href: "/informations/actualites" },
                  { label: "Galerie photos", href: "/informations/galerie" },
                  { label: "FAQ", href: "/informations/faq" },
                  { label: "Contact", href: "/contact" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        textDecoration: "none",
                        fontSize: "0.88rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "var(--transition)",
                      }}
                      className="footer-link"
                    >
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--highlight)", flexShrink: 0 }} />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ---- Colonne 3 : Nos filières ---- */}
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", marginBottom: "20px", color: "var(--highlight)" }}>
                Nos filières
              </h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "💻 Informatique appliquée", href: "/filieres/informatique" },
                  { label: "⚙️ Mécatronique", href: "/filieres/mecatronique" },
                  { label: "🌾 Agro-alimentaire", href: "/filieres/agro-alimentaire" },
                  { label: "☀️ Énergie renouvelable", href: "/filieres/energie-renouvelable" },
                  { label: "🇩🇪 Langue allemande", href: "/filieres/langue-allemande" },
                  { label: "🔧 Formations courtes", href: "/filieres/formations-courtes" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        textDecoration: "none",
                        fontSize: "0.88rem",
                        transition: "var(--transition)",
                        display: "block",
                      }}
                      className="footer-link"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ---- Colonne 4 : Contact ---- */}
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", marginBottom: "20px", color: "var(--highlight)" }}>
                Nous contacter
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MapPin size={16} color="var(--highlight)" />
                  </div>
                  <div>
                    <div style={{ color: "white", fontWeight: 600, fontSize: "0.85rem" }}>Adresse</div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.83rem", lineHeight: 1.5 }}>
                      Rue Okeloukoutou<br />
                      Lomé, Togo
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Phone size={16} color="var(--highlight)" />
                  </div>
                  <div>
                    <div style={{ color: "white", fontWeight: 600, fontSize: "0.85rem" }}>Téléphones</div>
                    <a href="tel:+22870881306" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.83rem", textDecoration: "none", display: "block" }}>+228 70 88 13 06</a>
                    <a href="tel:+22879952020" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.83rem", textDecoration: "none", display: "block" }}>+228 79 95 20 20</a>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Mail size={16} color="var(--highlight)" />
                  </div>
                  <div>
                    <div style={{ color: "white", fontWeight: 600, fontSize: "0.85rem" }}>E-mail</div>
                    <a href="mailto:info@cefopexd.com" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.83rem", textDecoration: "none" }}>
                      info@cefopexd.com
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/22870881306"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    background: "#25D366",
                    borderRadius: "var(--radius-full)",
                    color: "white",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    width: "fit-content",
                    transition: "var(--transition)",
                  }}
                >
                  💬 WhatsApp
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Slogan ---- */}
        <div style={{
          background: "rgba(0,0,0,0.2)",
          padding: "20px",
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}>
          <p style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "1rem",
            color: "rgba(255,255,255,0.9)",
            fontWeight: 500,
          }}>
            ✨ Ensemble pour une jeunesse compétente et un avenir meilleur !
          </p>
        </div>

        {/* ---- Copyright ---- */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          padding: "16px 24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          fontSize: "0.8rem",
          color: "rgba(255,255,255,0.5)",
        }}>
          <span>© {year} CeFoPExD — Tous droits réservés</span>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link href="/mentions-legales" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }} className="footer-link">
              Mentions légales
            </Link>
            <Link href="/confidentialite" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }} className="footer-link">
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </footer>

      {/* ========== BOUTON RETOUR EN HAUT ========== */}
      <button
        onClick={scrollToTop}
        aria-label="Retour en haut"
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          width: "46px",
          height: "46px",
          borderRadius: "50%",
          background: "var(--primary)",
          color: "white",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(10,31,232,0.4)",
          transition: "all 0.3s ease",
          opacity: showTop ? 1 : 0,
          transform: showTop ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
          pointerEvents: showTop ? "auto" : "none",
          zIndex: 40,
        }}
        className="scroll-top-btn"
      >
        <ArrowUp size={20} />
      </button>

      <style jsx>{`
        .footer-link:hover { color: var(--highlight) !important; }
        .social-btn:hover  { background: var(--highlight) !important; color: var(--ink) !important; transform: translateY(-3px); }
        .scroll-top-btn:hover { background: var(--primary-dark) !important; transform: translateY(-3px) scale(1.1) !important; }
      `}</style>
    </>
  );
}
