/* =============================================
   PAIEMENTS : libellés et mise en forme des montants (francs CFA)
   ============================================= */
export const MODES_PAIEMENT: Record<string, string> = {
  especes: "Espèces",
  mobile_money: "Mobile Money (Flooz, T-Money…)",
  virement: "Virement bancaire",
  cheque: "Chèque",
  autre: "Autre",
};

export const MOTIFS_PAIEMENT = [
  "Frais d'inscription",
  "Frais de scolarité",
  "Frais d'examen",
  "Tenue / équipement",
  "Frais de dossier",
  "Formation courte",
  "Autre",
];

export const fcfa = (n: number | string | null | undefined) =>
  `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(n ?? 0))} F CFA`;

/* Montant en toutes lettres (pour les reçus) */
const UNITES = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize"];
const DIZAINES = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

function moinsDeCent(n: number): string {
  if (n < 17) return UNITES[n];
  if (n < 20) return `dix-${UNITES[n - 10]}`;
  const d = Math.floor(n / 10);
  let u = n % 10;
  if (d === 7 || d === 9) u += 10; // soixante-dix, quatre-vingt-dix…
  const base = DIZAINES[d];
  if (u === 0) return d === 8 ? "quatre-vingts" : base;
  if ((u === 1 || u === 11) && d !== 8 && d !== 9) return `${base} et ${moinsDeCent(u)}`;
  return `${base}-${moinsDeCent(u)}`;
}

function moinsDeMille(n: number): string {
  const c = Math.floor(n / 100);
  const r = n % 100;
  const centaines = c === 0 ? "" : c === 1 ? "cent" : `${UNITES[c]} cent${r === 0 ? "s" : ""}`;
  return [centaines, r ? moinsDeCent(r) : ""].filter(Boolean).join(" ");
}

export function enLettres(n: number): string {
  n = Math.floor(Math.abs(n));
  if (n === 0) return "zéro";
  const parties: string[] = [];
  const milliards = Math.floor(n / 1e9);
  const millions = Math.floor((n % 1e9) / 1e6);
  const milliers = Math.floor((n % 1e6) / 1000);
  const reste = n % 1000;
  if (milliards) parties.push(`${moinsDeMille(milliards)} milliard${milliards > 1 ? "s" : ""}`);
  if (millions) parties.push(`${moinsDeMille(millions)} million${millions > 1 ? "s" : ""}`);
  if (milliers) parties.push(milliers === 1 ? "mille" : `${moinsDeMille(milliers).replace(/cents$/, "cent").replace(/vingts$/, "vingt")} mille`);
  if (reste) parties.push(moinsDeMille(reste));
  return parties.join(" ");
}
