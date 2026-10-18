"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Share, X } from "lucide-react";

/* =============================================
   APPLICATION INSTALLABLE
   - enregistre le service worker
   - Android / Chrome / Edge : bouton « Installer l'application »
   - iPhone / iPad (Safari) : explication « Partager → Sur l'écran d'accueil »
   Le bandeau ne réapparaît pas pendant 14 jours après avoir été fermé.
   ============================================= */
type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const CLE = "cefopexd-install-ferme";

export default function AppInstall() {
  const [invite, setInvite] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const installee = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone;
    let ferme = 0;
    try { ferme = Number(localStorage.getItem(CLE) ?? 0); } catch { /* stockage indisponible */ }
    const recent = Date.now() - ferme < 14 * 24 * 3600 * 1000;
    if (installee || recent) return;

    const surInvite = (e: Event) => {
      e.preventDefault();
      setInvite(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", surInvite);
    const estIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
    if (estIos) {
      setIos(true);
      const t = setTimeout(() => setVisible(true), 4000);
      return () => { clearTimeout(t); window.removeEventListener("beforeinstallprompt", surInvite); };
    }
    return () => window.removeEventListener("beforeinstallprompt", surInvite);
  }, []);

  const fermer = () => {
    setVisible(false);
    try { localStorage.setItem(CLE, String(Date.now())); } catch { /* stockage indisponible */ }
  };

  const installer = async () => {
    if (!invite) return;
    await invite.prompt();
    await invite.userChoice;
    setInvite(null);
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <div className="install-banner" role="dialog" aria-label="Installer l'application CeFoPExD">
      <span className="install-icon"><Image src="/icons/icon-192.png" alt="" fill sizes="44px" /></span>
      <div className="install-text">
        <strong>Installer l&#39;application CeFoPExD</strong>
        {ios && !invite ? (
          <span>Touchez <Share size={13} aria-label="Partager" /> puis « Sur l&#39;écran d&#39;accueil ».</span>
        ) : (
          <span>Accès direct depuis votre écran d&#39;accueil, comme une vraie application.</span>
        )}
      </div>
      {invite && (
        <button type="button" className="btn-hero-primary btn-sm" onClick={installer}><Download size={15} /> Installer</button>
      )}
      <button type="button" className="install-close" onClick={fermer} aria-label="Fermer"><X size={16} /></button>
    </div>
  );
}
