import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, CalendarClock, FileText, FolderOpen, KeyRound, LayoutDashboard, LogOut, Mail, MessageSquare, MessagesSquare, Users } from "lucide-react";
import FileUpload from "@/components/forms/FileUpload";
import ListeDocuments, { type DocumentDb } from "@/components/ListeDocuments";
import { TextAreaField } from "@/components/forms/SupabaseForm";
import { urlsPhotos } from "@/lib/fichiers";
import PageHeader from "@/components/PageHeader";
import ActionForm from "@/components/forms/ActionForm";
import Notifications, { type Notification } from "@/components/Notifications";
import { Field } from "@/components/forms/SupabaseForm";
import { nomComplet, requireProfil, roleActif } from "@/lib/session";
import { CATEGORIES_DOCUMENT, ROLES_PERSONNEL, STATUTS_INSCRIPTION, dateHeure, roleLabel, typeLabel } from "@/lib/roles";
import { ajouterDocuments, changerMotDePasse, modifierProfil } from "../mon-compte/actions";
import { deposerDemande, lierEnfant } from "./actions";

export const metadata: Metadata = { title: "Mon espace", robots: { index: false } };

const TYPES_DEMANDE: Record<string, string> = { permission: "Permission", absence: "Absence", retard: "Retard", autre: "Demande" };
const STATUT_PRESENCE: Record<string, string> = { present: "Présent", absent: "Absent", retard: "En retard", excuse: "Absence excusée" };
const dateFr = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

type Apprenant = { id: string; matricule: string; nom: string; prenom: string; niveau_etude: string | null; filieres: { nom: string } | null };
type Presence = { apprenant_id: string; jour: string; statut: string; motif: string | null };

/* =============================================
   ESPACE PERSONNEL — adapté au rôle attribué par le DG
   ============================================= */
