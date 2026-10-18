"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* Compte les pages vues du site public (statistiques du DG ; aucune donnée personnelle) */
export default function VisiteTracker() {
  const chemin = usePathname();
  useEffect(() => {
    if (!chemin || /bot|crawl|spider/i.test(navigator.userAgent)) return;
    createClient().from("visites").insert({ chemin: chemin.slice(0, 300) }).then(() => {});
  }, [chemin]);
  return null;
}
