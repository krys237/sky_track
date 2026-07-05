"use client";

import React from "react";
import { Play } from "lucide-react";
import { STEPS_FUNC } from "@/lib/content";

/**
 * « Le principe » — infographie route sinueuse (réf. model-principe), adaptée SkyTrack :
 * un ruban en dégradé bleu→vert→ambre serpente de l'arrière (étape 01, petite) vers
 * l'avant (étape 05, grande), avec des marqueurs « sucette » numérotés surmontés d'un
 * label. Repli en timeline verticale sous 900px.
 */

// Accents par étape, alignés sur le dégradé de la route.
const ACCENTS = ["#2563EB", "#0891B2", "#10B981", "#D97706", "#F59E0B"];

// Points de la route dans le repère SVG (viewBox 1000×520). w = largeur du ruban.
const ROAD = [
  { x: 895, y: 150, w: 26 },
  { x: 700, y: 214, w: 36 },
  { x: 498, y: 286, w: 48 },
  { x: 296, y: 378, w: 62 },
  { x: 120, y: 462, w: 78 },
];

// Marqueurs (diamètre en cqw = % de la largeur du conteneur) + placement du label.
const MARKERS: { dia: number; side: "right" | "center" | "left" | "front" }[] = [
  { dia: 5.8, side: "right" },
  { dia: 7.2, side: "center" },
  { dia: 8.8, side: "center" },
  { dia: 10.8, side: "left" },
  { dia: 12.8, side: "front" },
];

// Résumés courts pour les labels de la route (le détail complet vit sur /comment-ca-marche).
const SHORT = [
  "Un signal Bluetooth discret et économe.",
  "Les téléphones Android autour la captent.",
  "Sa dernière position s'affiche dans l'app.",
  "Sonnerie et « plus chaud / plus froid ».",
  "Marquez-la perdue, ou partagez-la.",
];

const VB_W = 1000;
const VB_H = 520;

// ---- Génération du ruban : centerline lissée (Catmull-Rom) + offset perpendiculaire ----
type P = { x: number; y: number; w: number };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function catmull(p0: P, p1: P, p2: P, p3: P, t: number) {
  const t2 = t * t, t3 = t2 * t;
  const x = 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
  const y = 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
  return { x, y };
}
function ribbonPath(base: P[]): string {
  const first = base[0], last = base[base.length - 1];
  // Prolonge les deux extrémités hors-cadre pour que la route « sorte » de la scène.
  const pts: P[] = [
    { x: first.x + 130, y: first.y - 42, w: first.w * 0.7 },
    ...base,
    { x: last.x - 120, y: last.y + 46, w: last.w * 1.05 },
  ];
  const samples: { x: number; y: number; nx: number; ny: number; w: number }[] = [];
  const N = 26;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i], p2 = pts[i + 1];
    const p3 = pts[i + 2] || pts[i + 1];
    for (let j = 0; j <= N; j++) {
      const t = j / N;
      const pos = catmull(p0, p1, p2, p3, t);
      const pos2 = catmull(p0, p1, p2, p3, Math.min(t + 0.008, 1));
      const dx = pos2.x - pos.x, dy = pos2.y - pos.y;
      const len = Math.hypot(dx, dy) || 1;
      samples.push({ x: pos.x, y: pos.y, nx: -dy / len, ny: dx / len, w: lerp(p1.w, p2.w, t) });
    }
  }
  const left = samples.map((s) => `${(s.x + s.nx * s.w / 2).toFixed(1)},${(s.y + s.ny * s.w / 2).toFixed(1)}`);
  const right = samples.slice().reverse().map((s) => `${(s.x - s.nx * s.w / 2).toFixed(1)},${(s.y - s.ny * s.w / 2).toFixed(1)}`);
  return `M${left.join(" L")} L${right.join(" L")} Z`;
}

export function PrincipleRoad() {
  const path = ribbonPath(ROAD);

  return (
    <>
      {/* Desktop / tablette : la route en perspective */}
      <div className="principle-road" role="list" aria-label="Les cinq étapes du principe">
        <svg className="principle-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet" aria-hidden>
          <defs>
            <linearGradient id="pr-road" x1="900" y1="120" x2="140" y2="470" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#2563EB" />
              <stop offset="0.5" stopColor="#10B981" />
              <stop offset="1" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <path d={path} fill="url(#pr-road)" />
          <path d={path} fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="1.5" />
        </svg>

        {STEPS_FUNC.map((s, i) => {
          const road = ROAD[i];
          const m = MARKERS[i];
          const accent = ACCENTS[i % ACCENTS.length];
          return (
            <div
              key={i}
              role="listitem"
              className={`pr-marker pr-side-${m.side}`}
              style={{ left: `${(road.x / VB_W) * 100}%`, top: `${(road.y / VB_H) * 100}%` }}
            >
              <div className="pr-label">
                <div className="pr-label-title"><Play size={12} fill={accent} color={accent} /> {s.t}</div>
                <p className="pr-label-desc">{SHORT[i]}</p>
              </div>
              <div
                className="pr-dot"
                style={{ width: `${m.dia}cqw`, height: `${m.dia}cqw`, boxShadow: `0 0 0 ${m.dia * 0.055}cqw ${accent}22, 0 14px 26px -8px rgba(16,42,73,.5)` }}
              >
                <span className="pr-num" style={{ fontSize: `${m.dia * 0.34}cqw` }}>{s.n}</span>
              </div>
              <span className="pr-stem" style={{ background: `linear-gradient(${accent},${accent}00)` }} />
            </div>
          );
        })}
      </div>

      {/* Mobile : timeline verticale, même langage visuel */}
      <ol className="principle-stack">
        {STEPS_FUNC.map((s, i) => {
          const accent = ACCENTS[i % ACCENTS.length];
          return (
            <li key={i} className="pr-row">
              <div className="pr-dot pr-dot-sm" style={{ boxShadow: `0 0 0 3px ${accent}22, 0 10px 20px -8px rgba(16,42,73,.45)` }}>
                <span className="pr-num">{s.n}</span>
              </div>
              <div className="pr-row-body">
                <h3 className="pr-label-title"><Play size={12} fill={accent} color={accent} /> {s.t}</h3>
                <p className="pr-label-desc">{s.d}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

export default PrincipleRoad;
