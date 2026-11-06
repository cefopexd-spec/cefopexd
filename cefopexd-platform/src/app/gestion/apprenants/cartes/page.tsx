import type { Metadata } from "next";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";
import { CarteRecto, CarteVerso } from "@/components/CarteEtudiant";
import { requireGestion } from "@/lib/session";
import { getSite } from "@/lib/site";
import { CHAMPS_CARTE, preparerCartes } from "@/lib/cartes";

export const metadata: Metadata = { title: "Cartes d'étudiant" };

type Props = { searchParams: Promise<{ filiere?: string; annee?: string; statut?: string; face?: string }> };

/* =============================================
   CARTES D'ÉTUDIANT EN SÉRIE — planches A4 de 10 cartes
   Filtrer par filière / année, imprimer les rectos puis les versos.
   ============================================= */
export default async function PlanchesCartes({ searchParams }: Props) {
  const { filiere = "", annee = "", statut = "actif", face = "recto" } = await searchParams;
  const [{ supabase }, site] = await Promise.all([requireGestion("apprenants"), getSite()]);

  let requete = supabase.from("apprenants").select(CHAMPS_CARTE).order("nom").limit(400);
  if (filiere) requete = requete.eq("filiere_id", filiere);
  if (annee) requete = requete.eq("annee_academique", annee);
  if (statut) requete = requete.eq("statut", statut);

  const [{ data }, { data: filieres }] = await Promise.all([requete, supabase.from("filieres").select("id, nom").order("nom")]);
  const cartes = await preparerCartes(supabase, data ?? []);
  const sansPhoto = cartes.filter((c) => !c.photo).length;

  // Planches de 10 cartes (2 colonnes × 5 lignes)
  const planches: (typeof cartes)[] = [];
  for (let i = 0; i < cartes.length; i += 10) planches.push(cartes.slice(i, i + 10));
  const verso = face === "verso" && site.carte.afficherVerso;

  return (
    <div className="doc-page">
      <div className="doc-toolbar no-print">
        <Link href="/gestion/apprenants" className="g-back">← Apprenants</Link>
        <PrintButton label={`Imprimer ${cartes.length} carte(s) — ${verso ? "versos" : "rectos"}`} />
      </div>

      <form className="g-filtres no-print" method="get">
        <label className="field"><span>Filière</span>
          <select name="filiere" defaultValue={filiere}>
            <option value="">Toutes</option>
            {(filieres ?? []).map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
          </select>
        </label>
        <label className="field"><span>Année académique</span>
          <input name="annee" defaultValue={annee} placeholder={site.carte.anneeParDefaut} />
        </label>
        <label className="field"><span>Statut</span>
          <select name="statut" defaultValue={statut}>
            <option value="actif">Actifs</option><option value="">Tous</option>
            <option value="suspendu">Suspendus</option><option value="diplome">Diplômés</option>
          </select>
        </label>
        {site.carte.afficherVerso && (
          <label className="field"><span>Face à imprimer</span>
            <select name="face" defaultValue={face}>
              <option value="recto">Rectos</option><option value="verso">Versos</option>
            </select>
          </label>
        )}
        <button type="submit" className="btn-hero-primary btn-sm">Afficher</button>
      </form>

      {sansPhoto > 0 && (
        <p className="g-alert no-print">{sansPhoto} apprenant(s) sans photo : la case photo restera vide. Ajoutez les photos depuis les fiches des apprenants.</p>
      )}
      {cartes.length === 0 && <p className="g-empty no-print">Aucun apprenant ne correspond à ces critères.</p>}
      {verso && <p className="g-hint no-print">Imprimez d&#39;abord les rectos, retournez les feuilles, puis imprimez les versos : l&#39;ordre des colonnes est inversé pour tomber au dos de chaque carte.</p>}

      {planches.map((p, i) => (
        <div key={i} className="cartes-planche">
          {verso
            ? // Au verso, chaque ligne est inversée (gauche ↔ droite) pour tomber au dos de la bonne carte
              Array.from({ length: Math.ceil(p.length / 2) }, (_, r) => [p[r * 2 + 1], p[r * 2]]).flat().map((a, j) =>
                a ? <CarteVerso key={`${a.id}-v`} a={a} site={site} /> : <div key={`vide-${j}`} className="carte-vide" aria-hidden="true" />
              )
            : p.map((a) => <CarteRecto key={a.id} a={a} site={site} />)}
        </div>
      ))}
    </div>
  );
}
