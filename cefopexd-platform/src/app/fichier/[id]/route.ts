import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* =============================================
   TÉLÉCHARGEMENT D'UN DOCUMENT (stockage privé)
   La base vérifie que l'utilisateur a le droit de voir le document,
   puis un lien temporaire (5 min) est généré.
   ?voir=1 : ouvrir dans le navigateur ; sinon téléchargement.
   ============================================= */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const voir = new URL(request.url).searchParams.has("voir");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL(`/connexion?next=/fichier/${id}`, request.url));

  const { data: doc } = await supabase.from("documents").select("bucket, chemin, nom_fichier").eq("id", id).maybeSingle();
  if (!doc) return new NextResponse("Document introuvable ou accès refusé.", { status: 404 });

  const { data, error } = await supabase.storage
    .from(doc.bucket)
    .createSignedUrl(doc.chemin, 300, voir ? undefined : { download: doc.nom_fichier ?? true });
  if (error || !data) return new NextResponse("Accès refusé à ce fichier.", { status: 403 });
  return NextResponse.redirect(data.signedUrl);
}
