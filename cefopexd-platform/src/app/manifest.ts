import type { MetadataRoute } from "next";

/* =============================================
   APPLICATION INSTALLABLE (téléphone, iPhone, tablette, ordinateur)
   ============================================= */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "CeFoPExD — Centre de Formation Professionnelle d'Excellence",
    short_name: "CeFoPExD",
    description: "Inscriptions, scolarité, messagerie et gestion du CeFoPExD.",
    lang: "fr",
    start_url: "/mon-espace?source=application",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0B1C94",
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Messagerie", url: "/messagerie", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Mon espace", url: "/mon-espace", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Gestion", url: "/gestion", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
