"use client";

import React from "react";
import { Play } from "lucide-react";
import { STEPS_FUNC } from "@/lib/content";

/**
 * « Le principe » — infographie route sinueuse (réf. model-principe), adaptée SkyTrack :
 * un ruban vert serpente de l'arrière-GAUCHE (étape 01, petite) vers l'avant-DROITE
 * (étape 05, grande), avec des marqueurs « sucette » numérotés surmontés d'un label.
 * Sens de lecture gauche→droite = sens naturel de notre alphabet (01…05).
 * Repli en timeline verticale sous 900px.
 */

// Accent unique = le vert de marque (route désormais verte uniforme).
const ACCENT = "#059669";

// Points de la route dans le repère SVG (viewBox 1000×520). w = largeur du ruban.
// x ONDULE (gauche→droite→gauche→droite) pour serpenter en S : l'étape 01 démarre à
// GAUCHE (petite, au loin) et la 05 arrive à DROITE (grande, au premier plan), de sorte
// que la numérotation se lise dans notre sens naturel gauche→droite.
// y progresse toujours vers le bas = la route vient vers le lecteur (perspective).
const ROAD = [
  { x: 120, y: 118, w: 18 },
  { x: 440, y: 196, w: 31 },
  { x: 274, y: 312, w: 45 },
  { x: 595, y: 400, w: 64 },
  { x: 850, y: 480, w: 86 },
];

// Marqueurs : diamètre en cqw (far petit → near grand = profondeur) + placement du label.
// lx = décalage horizontal du label depuis l'épingle (en cqw, donc responsive) ;
// align = alignement du texte. Choisis pour que 2 labels voisins ne se chevauchent jamais :
// (miroir de l'ancienne mise en page) 02 pousse à droite, 03 pousse à gauche (au point
// d'inflexion), 05 recentré (bord droit).
// lx/ly = décalage du label (cqw) depuis l'aplomb de l'épingle. Labels resserrés
// contre chaque épingle : proches du numéro, côté ouvert, sans mordre sur le ruban.
const MARKERS: { dia: number; lx: number; ly: number }[] = [
  { dia: 5.0, lx: -0.5, ly: 1 },
  { dia: 6.6, lx: 2, ly: 1.5 },
  { dia: 8.4, lx: -11, ly: 0 },
  { dia: 10.6, lx: 2, ly: 1.5 },
  { dia: 13.2, lx: -1, ly: 0.5 },
];

// Résumés courts pour les labels de la route (affichés dans la section « Comment ça marche »).
const SHORT = [
  "Un signal Bluetooth discret et économe.",
  "Les téléphones Android autour la captent.",
  "Sa dernière position s'affiche dans l'app.",
  "Sonnerie et « plus chaud / plus froid ».",
  "Marquez-la perdue, ou partagez-la.",
];

const VB_W = 1000;
const VB_H = 560;

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
  // (miroir : elle entre par le haut-gauche et sort par le bas-droite.)
  const pts: P[] = [
    { x: first.x - 130, y: first.y - 42, w: first.w * 0.7 },
    ...base,
    { x: last.x + 120, y: last.y + 46, w: last.w * 1.05 },
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
            {/* Vert de marque, uniforme — léger dégalbe clair→profond pour garder le relief */}
            <linearGradient id="pr-road" x1="100" y1="120" x2="860" y2="470" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#10B981" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
            {/* Ombre douce sous le ruban → la route « repose » sur le sol */}
            <filter id="pr-shadow" x="-10%" y="-10%" width="120%" height="140%">
              <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#0E1E33" floodOpacity="0.18" />
            </filter>
          </defs>
          <path d={path} fill="url(#pr-road)" filter="url(#pr-shadow)" />
          {/* Liseré clair en haut + ombre interne en bas pour le galbe du ruban */}
          <path d={path} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.5" />
        </svg>

        {STEPS_FUNC.map((s, i) => {
          const road = ROAD[i];
          const m = MARKERS[i];
          return (
            <div
              key={i}
              role="listitem"
              className="pr-marker"
              style={{ left: `${(road.x / VB_W) * 100}%`, top: `${(road.y / VB_H) * 100}%` }}
            >
              <div className="pr-label" style={{ transform: `translate(${m.lx}cqw, ${m.ly}cqw)` }}>
                <div className="pr-label-title"><Play size={12} fill={ACCENT} color={ACCENT} /> {s.t}</div>
                <p className="pr-label-desc">{SHORT[i]}</p>
              </div>
              <div
                className="pr-dot"
                style={{ width: `${m.dia}cqw`, height: `${m.dia}cqw`, boxShadow: `0 0 0 ${m.dia * 0.055}cqw ${ACCENT}22, 0 14px 26px -8px rgba(16,42,73,.5)` }}
              >
                <span className="pr-num" style={{ fontSize: `${m.dia * 0.34}cqw` }}>{s.n}</span>
              </div>
              {/* Pied planté dans la route (hauteur ∝ taille = perspective) */}
              <span className="pr-stem" style={{ height: `${m.dia * 0.5}cqw`, background: `linear-gradient(${ACCENT},${ACCENT}00)` }} />
              {/* Ombre portée sur la route au point de contact */}
              <span className="pr-base" style={{ width: `${m.dia * 1.05}cqw`, height: `${m.dia * 0.3}cqw` }} />
            </div>
          );
        })}
      </div>

      {/* Mobile : timeline verticale, même langage visuel */}
      <ol className="principle-stack">
        {STEPS_FUNC.map((s, i) => {
          return (
            <li key={i} className="pr-row">
              <div className="pr-dot pr-dot-sm" style={{ boxShadow: `0 0 0 3px ${ACCENT}22, 0 10px 20px -8px rgba(16,42,73,.45)` }}>
                <span className="pr-num">{s.n}</span>
              </div>
              <div className="pr-row-body">
                <h3 className="pr-label-title"><Play size={12} fill={ACCENT} color={ACCENT} /> {s.t}</h3>
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
