"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MapPin, Phone, Mail, ArrowUp, Navigation, Clock } from "lucide-react";
import SocialIcons, { WhatsappIcon } from "@/components/SocialIcons";
import ChatWidget from "@/components/ChatWidget";
import type { SiteConfig } from "@/lib/site/types";
import { nonOptimise } from "@/lib/site/images";

export type PiedData = {
  logo: string;
  nom: string;
  pied: SiteConfig["pied"];
  contact: SiteConfig["contact"];
  reseaux: SiteConfig["reseaux"];
};

/* =============================================
   PIED DE PAGE (entièrement modifiable dans le Studio du site)
   ============================================= */
export default function Footer({ site }: { site: PiedData }) {
  const { pied, contact } = site;
  const [showTop, setShowTop] = useState(false);
  const annee = String(new Date().getFullYear());

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <footer className="site-footer">
        <div className="container footer-grid" style={{ "--cols": Math.max(pied.colonnes.length, 1) } as React.CSSProperties}>
          {/* ---- Logo + présentation ---- */}
          <div>
            <Link href="/" className="footer-logo" aria-label={`${site.nom} — Accueil`}>
              <Image src={site.logo} unoptimized={nonOptimise(site.logo)} alt={`Logo ${site.nom}`} fill sizes="132px" style={{ objectFit: "contain" }} />
            </Link>
            {pied.texteApropos && <p className="footer-about">{pied.texteApropos}</p>}
            <SocialIcons reseaux={site.reseaux} variant="dark" size={15} />
          </div>

          {/* ---- Colonnes de liens ---- */}
          {pied.colonnes.map((col, i) => (
            <div key={`${col.titre}-${i}`}>
              <h3 className="footer-title">{col.titre}</h3>
              <ul className="footer-links">
                {(col.liens ?? []).map(({ label, href }, j) => (
                  <li key={`${href}-${j}`}><Link href={href || "/"}>{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}

          {/* ---- Contact + localisation ---- */}
          <div>
            <h3 className="footer-title">{pied.titreContact}</h3>
            <ul className="footer-contact">
              <li><MapPin size={16} /><span>{contact.localisation}<br />{contact.adresse}</span></li>
              {contact.telephones.length > 0 && (
                <li>
                  <Phone size={16} />
                  <span>
                    {contact.telephones.map((t) => (
                      <a key={t} href={`tel:${t.replace(/\s/g, "")}`}>{t}<br /></a>
                    ))}
                  </span>
                </li>
              )}
              {contact.email && <li><Mail size={16} /><a href={`mailto:${contact.email}`}>{contact.email}</a></li>}
              {contact.horaires && <li><Clock size={16} /><span>{contact.horaires}</span></li>}
            </ul>
            {pied.afficherCarte && contact.carte && (
              <div className="footer-map">
                <iframe src={contact.carte} title={`Localisation du ${site.nom}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
            {contact.itineraire && (
              <a href={contact.itineraire} target="_blank" rel="noopener noreferrer" className="footer-route">
                <Navigation size={14} /> {pied.texteItineraire}
              </a>
            )}
          </div>
        </div>

        {pied.slogan && <div className="footer-slogan">{pied.slogan}</div>}

        <div className="footer-bottom">
          <span>{pied.copyright.replace("{annee}", annee)}</span>
          <div>
            {pied.liensLegaux.map((l, i) => (
              <Link key={`${l.href}-${i}`} href={l.href || "/"}>{l.label}</Link>
            ))}
          </div>
        </div>
      </footer>

      {/* ========== BOUTONS FLOTTANTS : WhatsApp + assistant + retour en haut ========== */}
      <div className="floating-actions">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Retour en haut"
          className={`float-btn float-top ${showTop ? "is-visible" : ""}`}
        >
          <ArrowUp size={18} />
        </button>
        {pied.assistant && <ChatWidget />}
        {pied.whatsappFlottant && contact.whatsapp && (
          <a
            href={contact.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discuter sur WhatsApp"
            title="Discuter sur WhatsApp"
            className="float-btn float-whatsapp"
          >
            <WhatsappIcon size={22} />
          </a>
        )}
      </div>
    </>
  );
}
