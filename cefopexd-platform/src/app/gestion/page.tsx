import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Notifications, { type Notification } from "@/components/Notifications";
import { requireGestion } from "@/lib/session";
import { STATUTS_INSCRIPTION } from "@/lib/roles";
import StatsDG, { type Periode } from "./StatsDG";

type Props = { searchParams: Promise<{ acces?: string; periode?: string }> };

/* =============================================
   TABLEAU DE BORD — chiffres clés et tâches en attente selon le rôle
   ============================================= */
export default async function TableauDeBord({ searchParams }: Props) {
  const { acces, periode } = await searchParams;
  const { supabase, user, role, autorisees } = await requireGestion("tableau");
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const compter = (table: string) => supabase.from(table).select("id", { count: "exact", head: true });

  const [comptes, inscriptions, apprenants, professeurs, absences, rapports, pubsAValider, demandes, notifications] = await Promise.all([
    autorisees.includes("comptes") ? compter("profils").eq("statut", "en_attente").eq("profil_complet", true) : null,
    autorisees.includes("inscriptions") ? supabase.from("inscriptions").select("statut") : null,
    autorisees.includes("apprenants") ? compter("apprenants").eq("statut", "actif") : null,
    autorisees.includes("professeurs") ? compter("professeurs").eq("actif", true) : null,
    autorisees.includes("presences") ? compter("presences").eq("jour", aujourdhui).eq("statut", "absent") : null,
    role === "dg" ? compter("rapports").eq("statut", "soumis") : null,
    role === "dg" ? compter("publications").eq("statut", "soumise") : null,
    autorisees.includes("demandes") ? compter("demandes").eq("statut", "soumise") : null,
    supabase.from("notifications").select("*").eq("destinataire_id", user!.id).order("created_at", { ascending: false }).limit(10),
  ]);

  const parStatut: Record<string, number> = {};
  for (const i of (inscriptions?.data ?? []) as { statut: string }[]) parStatut[i.statut] = (parStatut[i.statut] ?? 0) + 1;

  // Ce qui attend une action de la part de ce rôle
  const aFaire: { label: string; n: number; href: string }[] = [];
  if (role === "dg") {
    aFaire.push({ label: "Comptes à valider", n: comptes?.count ?? 0, href: "/gestion/comptes" });
    aFaire.push({ label: "Dossiers d'inscription à valider", n: parStatut.dossier_complet ?? 0, href: "/gestion/inscriptions?statut=dossier_complet" });
    aFaire.push({ label: "Rapports non lus", n: rapports?.count ?? 0, href: "/gestion/rapports" });
    aFaire.push({ label: "Publications à valider", n: pubsAValider?.count ?? 0, href: "/gestion/publications?statut=soumise" });
  }
  if (role === "admin" || role === "dg") {
    aFaire.push({ label: "Dossiers transmis par le secrétariat", n: parStatut.transmis_admin ?? 0, href: "/gestion/inscriptions?statut=transmis_admin" });
  }
  if (autorisees.includes("demandes")) {
    aFaire.push({ label: "Permissions, absences, retards à traiter", n: demandes?.count ?? 0, href: "/gestion/demandes" });
  }
  if (["secretaire", "admin", "dg"].includes(role)) {
    aFaire.push({ label: "Nouvelles pré-inscriptions", n: parStatut.en_attente ?? 0, href: "/gestion/inscriptions?statut=en_attente" });
    aFaire.push({ label: "Pré-inscriptions en traitement", n: parStatut.en_traitement ?? 0, href: "/gestion/inscriptions?statut=en_traitement" });
  }

  const chiffres = [
    autorisees.includes("apprenants") && { label: "Apprenants actifs", n: apprenants?.count ?? 0, href: "/gestion/apprenants" },
    autorisees.includes("professeurs") && { label: "Professeurs", n: professeurs?.count ?? 0, href: "/gestion/professeurs" },
    autorisees.includes("inscriptions") && { label: "Inscriptions validées", n: parStatut.valide ?? 0, href: "/gestion/inscriptions?statut=valide" },
    autorisees.includes("presences") && { label: "Absents aujourd'hui", n: absences?.count ?? 0, href: "/gestion/presences" },
  ].filter(Boolean) as { label: string; n: number; href: string }[];

  return (
    <>
      <div className="g-page-head">
        <h1>Tableau de bord</h1>
        <p>Vue d&#39;ensemble de vos rubriques et des tâches qui vous attendent.</p>
      </div>

      {acces === "refuse" && (
        <div className="form-error" role="alert"><AlertTriangle size={18} /><span>Cette rubrique ne vous est pas attribuée. Contactez le Directeur Général.</span></div>
      )}

      {role === "dg" && <StatsDG supabase={supabase} periode={(["day", "week", "month", "year"].includes(periode ?? "") ? periode : "day") as Periode} />}

      {chiffres.length > 0 && (
        <div className="g-stats">
          {chiffres.map((c) => (
            <Link key={c.label} href={c.href} className="g-stat">
              <strong>{c.n}</strong><span>{c.label}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="g-grid-2">
        {aFaire.length > 0 && (
          <div className="g-card">
            <div className="g-card-head"><h2>À traiter</h2></div>
            <ul className="g-todo">
              {aFaire.map((a) => (
                <li key={a.label}>
                  <Link href={a.href}>
                    <span className={`g-count ${a.n > 0 ? "is-hot" : ""}`}>{a.n}</span>
                    {a.label}
                    <ArrowRight size={15} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Notifications items={(notifications.data ?? []) as Notification[]} />
      </div>

      {autorisees.includes("inscriptions") && (
        <div className="g-card">
          <div className="g-card-head"><h2>Circuit des inscriptions</h2></div>
          <div className="g-pipeline">
            {Object.entries(STATUTS_INSCRIPTION).map(([cle, s]) => (
              <Link key={cle} href={`/gestion/inscriptions?statut=${cle}`} className="g-pipe-step">
                <strong>{parStatut[cle] ?? 0}</strong>
                <span>{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
