import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Hors ligne", robots: { index: false } };

/* Page affichée par l'application quand il n'y a pas de connexion Internet */
export default function HorsLigne() {
  return (
    <main className="offline">
      <div className="offline-logo"><Image src="/logo-cefopexd.png" alt="CeFoPExD" fill sizes="200px" style={{ objectFit: "contain" }} /></div>
      <h1>Vous êtes hors ligne</h1>
      <p>Vérifiez votre connexion Internet, puis réessayez. Vos données sont en sécurité.</p>
      <a href="/" className="btn-hero-primary">Réessayer</a>
    </main>
  );
}
