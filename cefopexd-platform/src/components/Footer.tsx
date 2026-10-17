"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  MapPin, Phone, Mail, Facebook, Youtube, Linkedin,
  Twitter, ArrowUp, ExternalLink
} from "lucide-react";

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
      <footer style={{ background: "var(--primary-dark)", color: "white", paddingTop: "64px", paddingBottom: "0" }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "40px",
            paddingBottom: "48px",
          }}>

            {/* ---- Colonne 1 : Logo + infos ---- */}
            <div>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", textDecoration: "none" }}>
                <div style={{ position: "relative", width: "56px", height: "56px", background: "white", borderRadius: "12px", padding: "4px" }}>
                  <Image src="/logo-cefopexd.png" alt="Logo CeFoPExD" fill style={{ objectFit: "contain", padding: "4px" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "1.2rem" }}>
                    <span style={{ color: "var(--secondary)" }}>CeFo</span>
                    <span style={{ color: "var(--accent)" }}>PExD</span>
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.6)", maxWidth: "150px", lineHeight: 1.3 }}>
                    Centre de Formation Prof. d'Excellence de Dévikinmé
                  </div>
                </div>
              </Link>

              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: "24px" }}>
                Votre avenir professionnel commence ici. Des formations qualifiantes pour un avenir durable.
              </p>

              {/* Réseaux sociaux */}
              <div style={{ display: "flex", gap: "10px" }}>
                {[
                  { icon: Facebook, label: "Facebook", href: "https://facebook.com/cefopexd" },
                  { icon: Youtube, label: "YouTube", href: "https://youtube.com/@cefopexd" },
                  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/cefopexd" },
                  { icon: Twitter, label: "Twitter/X", href: "https://twitter.com/cefopexd" },
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
              <h3 style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "1rem", marginBottom: "20px", color: "var(--highlight)" }}>
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
              <h3 style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "1rem", marginBottom: "20px", color: "var(--highlight)" }}>
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
              <h3 style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "1rem", marginBottom: "20px", color: "var(--highlight)" }}>
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
            fontFamily: "Poppins",
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
          boxShadow: "0 4px 20px rgba(30,64,216,0.4)",
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
        .social-btn:hover  { background: var(--highlight) !important; transform: translateY(-3px); }
        .scroll-top-btn:hover { background: var(--primary-dark) !important; transform: translateY(-3px) scale(1.1) !important; }
      `}</style>
    </>
  );
}
