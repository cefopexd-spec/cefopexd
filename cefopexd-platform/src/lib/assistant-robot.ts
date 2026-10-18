import { CHIFFRES, CONTACT, DIRECTEUR, SECTIONS, type Block } from "@/lib/site-content";

/* =============================================
   ROBOT DE RÉPONSE AUTOMATIQUE (sans intelligence artificielle)
   Répond à partir du contenu du site (site-content.ts) :
   1. intentions courantes (salutations, contact, inscription, frais…)
   2. sinon, recherche du passage du site le plus proche de la question
   Utilisé quand ANTHROPIC_API_KEY n'est pas configurée ou en cas d'erreur.
   ============================================= */

type Passage = { titre: string; texte: string; lien: string; poids: number };

const MOTS_VIDES = new Set(
  "le la les un une des du de d l au aux et ou en a à est sont pour par sur dans avec ce cet cette ces qui que quoi quel quelle quels quelles comment combien je j tu il elle nous vous ils elles me te se mon ma mes ton ta tes son sa ses notre votre vos leur leurs y ne pas plus moins tres bien faire fait peut peux puis veux voudrais aimerais savoir est-ce qu s il vous plait svp bonjour merci cefopexd centre".split(" ")
);

function normaliser(texte: string): string {
  return texte.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, " ");
}

/* Mots significatifs, ramenés à une racine simple (pluriels, terminaisons courantes) */
function mots(texte: string): string[] {
  return normaliser(texte)
    .split(/\s+/)
    .filter((m) => m.length > 2 && !MOTS_VIDES.has(m))
    .map((m) => m.replace(/(ements|ement|ations|ation|iques|ique|eurs|eur|ees|ee|es|s|e)$/, "") || m);
}

function texteDuBloc(bloc: Block): string {
  switch (bloc.type) {
    case "text": return bloc.paragraphs.join(" ");
    case "list": return bloc.items.map((i) => `- ${i}`).join("\n");
    case "facts": return bloc.items.map((f) => `- ${f.label} : ${f.value}`).join("\n");
    case "steps": return bloc.items.map((s, i) => `${i + 1}. ${s.title} — ${s.desc}`).join("\n");
    case "cards": return bloc.items.map((c) => `- ${c.title} : ${c.desc}`).join("\n");
    default: return "";
  }
}

function construirePassages(): Passage[] {
  const passages: Passage[] = [];
  for (const [cle, section] of Object.entries(SECTIONS)) {
    const pages: [string, typeof section][] = [[`/${cle}`, section]];
    for (const [slug, page] of Object.entries(section.pages ?? {})) pages.push([`/${cle}/${slug}`, page as typeof section]);
    for (const [lien, page] of pages) {
      // L'introduction est complétée par le premier bloc de contenu de la page
      const premier = page.blocks.map(texteDuBloc).find(Boolean);
      passages.push({ titre: page.title, texte: premier ? `${page.intro}
${premier}` : page.intro, lien, poids: 1.2 });
      for (const bloc of page.blocks) {
        if (bloc.type === "faq") {
          for (const f of bloc.items) passages.push({ titre: f.q, texte: f.a, lien, poids: 1.6 });
          continue;
        }
        const texte = texteDuBloc(bloc);
        if (!texte) continue;
        const titre = "title" in bloc && bloc.title ? bloc.title : page.title;
        passages.push({ titre, texte, lien, poids: 1 });
      }
    }
  }
  return passages;
}

const PASSAGES = construirePassages();
const INDEX = PASSAGES.map((p) => ({ titre: new Set(mots(p.titre)), corps: new Set(mots(`${p.titre} ${p.texte}`)) }));

/* Rareté de chaque mot : un mot présent partout compte peu */
const FREQUENCE = new Map<string, number>();
for (const { corps } of INDEX) for (const m of corps) FREQUENCE.set(m, (FREQUENCE.get(m) ?? 0) + 1);
const rarete = (m: string) => Math.log(1 + PASSAGES.length / (FREQUENCE.get(m) ?? 1));

const CONTACTS = `- Téléphone : ${CONTACT.telephones.map((t) => `[${t}](tel:${t.replace(/\s/g, "")})`).join(" / ")}
- E-mail : [${CONTACT.email}](mailto:${CONTACT.email})
- [Écrire sur WhatsApp](${CONTACT.whatsapp})
- Ou la page [Contact](/contact)`;

