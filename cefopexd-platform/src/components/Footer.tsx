"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MapPin, Phone, Mail, ArrowUp, Navigation } from "lucide-react";
import SocialIcons, { WhatsappIcon } from "@/components/SocialIcons";
import ChatWidget from "@/components/ChatWidget";
import { CONTACT } from "@/lib/site-content";

const QUICK_LINKS = [
  { label: "À propos du centre", href: "/a-propos/presentation" },
  { label: "Mot du Directeur Général", href: "/a-propos/mot-du-dg" },
  { label: "Comment s'inscrire", href: "/inscription/procedure" },
  { label: "Pré-inscription en ligne", href: "/inscription/formulaire" },
  { label: "Actualités & annonces", href: "/informations/actualites" },
  { label: "Questions fréquentes", href: "/informations/faq" },
  { label: "Contact", href: "/contact" },
];

const FILIERE_LINKS = [
  { label: "Informatique appliquée", href: "/filieres/informatique" },
  { label: "Mécatronique", href: "/filieres/mecatronique" },
  { label: "Agro-alimentaire", href: "/filieres/agro-alimentaire" },
  { label: "Énergie renouvelable", href: "/filieres/energie-renouvelable" },
  { label: "Langue allemande", href: "/filieres/langue-allemande" },
  { label: "Formations courtes", href: "/filieres/formations-courtes" },
];

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

  return (
    <>
      <footer className="site-footer">
        <div className="container footer-grid">
          {/* ---- Logo + présentation ---- */}
          <div>
            <Link href="/" className="footer-logo" aria-label="CeFoPExD — Accueil">
              <Image src="/logo-cefopexd.png" alt="Logo CeFoPExD" fill sizes="132px" style={{ objectFit: "contain" }} />
            </Link>
            <p className="footer-about">
              Centre de Formation Professionnelle d&#39;Excellence de Dévikinmé. Des formations qualifiantes pour un avenir durable.
            </p>
            <SocialIcons variant="dark" size={15} />
          </div>

          {/* ---- Liens rapides ---- */}
          <div>
            <h3 className="footer-title">Liens rapides</h3>
            <ul className="footer-links">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={href}><Link href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* ---- Filières ---- */}
          <div>
            <h3 className="footer-title">Nos filières</h3>
            <ul className="footer-links">
              {FILIERE_LINKS.map(({ label, href }) => (
                <li key={href}><Link href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* ---- Contact + localisation ---- */}
          <div>
            <h3 className="footer-title">Nous trouver</h3>
            <ul className="footer-contact">
              <li><MapPin size={16} /><span>{CONTACT.localisation}<br />{CONTACT.adresse}</span></li>
              <li>
                <Phone size={16} />
                <span>
                  {CONTACT.telephones.map((t) => (
                    <a key={t} href={`tel:${t.replace(/\s/g, "")}`}>{t}<br /></a>
                  ))}
                </span>
              </li>
              <li><Mail size={16} /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
            </ul>
            <div className="footer-map">
              <iframe
                src={CONTACT.carte}
                title="Localisation du CeFoPExD"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a href={CONTACT.itineraire} target="_blank" rel="noopener noreferrer" className="footer-route">
              <Navigation size={14} /> Itinéraire vers le centre
            </a>
          </div>
        </div>

        <div className="footer-slogan">Ensemble pour une jeunesse compétente et un avenir meilleur !</div>

        <div className="footer-bottom">
          <span>© {year} CeFoPExD — Tous droits réservés</span>
          <div>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/conditions-utilisation">Conditions d&#39;utilisation</Link>
            <Link href="/confidentialite">Politique de confidentialité</Link>
          </div>
        </div>
      </footer>

      {/* ========== BOUTONS FLOTTANTS : WhatsApp + retour en haut ========== */}
      <div className="floating-actions">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Retour en haut"
          className={`float-btn float-top ${showTop ? "is-visible" : ""}`}
        >
          <ArrowUp size={18} />
        </button>
        <ChatWidget />
        <a
          href={CONTACT.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Discuter sur WhatsApp"
          title="Discuter sur WhatsApp"
          className="float-btn float-whatsapp"
        >
          <WhatsappIcon size={22} />
        </a>
      </div>
    </>
  );
}
