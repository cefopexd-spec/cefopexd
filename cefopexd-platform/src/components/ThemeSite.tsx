import type { SiteConfig } from "@/lib/site/types";

/* =============================================
   THÈME DU SITE : couleurs, polices et arrondis choisis dans le Studio
   (variables CSS injectées par-dessus celles de globals.css)
   ============================================= */
export const POLICES: Record<string, string | null> = {
  "Plus Jakarta Sans": null, // chargée par défaut (next/font)
  Inter: null, // chargée par défaut (next/font)
  Poppins: "Poppins:wght@400;500;600;700;800",
  Montserrat: "Montserrat:wght@400;500;600;700;800",
  Roboto: "Roboto:wght@400;500;700;900",
  "Open Sans": "Open+Sans:wght@400;500;600;700;800",
  Lato: "Lato:wght@400;700;900",
  Nunito: "Nunito:wght@400;600;700;800",
  Raleway: "Raleway:wght@400;500;600;700;800",
  Merriweather: "Merriweather:wght@400;700;900",
  "Playfair Display": "Playfair+Display:wght@500;600;700;800",
  Ubuntu: "Ubuntu:wght@400;500;700",
};

const COULEUR = /^#[0-9a-f]{3,8}$|^rgba?\([\d\s.,%]+\)$/i;
const propre = (css: string) => css.replace(/<\/?style/gi, "");

function famille(nom: string, parDefaut: string) {
  if (nom === "Plus Jakarta Sans") return "var(--font-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif";
  if (nom === "Inter") return "var(--font-inter), 'Inter', system-ui, sans-serif";
  return nom in POLICES ? `'${nom}', system-ui, sans-serif` : parDefaut;
}

export default function ThemeSite({ site }: { site: SiteConfig }) {
  const { couleurs, policeTitres, policeTexte, arrondi, cssPerso } = site.theme;
  const vars = Object.entries(couleurs ?? {})
    .filter(([cle, v]) => /^[a-z0-9-]+$/.test(cle) && COULEUR.test(String(v).trim()))
    .map(([cle, v]) => `--${cle}:${String(v).trim()};`);
  const r = Math.min(Math.max(Number(arrondi) || 12, 0), 40);
  vars.push(`--radius-sm:${Math.round(r * 0.66)}px;--radius-md:${r}px;--radius-lg:${Math.round(r * 1.33)}px;--radius-xl:${r * 2}px;`);
  vars.push(`--font-display:${famille(policeTitres, "var(--font-jakarta), system-ui, sans-serif")};`);
  vars.push(`--font-body:${famille(policeTexte, "var(--font-inter), system-ui, sans-serif")};`);

  const aCharger = [...new Set([policeTitres, policeTexte])].map((p) => POLICES[p]).filter(Boolean);
  const css = `:root{${vars.join("")}}body[class]{font-family:var(--font-body);}${propre(cssPerso ?? "")}`;

  return (
    <>
      {aCharger.length > 0 && (
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${aCharger.map((f) => `family=${f}`).join("&")}&display=swap`} />
      )}
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}
