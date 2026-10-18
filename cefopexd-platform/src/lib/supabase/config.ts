/* =============================================
   CONFIGURATION SUPABASE
   Les valeurs viennent des variables d'environnement (Vercel / .env.local).
   Elles sont nettoyées pour tolérer les erreurs de copier-coller courantes :
   espaces, guillemets, "https://" incomplet ou absent.
   ============================================= */
function cleanValue(value: string | undefined): string {
  return (value ?? "").trim().replace(/^["']|["']$/g, "").trim();
}

function normalizeUrl(value: string | undefined): string {
  let url = cleanValue(value).replace(/\/+$/, "");
  if (!url) return url;
  url = url.replace(/^(h?t?t?p?s?:?\/*)(?=[a-z0-9-]+\.supabase\.co)/i, "");
  return url.startsWith("http") ? url : `https://${url}`;
}

export const SUPABASE_URL = normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const SUPABASE_ANON_KEY = cleanValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
