import Link from "next/link";
import { Bell } from "lucide-react";
import { marquerNotificationsLues } from "@/app/(public)/mon-espace/actions";

export type Notification = { id: string; titre: string; message: string | null; lien: string | null; lu: boolean; created_at: string };

/* Liste des dernières notifications de l'utilisateur */
export default function Notifications({ items }: { items: Notification[] }) {
  const nonLues = items.filter((n) => !n.lu).length;
  return (
    <div className="g-card">
      <div className="g-card-head">
        <h2><Bell size={18} /> Notifications {nonLues > 0 && <span className="g-badge">{nonLues}</span>}</h2>
        {nonLues > 0 && (
          <form action={marquerNotificationsLues}>
            <button type="submit" className="g-link-btn">Tout marquer comme lu</button>
          </form>
        )}
      </div>
      {items.length === 0 ? (
        <p className="g-empty">Aucune notification pour le moment.</p>
      ) : (
        <ul className="g-notifs">
          {items.map((n) => (
            <li key={n.id} className={n.lu ? "" : "is-new"}>
              <div>
                <strong>{n.titre}</strong>
                {n.message && <span>{n.message}</span>}
                <small>{new Date(n.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</small>
              </div>
              {n.lien && <Link href={n.lien}>Ouvrir</Link>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
