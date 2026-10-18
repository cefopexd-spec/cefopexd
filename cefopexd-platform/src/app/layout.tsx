import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

/* Polices Google : Plus Jakarta Sans (titres) + Inter (texte) */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

/* Affichage mobile : largeur de l'appareil, encoche iPhone, thème clair (pas d'assombrissement forcé) */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cefopexd.com"),
  title: {
    default: "CeFoPExD — Centre de Formation Professionnelle d'Excellence de Dévikinmé",
    template: "%s | CeFoPExD",
  },
  description:
    "Le CeFoPExD offre des formations professionnelles d'excellence à Lomé, Togo : Informatique, Mécatronique, Agro-alimentaire, Énergie renouvelable, Langue allemande.",
  keywords: ["formation professionnelle", "Togo", "Lomé", "CeFoPExD"],
  openGraph: {
    type: "website",
    locale: "fr_TG",
    url: "https://www.cefopexd.com",
    siteName: "CeFoPExD",
    title: "CeFoPExD — Formations Professionnelles d'Excellence",
    description: "Votre avenir professionnel commence ici !",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-mark.png",
    apple: "/logo-mark.png",
  },
};

/* Données structurées JSON-LD */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "CeFoPExD — Centre de Formation Professionnelle d'Excellence de Dévikinmé",
  url: "https://www.cefopexd.com",
  logo: "https://www.cefopexd.com/logo-cefopexd.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rue Okeloukoutou",
    addressLocality: "Lomé",
    addressCountry: "TG",
  },
  contactPoint: [
    { "@type": "ContactPoint", telephone: "+228-70-88-13-06", contactType: "customer service" },
    { "@type": "ContactPoint", telephone: "+228-79-95-20-20", contactType: "customer service" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
