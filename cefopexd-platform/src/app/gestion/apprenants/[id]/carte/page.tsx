import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import { CarteRecto, CarteVerso } from "@/components/CarteEtudiant";
import { requireGestion } from "@/lib/session";
import { getSite } from "@/lib/site";
import { CHAMPS_CARTE, preparerCartes } from "@/lib/cartes";

export const metadata: Metadata = { title: "Carte d'étudiant" };

type Props = { params: Promise<{ id: string }> };

/* =============================================
   CARTE D'ÉTUDIANT D'UN APPRENANT — imprimable / PDF
   ============================================= */
export default async function CarteApprenant({ params }: Props) {
  const { id } = await params;
  const [{ supabase }, site] = await Promise.all([requireGestion("apprenants"), getSite()]);
  const { data } = await supabase.from("apprenants").select(CHAMPS_CARTE).eq("id", id).maybeSingle();
  if (!data) notFound();
  const [a] = await preparerCartes(supabase, [data]);

  return (
    <div className="doc-page">
      <div className="doc-toolbar no-print">
        <Link href={`/gestion/apprenants/${id}`} className="g-back">← Retour à la fiche</Link>
        <PrintButton label="Imprimer la carte / PDF" />
      </div>
      {!a.photo && (
        <p className="g-alert no-print">Aucune photo pour cet apprenant : ajoutez-la depuis sa fiche (« Photo de la carte »), puis rechargez cette page.</p>
      )}
      <div className="cartes-planche cartes-une">
        <CarteRecto a={a} site={site} />
        {site.carte.afficherVerso && <CarteVerso a={a} site={site} />}
      </div>
      <p className="no-print g-hint">
        Conseil : dans la fenêtre d&#39;impression, choisissez « Enregistrer au format PDF » ou votre imprimante, échelle 100 %, sans marges.
        Le modèle (couleurs, textes) se règle dans le Studio du site, onglet « Carte d&#39;étudiant ».
      </p>
    </div>
  );
}
