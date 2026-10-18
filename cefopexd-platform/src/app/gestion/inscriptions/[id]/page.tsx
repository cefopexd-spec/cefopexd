import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Printer } from "lucide-react";
import ActionForm from "@/components/forms/ActionForm";
import { Field, TextAreaField } from "@/components/forms/SupabaseForm";
import { requireGestion, nomComplet } from "@/lib/session";
import { PIECES, STATUTS_INSCRIPTION, dateHeure, typeLabel } from "@/lib/roles";
import ListeDocuments, { type DocumentDb } from "@/components/ListeDocuments";
import { urlsPhotos } from "@/lib/fichiers";
import {
  enregistrerDossier, enregistrerNotes, prendreEnCharge, refuserInscription,
  soumettreDG, transmettreAdmin, validerInscription,
} from "../../actions";

export const metadata: Metadata = { title: "Dossier d'inscription" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ valide?: string }> };


/* =============================================
   DOSSIER D'INSCRIPTION — étapes du circuit et fiche définitive
   ============================================= */
export default async function InscriptionDetail({ params, searchParams }: Props) {
  const { id } = await params;
  const { valide } = await searchParams;
  const { supabase, role } = await requireGestion("inscriptions");
  const [{ data: ins }, { data: filieres }] = await Promise.all([
    supabase.from("inscriptions").select("*, traite:profils!inscriptions_traite_par_fkey(prenom, nom, pseudo), complete:profils!inscriptions_complete_par_fkey(prenom, nom, pseudo)").eq("id", id).maybeSingle(),
    supabase.from("filieres").select("slug, nom").eq("active", true).order("nom"),
  ]);
  if (!ins) notFound();
  const [{ data: docs }, photos] = await Promise.all([
    supabase.from("documents").select("id, categorie, titre, nom_fichier, taille, type_mime, created_at").eq("inscription_id", id).order("created_at"),
    urlsPhotos(supabase, [ins.photo_path]),
  ]);
  const photo = ins.photo_path ? photos.get(ins.photo_path) : null;

  const s = STATUTS_INSCRIPTION[ins.statut] ?? STATUTS_INSCRIPTION.en_attente;
  const d = (ins.dossier ?? {}) as Record<string, string | string[] | null>;
  const filiereParDefaut = (d.filiere_slug as string) ?? filieres?.find((f) => f.nom === ins.filiere)?.slug ?? "";
  const peutSecretariat = ["secretaire", "admin", "dg"].includes(role);
  const peutAdmin = ["admin", "dg"].includes(role);
  const dossierRempli = !!ins.dossier;

  return (
    <>
      <div className="g-page-head">
        <Link href="/gestion/inscriptions" className="g-back">← Toutes les inscriptions</Link>
        <h1>{ins.prenom} {ins.nom}</h1>
        <p>Réf. INS-{ins.id.slice(0, 8).toUpperCase()} · reçue le {new Date(ins.created_at).toLocaleDateString("fr-FR")} · <span className={`statut ${s.className}`}>{s.label}</span></p>
      </div>

      {valide && (
        <div className="form-ok" role="status"><CheckCircle size={18} /><span>Inscription validée : l&#39;apprenant a été créé avec son matricule. Vous pouvez imprimer la fiche.</span></div>
      )}

      {/* Étapes */}
      <ol className="g-steps">
        {["Reçue", "Secrétariat", "Administration", "Soumise au DG", ins.statut === "refuse" ? "Refusée" : "Validée"].map((label, i) => (
          <li key={label} className={s.etape > i + 1 || (s.etape === 5 && i === 4) ? "is-done" : s.etape === i + 1 ? "is-current" : ""}>
            <span>{i + 1}</span>{label}
          </li>
        ))}
      </ol>

      <div className="g-grid-2">
        {/* Demande reçue */}
        <div className="g-card">
          <div className="g-card-head"><h2>Demande en ligne</h2></div>
          <div className="g-account-id">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={`Photo d'identité de ${ins.prenom} ${ins.nom}`} className="g-id-photo" />
            ) : <span className="profile-initial">{ins.prenom.charAt(0)}</span>}
            <div><strong>{ins.prenom} {ins.nom}</strong><p className="field-hint">Reçue le {dateHeure(ins.created_at)}{ins.valide_le ? ` · validée le ${dateHeure(ins.valide_le)}` : ""}</p></div>
          </div>
          <div className="g-kv">
            <div><span>Profil</span><strong>{typeLabel(ins.type_demandeur)}</strong></div>
            <div><span>Filière souhaitée</span><strong>{ins.filiere}</strong></div>
            <div><span>Niveau</span><strong>{ins.niveau_etude ?? "—"}</strong></div>
            <div><span>Naissance</span><strong>{ins.date_naissance ? new Date(ins.date_naissance).toLocaleDateString("fr-FR") : "—"} {ins.lieu_naissance ? `à ${ins.lieu_naissance}` : ""}</strong></div>
            <div><span>Téléphone</span><strong><a href={`tel:${ins.telephone}`}>{ins.telephone}</a></strong></div>
            <div><span>E-mail</span><strong>{ins.email ?? "—"}</strong></div>
          </div>
          {ins.motif && <p className="g-motif"><strong>Motif :</strong> {ins.motif}</p>}
          <h3 className="form-section-title">Documents joints</h3>
          <ListeDocuments documents={(docs ?? []) as DocumentDb[]} />
          {ins.message && <p className="g-motif"><strong>Message :</strong> {ins.message}</p>}
          <p className="field-hint">
            {ins.traite ? `Traitée par ${nomComplet(ins.traite)}. ` : ""}
            {ins.complete ? `Dossier complété par ${nomComplet(ins.complete)}.` : ""}
          </p>
        </div>

        {/* Actions selon l'étape et le rôle */}
        <div className="g-card">
          <div className="g-card-head"><h2>Actions</h2></div>
          <div className="g-actions">
            {ins.statut === "en_attente" && peutSecretariat && (
              <form action={prendreEnCharge.bind(null, ins.id)}><button className="btn-hero-primary btn-sm">Prendre en charge (secrétariat)</button></form>
            )}
            {["en_attente", "en_traitement"].includes(ins.statut) && peutSecretariat && (
              <form action={transmettreAdmin.bind(null, ins.id)}><button className="btn-hero-ghost btn-sm">Transmettre à l&#39;administration</button></form>
            )}
            {ins.statut === "transmis_admin" && peutAdmin && dossierRempli && (
              <form action={soumettreDG.bind(null, ins.id)}><button className="btn-hero-primary btn-sm">Soumettre le dossier au DG</button></form>
            )}
            {ins.statut === "transmis_admin" && peutAdmin && !dossierRempli && (
              <p className="field-hint">Remplissez la fiche d&#39;inscription définitive ci-dessous, puis soumettez-la au DG.</p>
            )}
            {ins.statut === "dossier_complet" && role === "dg" && (
              <form action={validerInscription.bind(null, ins.id)}><button className="btn-hero-primary btn-sm">Valider l&#39;inscription</button></form>
            )}
            {(dossierRempli || ins.statut === "valide") && (
              <Link href={`/gestion/inscriptions/${ins.id}/fiche`} className="btn-hero-ghost btn-sm" target="_blank">
                <Printer size={15} /> Fiche d&#39;inscription (PDF)
              </Link>
            )}
            {ins.apprenant_id && <Link href={`/gestion/apprenants/${ins.apprenant_id}`} className="btn-hero-ghost btn-sm">Voir la fiche apprenant</Link>}
          </div>

          <ActionForm action={enregistrerNotes} submitLabel="Enregistrer les notes" className="g-form" submitClassName="btn-hero-ghost btn-sm">
            <input type="hidden" name="id" value={ins.id} />
            <TextAreaField label="Notes du secrétariat (appels, rendez-vous, pièces reçues…)" name="notes" defaultValue={ins.notes_secretariat ?? ""} rows={4} />
          </ActionForm>

          {ins.statut === "dossier_complet" && role === "dg" && (
            <details className="g-details">
              <summary>Refuser la demande</summary>
              <ActionForm action={refuserInscription} submitLabel="Confirmer le refus" className="g-form" submitClassName="btn-hero-red btn-sm">
                <input type="hidden" name="id" value={ins.id} />
                <TextAreaField label="Motif du refus" name="motif_refus" required rows={3} />
              </ActionForm>
            </details>
          )}
        </div>
      </div>

      {/* Fiche d'inscription définitive (administration) */}
      {(peutAdmin && ["transmis_admin", "dossier_complet"].includes(ins.statut)) || dossierRempli ? (
        <div className="g-card">
          <div className="g-card-head"><h2>Fiche d&#39;inscription définitive</h2></div>
          <ActionForm action={enregistrerDossier} submitLabel="Enregistrer le dossier" className="g-form" submitClassName="btn-hero-primary btn-sm">
            <input type="hidden" name="id" value={ins.id} />
            <h3 className="form-section-title">Apprenant</h3>
            <div className="form-grid">
              <label className="field"><span>Sexe</span>
                <select name="sexe" defaultValue={(d.sexe as string) ?? ""}><option value="">—</option><option value="F">Féminin</option><option value="M">Masculin</option></select>
              </label>
              <Field label="Nationalité" name="nationalite" defaultValue={(d.nationalite as string) ?? "Togolaise"} />
              <Field label="Adresse" name="adresse" defaultValue={(d.adresse as string) ?? ""} />
              <label className="field"><span>Filière retenue</span>
                <select name="filiere_slug" defaultValue={filiereParDefaut}>
                  {(filieres ?? []).map((f) => <option key={f.slug} value={f.slug}>{f.nom}</option>)}
                </select>
              </label>
              <Field label="Niveau d'étude" name="niveau_etude" defaultValue={(d.niveau_etude as string) ?? ins.niveau_etude ?? ""} />
              <Field label="Année académique" name="annee_academique" defaultValue={(d.annee_academique as string) ?? anneeAcademique()} />
            </div>
            <h3 className="form-section-title">Parent / tuteur</h3>
            <div className="form-grid">
              <Field label="Nom complet" name="tuteur_nom" defaultValue={(d.tuteur_nom as string) ?? ""} />
              <Field label="Lien avec l'apprenant" name="tuteur_lien" defaultValue={(d.tuteur_lien as string) ?? ""} placeholder="Père, mère, tuteur…" />
              <Field label="Téléphone" name="tuteur_telephone" defaultValue={(d.tuteur_telephone as string) ?? ""} />
              <Field label="E-mail" name="tuteur_email" defaultValue={(d.tuteur_email as string) ?? ""} />
            </div>
            <h3 className="form-section-title">Pièces fournies</h3>
            <div className="g-checks">
              {PIECES.map((p) => (
                <label key={p}><input type="checkbox" name="pieces" value={p} defaultChecked={(d.pieces as string[] | undefined)?.includes(p)} /> {p}</label>
              ))}
            </div>
            <TextAreaField label="Observations" name="observations" defaultValue={(d.observations as string) ?? ""} rows={3} />
          </ActionForm>
        </div>
      ) : null}
    </>
  );
}

function anneeAcademique() {
  const now = new Date();
  const debut = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${debut}-${debut + 1}`;
}
