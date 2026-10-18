import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FileText, LogOut, Mail } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { getProfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mon espace" };

const STATUTS: Record<string, { label: string; className: string }> = {
  en_attente: { label: "En attente de traitement", className: "is-pending" },
  contacte: { label: "Vous avez été contacté(e)", className: "is-progress" },
  valide: { label: "Inscription validée", className: "is-ok" },
  refuse: { label: "Non retenue", className: "is-ko" },
};

/* =============================================
   ESPACE PERSONNEL : profil Google + pré-inscriptions de l'utilisateur
   ============================================= */
export default async function MonEspacePage() {
  const profil = await getProfil();
  if (!profil) redirect("/connexion?next=/mon-espace");

  // Les règles de sécurité (RLS) ne renvoient que les demandes de l'utilisateur connecté
  const supabase = await createClient();
  const { data: demandes, error } = await supabase
    .from("inscriptions")
    .select("id, filiere, niveau_etude, statut, created_at")
    .order("created_at", { ascending: false });
  if (error) console.error("Mon espace : lecture des inscriptions impossible", error.message);

  return (
    <>
      <PageHeader
        title={`Bonjour ${profil.prenom || profil.nomComplet} !`}
        intro="Bienvenue dans votre espace CeFoPExD. Retrouvez ici vos pré-inscriptions et leur suivi."
        crumbs={[{ label: "Mon espace" }]}
      />
      <section className="section">
        <div className="container form-layout">
          <div style={{ minWidth: 0 }}>
            <div className="space-head">
              <h2 className="block-title" style={{ marginBottom: 0 }}>Mes pré-inscriptions</h2>
              <Link href="/inscription/formulaire" className="btn-hero-red btn-sm">
                Nouvelle pré-inscription <ArrowRight size={15} />
              </Link>
            </div>

            {demandes && demandes.length > 0 ? (
              <div className="demande-list">
                {demandes.map((d) => {
                  const statut = STATUTS[d.statut ?? "en_attente"] ?? STATUTS.en_attente;
                  return (
                    <article key={d.id} className="demande">
                      <div className="demande-ico"><FileText size={20} /></div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <strong>{d.filiere}</strong>
                        <span>
                          Réf. INS-{String(d.id).slice(0, 8).toUpperCase()} · {d.niveau_etude} · envoyée le{" "}
                          {new Date(d.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>
                      <span className={`statut ${statut.className}`}>{statut.label}</span>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="pending">
                <FileText size={22} />
                <div>
                  <strong>Aucune pré-inscription pour le moment</strong>
                  <p>Choisissez votre filière et déposez votre demande en quelques minutes : notre équipe vous recontacte ensuite.</p>
                </div>
              </div>
            )}
          </div>

          <aside className="form-aside profile-card">
            {profil.photo ? (
              // Photo de profil Google (domaine externe, affichée telle quelle)
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profil.photo} alt="" className="profile-photo" referrerPolicy="no-referrer" />
            ) : (
              <div className="profile-photo profile-initial">{(profil.prenom || profil.email).charAt(0).toUpperCase()}</div>
            )}
            <strong className="profile-name">{profil.nomComplet}</strong>
            <span className="profile-mail"><Mail size={14} /> {profil.email}</span>
            <span className="profile-badge">Compte Google</span>
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
