import Anthropic from "@anthropic-ai/sdk";
import { ASSISTANT_SYSTEM_PROMPT } from "@/lib/assistant-knowledge";
import { reponseRobot } from "@/lib/assistant-robot";

/* =============================================
   API DE L'ASSISTANT : POST /api/chat
   Reçoit l'historique de la conversation et renvoie la réponse
   de Claude en flux texte (affichée au fil de l'eau dans le widget).
   Avec ANTHROPIC_API_KEY : réponses de Claude. Sans clé (ou en cas d'erreur) :
   le robot répond à partir du contenu du site.
   ============================================= */
export const maxDuration = 60;

const MAX_MESSAGES = 16;      // historique conservé par conversation
const MAX_CHARS = 1500;       // longueur maximale d'un message visiteur

type ChatMessage = { role: "user" | "assistant"; content: string };

function parseMessages(body: unknown): Anthropic.Beta.BetaMessageParam[] | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as { messages?: unknown }).messages)) return null;
  const raw = (body as { messages: unknown[] }).messages.slice(-MAX_MESSAGES);
  const messages: ChatMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, MAX_CHARS);
    if (text) messages.push({ role, content: text });
  }
  // La conversation doit commencer et se terminer par un message du visiteur
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return null;
  return messages;
}

function texteSimple(texte: string) {
  return new Response(texte, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let messages: Anthropic.Beta.BetaMessageParam[] | null = null;
  try {
    messages = parseMessages(await request.json());
  } catch {
    messages = null;
  }
  if (!messages) {
    return Response.json({ error: "requete_invalide" }, { status: 400 });
  }

  const question = messages[messages.length - 1].content as string;
  if (!process.env.ANTHROPIC_API_KEY) return texteSimple(reponseRobot(question));

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 8000,
    // Questions simples de visiteurs : effort bas = réponses rapides et économiques
    output_config: { effort: "low" },
    // Si le modèle décline une question, l'API la relance sur le modèle de repli recommandé
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    // Le prompt système (règles + contenu du site) est mis en cache entre les requêtes
    system: [{ type: "text", text: ASSISTANT_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sent = false;
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
            sent = true;
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode(`${sent ? "\n\n" : ""}${reponseRobot(question)}`));
        } else if (!sent) {
          controller.enqueue(encoder.encode(reponseRobot(question)));
        }
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
          console.error("Assistant : limite de requêtes atteinte");
        } else if (error instanceof Anthropic.APIError) {
          console.error(`Assistant : erreur API ${error.status}`, error.message);
        } else {
          console.error("Assistant : erreur inattendue", error);
        }
        if (!sent) controller.enqueue(encoder.encode(reponseRobot(question)));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
