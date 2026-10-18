"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* =============================================
   DISCUSSION EN DIRECT
   Les nouveaux messages arrivent en temps réel (Supabase Realtime) ;
   la base n'envoie que ceux des conversations dont on est membre.
   ============================================= */
type Message = { id: string; auteur_id: string; contenu: string; created_at: string; envoi?: boolean };
type Auteur = { nom: string; photo: string | null };

const heure = (d: string) => new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const jour = (d: string) => new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

export default function Chat({
  conversationId, moi, titre, sousTitre, initiaux, auteurs, groupe,
}: {
  conversationId: string;
  moi: string;
  titre: string;
  sousTitre: string;
  initiaux: Message[];
  auteurs: Record<string, Auteur>;
  groupe: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>(initiaux);
  const [texte, setTexte] = useState("");
  const [erreur, setErreur] = useState("");
  const fin = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());

  const marquerLu = useCallback(() => {
    supabaseRef.current
      .from("conversation_membres")
      .update({ dernier_lu_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("profil_id", moi)
      .then(() => {});
  }, [conversationId, moi]);

  // Abonnement aux nouveaux messages de cette conversation
  useEffect(() => {
    const supabase = supabaseRef.current;
    marquerLu();
    const canal = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const m = payload.new as Message;
          setMessages((liste) => (liste.some((x) => x.id === m.id) ? liste : [...liste, m]));
          if (m.auteur_id !== moi) marquerLu();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [conversationId, moi, marquerLu]);

  useEffect(() => {
    fin.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const envoyer = async (e?: FormEvent) => {
    e?.preventDefault();
    const contenu = texte.trim();
    if (!contenu) return;
    setTexte("");
    setErreur("");
    const provisoire: Message = { id: `tmp-${Date.now()}`, auteur_id: moi, contenu, created_at: new Date().toISOString(), envoi: true };
    setMessages((liste) => [...liste, provisoire]);
    const { data, error } = await supabaseRef.current
      .from("chat_messages")
      .insert({ conversation_id: conversationId, auteur_id: moi, contenu })
      .select("id, auteur_id, contenu, created_at")
      .single();
    setMessages((liste) => {
      const sans = liste.filter((m) => m.id !== provisoire.id);
      if (error || !data) return sans;
      return sans.some((m) => m.id === data.id) ? sans : [...sans, data as Message];
    });
    if (error) {
      setErreur("Message non envoyé. Vérifiez votre connexion et réessayez.");
      setTexte(contenu);
    }
  };

  let dernierJour = "";
  return (
    <section className="chat-thread">
      <header className="chat-thread-head">
        <Link href="/messagerie" className="chat-thread-back" aria-label="Toutes les discussions"><ArrowLeft size={18} /></Link>
        <div><strong>{titre}</strong><small>{sousTitre}</small></div>
      </header>

      <div className="chat-messages" aria-live="polite">
        {messages.length === 0 && <p className="chat-hint">Aucun message. Écrivez le premier !</p>}
        {messages.map((m, i) => {
          const j = jour(m.created_at);
          const separateur = j !== dernierJour;
          dernierJour = j;
          const mien = m.auteur_id === moi;
          const auteur = auteurs[m.auteur_id];
          const memeAuteur = !separateur && messages.at(i - 1)?.auteur_id === m.auteur_id;
          return (
            <div key={m.id}>
              {separateur && <div className="chat-day"><span>{j}</span></div>}
              <div className={`chat-bubble-row ${mien ? "is-mine" : ""}`}>
                <div className={`chat-bubble ${m.envoi ? "is-sending" : ""}`}>
                  {groupe && !mien && !memeAuteur && <strong className="chat-author">{auteur?.nom ?? "Membre"}</strong>}
                  <p>{m.contenu}</p>
                  <time>{m.envoi ? "envoi…" : heure(m.created_at)}</time>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={fin} />
      </div>

      {erreur && <p className="chat-error" role="alert">{erreur}</p>}
      <form className="chat-compose" onSubmit={envoyer}>
        <textarea
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              envoyer();
            }
          }}
          placeholder="Écrire un message…"
          rows={1}
          maxLength={4000}
          aria-label="Votre message"
        />
        <button type="submit" disabled={!texte.trim()} aria-label="Envoyer"><Send size={18} /></button>
      </form>
    </section>
  );
}
