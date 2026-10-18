"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Send, X } from "lucide-react";
import { CONTACT } from "@/lib/site-content";

/* =============================================
   ASSISTANT EN LIGNE (chat)
   Les réponses sont générées par /api/chat à partir du contenu du site.
   ============================================= */
type Msg = { role: "user" | "assistant"; content: string };

const WELCOME = "Bonjour ! Je suis l'assistant du CeFoPExD. Posez-moi vos questions sur nos filières, l'inscription ou le centre.";
const SUGGESTIONS = [
  "Quelles filières proposez-vous ?",
  "Comment s'inscrire ?",
  "Quelles pièces faut-il fournir ?",
  "Où se trouve le centre ?",
];
const UNAVAILABLE = `L'assistant est momentanément indisponible. Contactez-nous au ${CONTACT.telephones[0]} ou sur la page [Contact](/contact).`;

/* Mise en forme minimale : listes "- ", **gras** et liens [texte](/chemin) */
function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) {
      parts.push(<strong key={m.index}>{m[1]}</strong>);
    } else if (m[3].startsWith("/")) {
      parts.push(<Link key={m.index} href={m[3]}>{m[2]}</Link>);
    } else if (/^(https?:|mailto:|tel:)/.test(m[3])) {
      parts.push(<a key={m.index} href={m[3]} target="_blank" rel="noopener noreferrer">{m[2]}</a>);
    } else {
      parts.push(m[2]);
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function Formatted({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      blocks.push(<ul key={`l${blocks.length}`}>{list.map((li, i) => <li key={i}>{renderInline(li)}</li>)}</ul>);
      list = [];
    }
  };
  for (const line of text.split("\n")) {
    const item = line.match(/^\s*[-•*]\s+(.*)/);
    if (item) { list.push(item[1]); continue; }
    flush();
    if (line.trim()) blocks.push(<p key={`p${blocks.length}`}>{renderInline(line)}</p>);
  }
  flush();
  return <>{blocks}</>;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    const history: Msg[] = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    const setAnswer = (content: string) =>
      setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      // Lecture du flux : la réponse s'affiche au fur et à mesure
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setAnswer(answer);
      }
      if (!answer.trim()) setAnswer(UNAVAILABLE);
    } catch {
      setAnswer(UNAVAILABLE);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant en ligne"}
        title="Assistant en ligne"
        className="float-btn float-chat"
        aria-expanded={open}
      >
        {open ? <X size={20} /> : <MessageCircle size={21} />}
      </button>

      {open && (
        <section className="chat-panel" aria-label="Assistant en ligne du CeFoPExD">
          <header className="chat-head">
            <span className="chat-avatar">
              <Image src="/logo-mark.png" alt="" fill sizes="36px" style={{ objectFit: "contain", padding: "5px" }} />
            </span>
            <div>
              <strong>Assistant CeFoPExD</strong>
              <span><i className="chat-dot" /> En ligne — réponses instantanées</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="chat-close">
              <X size={18} />
            </button>
          </header>

          <div className="chat-body" ref={listRef} aria-live="polite">
            <div className="chat-msg is-bot"><Formatted text={WELCOME} /></div>

            {messages.length === 0 && (
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role === "user" ? "is-user" : "is-bot"}`}>
                {m.content ? (
                  m.role === "user" ? <p>{m.content}</p> : <Formatted text={m.content} />
                ) : (
                  <span className="chat-typing" aria-label="L'assistant écrit"><i /><i /><i /></span>
                )}
              </div>
            ))}
          </div>

          <form className="chat-input" onSubmit={onSubmit}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Écrivez votre question…"
              rows={1}
              maxLength={1500}
              aria-label="Votre question"
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Envoyer">
              <Send size={17} />
            </button>
          </form>
          <p className="chat-note">Réponses générées automatiquement à partir des informations du site, à titre indicatif. <Link href="/conditions-utilisation">Conditions</Link> · <Link href="/confidentialite">Confidentialité</Link></p>
        </section>
      )}
    </>
  );
}