const INTENTIONS: { motif: RegExp; reponse: string }[] = [
  {
    motif: /^(bonjour|bonsoir|salut|hello|coucou|bjr|slt)\b[\s!.,]*$/,
    reponse: "Bonjour et bienvenue au CeFoPExD ! Je peux vous renseigner sur nos filières, la pré-inscription, les pièces à fournir ou nous contacter. Quelle est votre question ?",
  },
  {
    motif: /^(merci|ok|d accord|super|parfait)\b/,
    reponse: "Avec plaisir ! N'hésitez pas si vous avez une autre question.",
  },
  {
    motif: /(contact|telephone|numero|appeler|joindre|whatsapp|mail|email)/,
    reponse: `Vous pouvez joindre le CeFoPExD :\n${CONTACTS}`,
  },
  {
    motif: /(ou se trouve|ou est|adresse|localisation|situe|itineraire|venir|plan|carte)/,
    reponse: `Le centre est situé à ${CONTACT.localisation} (${CONTACT.adresse}).\n- [Voir l'itinéraire](${CONTACT.itineraire})\n- Plan et coordonnées sur la page [Contact](/contact)`,
  },
  {
    motif: /(directeur|dg|d almeida|blaise|fondateur|responsable du centre)/,
    reponse: `Le Directeur Général du CeFoPExD est ${DIRECTEUR.nom}.\n\n« ${DIRECTEUR.extrait} »\n\nLire son message : [Mot du DG](/a-propos/mot-du-dg)`,
  },
  {
    motif: /(prix|frais|cout|tarif|combien coute|payer|paiement|scolarite)/,
    reponse: `Les frais de formation dépendent de la filière et ne sont pas encore publiés en détail sur le site. Consultez la page [Frais de formation](/inscription/frais) ou contactez-nous :\n${CONTACTS}`,
  },
  {
    motif: /(inscri|s inscrire|candidat|postuler|admission|integrer)/,
    reponse: "Pour vous inscrire :\n- Connectez-vous avec votre compte Google sur la page [Connexion](/connexion)\n- Remplissez la [pré-inscription en ligne](/inscription/formulaire) avec votre photo d'identité et vos documents\n- Le secrétariat étudie votre dossier, puis l'inscription est finalisée au centre\n\nDétails : [Procédure d'inscription](/inscription/procedure) et [Pièces à fournir](/inscription/pieces)",
  },
  {
    motif: /(filiere|formation|metier|apprendre|etudier|cours propose|specialite)/,
    reponse: `Le CeFoPExD propose ${CHIFFRES.find((c) => /fili/i.test(c.label))?.value ?? 6} filières : ${Object.values(SECTIONS.filieres?.pages ?? {}).map((p) => p.title).join(", ") || "informatique appliquée, mécatronique, agro-alimentaire, énergie renouvelable, langue allemande et formations courtes"}.\n\nDécouvrir : [Nos filières](/filieres) · [Formations](/formations)`,
  },
  {
    motif: /(compte|connexion|connecter|mot de passe|espace personnel|mon espace)/,
    reponse: "Votre compte CeFoPExD se crée avec Google sur la page [Connexion](/connexion). Vous retrouvez ensuite vos demandes, documents et messages dans [Mon espace](/mon-espace). Le personnel utilise « Espace du personnel » sur la même page.",
  },
];

function resume(texte: string, max = 520): string {
  if (texte.length <= max) return texte;
  const coupe = texte.slice(0, max);
  const fin = Math.max(coupe.lastIndexOf("\n"), coupe.lastIndexOf(". "));
  return `${coupe.slice(0, fin > max * 0.5 ? fin + 1 : max).trim()}…`;
}

export function reponseRobot(question: string): string {
  const q = normaliser(question).replace(/\s+/g, " ").trim();
  if (!q) return INTENTIONS[0].reponse;

  // 1. Recherche dans le contenu du site
  const termes = [...new Set(mots(question))];
  let meilleur = -1;
  let score = 0;
  INDEX.forEach(({ titre, corps }, i) => {
    let s = 0;
    for (const t of termes) {
      if (titre.has(t)) s += 2 * rarete(t);
      else if (corps.has(t)) s += rarete(t);
    }
    s *= PASSAGES[i].poids;
    if (s > score) { score = s; meilleur = i; }
  });

  // 2. Une intention claire l'emporte sur un passage peu pertinent
  const intention = INTENTIONS.find((it) => it.motif.test(q));
  if (intention && (score < 6 || termes.length <= 3)) return intention.reponse;

  if (meilleur >= 0 && score >= 2.5) {
    const p = PASSAGES[meilleur];
    return `${p.titre.endsWith("?") ? "" : `**${p.titre}**\n`}${resume(p.texte)}\n\nEn savoir plus : [${SECTIONS[p.lien.split("/")[1]]?.pages?.[p.lien.split("/")[2] ?? ""]?.title ?? SECTIONS[p.lien.split("/")[1]]?.title ?? "cette page"}](${p.lien})`;
  }
  if (intention) return intention.reponse;

  return `Je n'ai pas trouvé de réponse précise sur le site. Notre équipe vous répond volontiers :\n${CONTACTS}`;
}
