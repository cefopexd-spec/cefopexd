import { Download, Eye, FileText } from "lucide-react";
import { CATEGORIES_DOCUMENT, dateHeure } from "@/lib/roles";
import { tailleLisible } from "@/lib/fichiers";

export type DocumentDb = {
  id: string; categorie: string; titre: string | null; nom_fichier: string | null; taille: number | null;
  type_mime: string | null; created_at: string; proprietaire?: { prenom: string | null; nom: string | null; pseudo: string } | null;
};

/* Liste de documents avec consultation et téléchargement */
export default function ListeDocuments({ documents, avecAuteur }: { documents: DocumentDb[]; avecAuteur?: boolean }) {
  if (!documents.length) return <p className="g-empty">Aucun document.</p>;
  return (
    <ul className="doc-list">
      {documents.map((d) => (
        <li key={d.id}>
          <span className="doc-list-ico"><FileText size={18} /></span>
          <div>
            <strong>{d.titre || d.nom_fichier}</strong>
            <span>
              {CATEGORIES_DOCUMENT[d.categorie] ?? d.categorie} · {tailleLisible(d.taille)} · déposé le {dateHeure(d.created_at)}
              {avecAuteur && d.proprietaire ? ` · par ${[d.proprietaire.prenom, d.proprietaire.nom].filter(Boolean).join(" ") || d.proprietaire.pseudo}` : ""}
            </span>
          </div>
          <div className="doc-list-actions">
            <a href={`/fichier/${d.id}?voir=1`} target="_blank" rel="noopener noreferrer" className="g-icon-btn" aria-label="Consulter"><Eye size={15} /></a>
            <a href={`/fichier/${d.id}`} className="g-icon-btn" aria-label="Télécharger"><Download size={15} /></a>
          </div>
        </li>
      ))}
    </ul>
  );
}