export default async function MonEspacePage() {
  const { supabase, user, profil } = await requireProfil("/mon-espace");
  const role = roleActif(profil);
  const estPersonnel = !!role && ROLES_PERSONNEL.includes(role);

  const [{ data: notifications }, { data: demandes }, { data: enfantsLiens }, { data: monDossier }] = await Promise.all([
    supabase.from("notifications").select("*").eq("destinataire_id", user.id).order("created_at", { ascending: false }).limit(8),
    supabase.from("inscriptions").select("id, filiere, niveau_etude, statut, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("parents_apprenants").select("lien, apprenants(id, matricule, nom, prenom, niveau_etude, filieres(nom))").eq("parent_id", user.id),
    supabase.from("apprenants").select("id, matricule, nom, prenom, niveau_etude, filieres(nom)").eq("profil_id", user.id).maybeSingle<Apprenant>(),
  ]);

  const enfants = ((enfantsLiens ?? []) as unknown as { lien: string | null; apprenants: Apprenant }[]).map((l) => ({ ...l.apprenants, lien: l.lien }));
  const suivis: Apprenant[] = [...(monDossier ? [monDossier] : []), ...enfants];
  const { data: presences } = suivis.length
    ? await supabase.from("presences").select("apprenant_id, jour, statut, motif").in("apprenant_id", suivis.map((a) => a.id)).neq("statut", "present").order("jour", { ascending: false }).limit(60)
    : { data: [] as Presence[] };

  const afficherParent = role === "parent" || profil.type_demandeur === "parent" || enfants.length > 0;
  const peutDemander = !!role && (suivis.length > 0 || role === "apprenant" || role === "parent");
  const compteMotDePasse = (user.identities ?? []).some((i) => i.provider === "email");

  const [{ data: mesDocuments }, { data: mesDemandes }, photos] = await Promise.all([
    supabase.from("documents").select("id, categorie, titre, nom_fichier, taille, type_mime, created_at").eq("proprietaire_id", user.id).order("created_at", { ascending: false }),
    supabase.from("demandes").select("id, type, date_debut, date_fin, statut, motif, reponse, traite_le, created_at").eq("demandeur_id", user.id).order("created_at", { ascending: false }).limit(20),
    urlsPhotos(supabase, [profil.photo_path]),
  ]);
  const maPhoto = (profil.photo_path && photos.get(profil.photo_path)) || profil.photo_url;

  return (
    <>
      <PageHeader
        title={`Bonjour ${profil.prenom || profil.pseudo} !`}
        intro="Votre espace personnel CeFoPExD : profil, demandes, scolarité, messages et notifications."
        crumbs={[{ label: "Mon espace" }]}
      />
      <section className="section">
        <div className="container space-layout">
          {/* ---- Colonne principale ---- */}
          <div className="space-main">
            {profil.statut === "en_attente" && (
              <div className="form-notice">
                <Users size={20} />
                <div>
                  <strong>Compte en attente de validation</strong>
                  <p>La direction examine votre demande ({typeLabel(profil.type_demandeur)}). Vous serez notifié(e) dès que votre accès sera attribué.</p>
                </div>
              </div>
            )}

            {estPersonnel && (
              <Link href="/gestion" className="space-gestion">
                <LayoutDashboard size={22} />
                <div><strong>Espace de gestion</strong><span>{roleLabel(role!)} — accéder à vos rubriques</span></div>
                <ArrowRight size={18} />
              </Link>
            )}

            <Notifications items={(notifications ?? []) as Notification[]} />

            {/* Scolarité de l'apprenant */}
            {monDossier && (
              <div className="g-card">
                <div className="g-card-head"><h2><CalendarCheck size={18} /> Ma scolarité</h2></div>
                <div className="g-kv">
                  <div><span>Matricule</span><strong>{monDossier.matricule}</strong></div>
                  <div><span>Filière</span><strong>{monDossier.filieres?.nom ?? "—"}</strong></div>
                  <div><span>Niveau</span><strong>{monDossier.niveau_etude ?? "—"}</strong></div>
                </div>
                <PresenceListe items={(presences ?? []).filter((p) => p.apprenant_id === monDossier.id)} />
              </div>
            )}

            {/* Espace parent */}
            {afficherParent && (
              <div className="g-card">
                <div className="g-card-head"><h2><Users size={18} /> Mes enfants</h2></div>
                {enfants.length === 0 && <p className="g-empty">Aucun enfant rattaché pour le moment.</p>}
                {enfants.map((e) => (
                  <div key={e.id} className="g-child">
                    <div className="g-kv">
                      <div><span>Élève</span><strong>{e.prenom} {e.nom}</strong></div>
                      <div><span>Matricule</span><strong>{e.matricule}</strong></div>
                      <div><span>Filière</span><strong>{e.filieres?.nom ?? "—"}</strong></div>
                    </div>
                    <PresenceListe items={(presences ?? []).filter((p) => p.apprenant_id === e.id)} />
                  </div>
                ))}
                <details className="g-details" open={enfants.length === 0}>
                  <summary>Rattacher un enfant</summary>
                  <p className="field-hint">Le matricule figure sur la fiche d&#39;inscription de l&#39;élève (format CEF-AA-0000). La date de naissance sert de vérification.</p>
                  <ActionForm action={lierEnfant} submitLabel="Rattacher" className="g-form" submitClassName="btn-hero-primary btn-sm">
                    <div className="form-grid">
                      <Field label="Matricule de l'élève" name="matricule" required placeholder="CEF-26-0001" />
                      <Field label="Date de naissance de l'élève" name="date_naissance" type="date" required />
                      <Field label="Votre lien avec l'élève" name="lien" placeholder="Mère, père, tuteur…" />
                    </div>
                  </ActionForm>
                </details>
              </div>
            )}

            {/* Pré-inscriptions */}
            <div className="g-card">
              <div className="g-card-head">
                <h2><FileText size={18} /> Mes pré-inscriptions</h2>
                <Link href="/inscription/formulaire" className="btn-hero-red btn-sm">Nouvelle demande <ArrowRight size={15} /></Link>
              </div>
              {demandes && demandes.length > 0 ? (
                <div className="demande-list">
                  {demandes.map((d) => {
                    const statut = STATUTS_INSCRIPTION[d.statut ?? "en_attente"] ?? STATUTS_INSCRIPTION.en_attente;
                    return (
                      <article key={d.id} className="demande">
                        <div className="demande-ico"><FileText size={20} /></div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <strong>{d.filiere}</strong>
                          <span>Réf. INS-{String(d.id).slice(0, 8).toUpperCase()} · {d.niveau_etude} · {dateFr(d.created_at)}</span>
                        </div>
                        <span className={`statut ${statut.className}`}>{statut.label}</span>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="g-empty">Aucune pré-inscription pour le moment.</p>
              )}
            </div>

            {/* Permissions, absences, retards */}
            {peutDemander && (
              <div className="g-card">
                <div className="g-card-head"><h2><CalendarClock size={18} /> Permissions, absences & retards</h2></div>
                {(mesDemandes ?? []).length > 0 && (
                  <ul className="g-notifs">
                    {(mesDemandes ?? []).map((d) => (
                      <li key={d.id}>
                        <div>
                          <strong>{TYPES_DEMANDE[d.type]} — du {new Date(d.date_debut).toLocaleDateString("fr-FR")}{d.date_fin && d.date_fin !== d.date_debut ? ` au ${new Date(d.date_fin).toLocaleDateString("fr-FR")}` : ""}</strong>
                          <span>{d.motif}</span>
                          <small>
                            Envoyée le {dateHeure(d.created_at)}
                            {d.traite_le ? ` · ${d.statut === "approuvee" ? "acceptée" : "refusée"} le ${dateHeure(d.traite_le)}` : ""}
                            {d.reponse ? ` — « ${d.reponse} »` : ""}
                          </small>
                        </div>
                        <span className={`statut ${d.statut === "approuvee" ? "is-ok" : d.statut === "refusee" ? "is-ko" : "is-pending"}`}>
                          {d.statut === "approuvee" ? "Acceptée" : d.statut === "refusee" ? "Refusée" : "En attente"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <details className="g-details" open={(mesDemandes ?? []).length === 0}>
                  <summary>Nouvelle demande</summary>
                  <ActionForm action={deposerDemande} submitLabel="Envoyer au secrétariat" className="g-form" submitClassName="btn-hero-primary btn-sm">
                    <div className="form-grid">
                      <label className="field"><span>Type de demande<em> *</em></span>
                        <select name="type" required defaultValue="">
                          <option value="" disabled>— Choisir —</option>
                          <option value="permission">Permission de sortie / d&#39;absence</option>
                          <option value="absence">Justification d&#39;une absence</option>
                          <option value="retard">Retard</option>
                          <option value="autre">Autre</option>
                        </select>
                      </label>
                      {suivis.length > 0 && (
                        <label className="field"><span>Apprenant concerné</span>
                          <select name="apprenant_id" defaultValue={suivis[0].id}>
                            {suivis.map((a) => <option key={a.id} value={a.id}>{a.prenom} {a.nom} ({a.matricule})</option>)}
                          </select>
                        </label>
                      )}
                      <Field label="Date (début)" name="date_debut" type="date" required />
                      <Field label="Date de fin (si plusieurs jours)" name="date_fin" type="date" />
                      <Field label="Heure (retard ou sortie)" name="heure" type="time" />
                      <TextAreaField label="Motif" name="motif" required rows={3} />
                    </div>
                  </ActionForm>
                </details>
              </div>
            )}

            {/* Mes documents */}
            <div className="g-card">
              <div className="g-card-head"><h2><FolderOpen size={18} /> Mes documents</h2></div>
              <ListeDocuments documents={(mesDocuments ?? []) as DocumentDb[]} />
              <details className="g-details">
                <summary>Ajouter des documents (CV, diplômes, pièces…)</summary>
                <ActionForm action={ajouterDocuments} submitLabel="Enregistrer les documents" className="g-form" submitClassName="btn-hero-primary btn-sm">
                  <Field label="Titre (facultatif)" name="titre" placeholder="Ex. : CV 2026, diplôme du BAC…" />
                  <div className="upload-grid">
                    {["cv", "diplome", "piece_identite", "autre"].map((c) => (
                      <FileUpload key={c} label={CATEGORIES_DOCUMENT[c]} categorie={c} />
                    ))}
                  </div>
                </ActionForm>
              </details>
            </div>

            {/* Profil */}
            <div className="g-card">
              <div className="g-card-head"><h2>Mon profil</h2></div>
              <ActionForm action={modifierProfil} submitLabel="Enregistrer" className="g-form" submitClassName="btn-hero-primary btn-sm">
                <FileUpload label="Changer ma photo de profil / d'identité" categorie="photo" bucket="photos" hint="Facultatif — visage de face, fond clair." />
                <div className="form-grid">
                  <Field label="Pseudo" name="pseudo" required defaultValue={profil.pseudo} hint="Lettres, chiffres, point ou tiret bas" />
                  <Field label="Téléphone" name="telephone" type="tel" defaultValue={profil.telephone ?? ""} />
                  <Field label="Nom" name="nom" required defaultValue={profil.nom ?? ""} />
                  <Field label="Prénom(s)" name="prenom" required defaultValue={profil.prenom ?? ""} />
                  <Field label="Date de naissance" name="date_naissance" type="date" defaultValue={profil.date_naissance ?? ""} />
                  <Field label="Lieu de naissance" name="lieu_naissance" defaultValue={profil.lieu_naissance ?? ""} />
                </div>
              </ActionForm>
            </div>

            {compteMotDePasse && (
              <div className="g-card">
                <div className="g-card-head"><h2><KeyRound size={18} /> Mon mot de passe</h2></div>
                <ActionForm action={changerMotDePasse} submitLabel="Changer le mot de passe" className="g-form" submitClassName="btn-hero-primary btn-sm">
                  <div className="form-grid">
                    <Field label="Nouveau mot de passe" name="mot_de_passe" type="password" required autoComplete="new-password" hint="8 caractères minimum" />
                    <Field label="Confirmation" name="confirmation" type="password" required autoComplete="new-password" />
                  </div>
                </ActionForm>
              </div>
            )}
          </div>

          {/* ---- Colonne latérale ---- */}
          <aside className="form-aside profile-card">
            {maPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={maPhoto} alt="" className="profile-photo" referrerPolicy="no-referrer" />
            ) : (
              <div className="profile-photo profile-initial">{(profil.prenom || profil.pseudo).charAt(0).toUpperCase()}</div>
            )}
            <strong className="profile-name">{nomComplet(profil)}</strong>
            <span className="profile-mail">@{profil.pseudo}</span>
            <span className="profile-mail"><Mail size={14} /> {profil.email}</span>
            <span className="profile-badge">{role ? roleLabel(role) : "En attente de validation"}</span>
            {role && (
              <Link href="/messagerie" className="btn-hero-primary" style={{ width: "100%" }}>
                <MessagesSquare size={16} /> Messagerie
              </Link>
            )}
            <Link href="/mon-espace/messages" className="btn-hero-ghost" style={{ width: "100%" }}>
              <MessageSquare size={16} /> Messages & annonces
            </Link>
            <form action="/auth/deconnexion" method="post" style={{ width: "100%" }}>
              <button type="submit" className="btn-hero-ghost" style={{ width: "100%", cursor: "pointer", font: "inherit" }}>
                <LogOut size={16} /> Se déconnecter
              </button>
            </form>
          </aside>
        </div>
      </section>
    </>
  );
}

function PresenceListe({ items }: { items: Presence[] }) {
  if (items.length === 0) return <p className="g-ok-line">Aucune absence ni retard enregistré.</p>;
  return (
    <table className="g-table g-table-compact">
      <thead><tr><th>Date</th><th>Statut</th><th>Motif</th></tr></thead>
      <tbody>
        {items.map((p) => (
          <tr key={p.apprenant_id + p.jour}>
            <td>{dateFr(p.jour)}</td>
            <td><span className={`statut ${p.statut === "absent" ? "is-ko" : p.statut === "retard" ? "is-pending" : "is-progress"}`}>{STATUT_PRESENCE[p.statut]}</span></td>
            <td>{p.motif ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
