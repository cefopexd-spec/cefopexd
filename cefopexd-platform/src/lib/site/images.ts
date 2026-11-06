/* =============================================
   IMAGES DU SITE : les images locales et celles des hébergeurs autorisés
   (Supabase, Unsplash, Google) sont optimisées par Next.js ; une adresse
   venant d'un autre site est affichée telle quelle pour ne jamais planter.
   ============================================= */
const HOTES = [/\.supabase\.co$/i, /^images\.unsplash\.com$/i, /^plus\.unsplash\.com$/i, /^lh3\.googleusercontent\.com$/i];

export function nonOptimise(src: string | null | undefined) {
  if (!src) return true;
  if (src.startsWith("/") && !src.startsWith("//")) return false;
  try {
    const url = new URL(src);
    return !(url.protocol === "https:" && HOTES.some((h) => h.test(url.hostname)));
  } catch {
    return true;
  }
}
