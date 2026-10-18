"use client";

import { useState } from "react";

/* =============================================
   PETIT GRAPHIQUE EN BARRES (une mesure, une période)
   Petits multiples : chaque mesure a son propre graphique et sa propre échelle.
   Survol / toucher : infobulle avec la période et la valeur.
   ============================================= */
type Point = { label: string; valeur: number };

const COULEUR = "#2B44E0"; // bleu CeFoPExD, contraste validé sur fond clair

export default function MiniBarres({ titre, points, total }: { titre: string; points: Point[]; total: number }) {
  const [survol, setSurvol] = useState<number | null>(null);
  const W = 320, H = 120, bas = 100, haut = 12;
  const max = Math.max(1, ...points.map((p) => p.valeur));
  const pas = W / Math.max(1, points.length);
  const largeur = Math.max(3, Math.min(18, pas * 0.62));
  const y = (v: number) => bas - (v / max) * (bas - haut);
  const actif = survol !== null ? points.at(survol) : null;

  return (
    <figure className="mini-chart">
      <figcaption>
        <span>{titre}</span>
        <strong>{total.toLocaleString("fr-FR")}</strong>
      </figcaption>
      <div className="mini-chart-plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${titre} : ${total} sur la période`} onMouseLeave={() => setSurvol(null)}>
          <line x1="0" x2={W} y1={bas} y2={bas} stroke="var(--border)" strokeWidth="1" />
          <line x1="0" x2={W} y1={haut} y2={haut} stroke="var(--border)" strokeWidth="1" strokeDasharray="2 4" />
          <text x={W} y={haut - 3} textAnchor="end" fontSize="9" fill="var(--muted)">{max}</text>
          {points.map((p, i) => {
            const x = i * pas + (pas - largeur) / 2;
            const h = bas - y(p.valeur);
            return (
              <g key={p.label} onMouseEnter={() => setSurvol(i)} onTouchStart={() => setSurvol(i)}>
                {/* zone de survol plus large que la barre */}
                <rect x={i * pas} y={0} width={pas} height={H} fill="transparent" />
                {p.valeur > 0 && (
                  <path
                    d={`M${x} ${bas}V${y(p.valeur) + Math.min(4, h)}q0 -${Math.min(4, h)} ${Math.min(4, largeur / 2)} -${Math.min(4, h)}H${x + largeur - Math.min(4, largeur / 2)}q${Math.min(4, largeur / 2)} 0 ${Math.min(4, largeur / 2)} ${Math.min(4, h)}V${bas}z`}
                    fill={COULEUR}
                    opacity={survol === null || survol === i ? 1 : 0.45}
                  />
                )}
              </g>
            );
          })}
          <text x="0" y={H - 4} fontSize="9" fill="var(--muted)">{points.at(0)?.label}</text>
          <text x={W} y={H - 4} fontSize="9" textAnchor="end" fill="var(--muted)">{points.at(-1)?.label}</text>
        </svg>
        {actif && (
          <div className="mini-chart-tip" style={{ left: `${((survol! + 0.5) / points.length) * 100}%` }}>
            <strong>{actif.valeur}</strong> · {actif.label}
          </div>
        )}
      </div>
      {/* Données accessibles (lecteurs d'écran) */}
      <table className="sr-only">
        <caption>{titre}</caption>
        <tbody>{points.map((p) => <tr key={p.label}><th>{p.label}</th><td>{p.valeur}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}
