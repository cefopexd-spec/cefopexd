"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, BookOpen, CalendarCheck, ClipboardList, FileText, GraduationCap,
  CalendarClock, FolderOpen, History, LayoutDashboard, Megaphone, Menu, MessageSquare, MessagesSquare, Search, ShieldCheck, Users, X,
} from "lucide-react";

const ICONES: Record<string, typeof LayoutDashboard> = {
  tableau: LayoutDashboard,
  recherche: Search,
  demandes: CalendarClock,
  documents: FolderOpen,
  messagerie: MessagesSquare,
  comptes: ShieldCheck,
  inscriptions: ClipboardList,
  apprenants: GraduationCap,
  professeurs: Users,
  filieres: BookOpen,
  presences: CalendarCheck,
  publications: Megaphone,
  messages: MessageSquare,
  rapports: FileText,
  journal: History,
};

/* Menu latéral de l'espace de gestion (repliable sur mobile) */
export default function GestionNav({ liens }: { liens: { key: string; label: string; href: string }[] }) {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const actif = (href: string) => (href === "/gestion" ? pathname === "/gestion" : pathname.startsWith(href));

  return (
    <>
      <button type="button" className="g-nav-toggle" onClick={() => setOuvert((o) => !o)} aria-expanded={ouvert}>
        {ouvert ? <X size={18} /> : <Menu size={18} />} Rubriques
      </button>
      <nav className={`g-nav ${ouvert ? "is-open" : ""}`} aria-label="Rubriques de gestion">
        {liens.map(({ key, label, href }) => {
          const Icone = ICONES[key] ?? BarChart3;
          return (
            <Link key={key} href={href} className={actif(href) ? "is-active" : ""} onClick={() => setOuvert(false)}>
              <Icone size={17} /> {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
