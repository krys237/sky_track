"use client";

import React from "react";
import { Star, Battery, Volume2, Smartphone, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PACKS } from "@/lib/content";
import type { Pack, PackId } from "@/lib/types";
import { Btn } from "./ui";

const FEATURES: [LucideIcon, string][] = [
  [Battery, "Longue autonomie, rechargeable"],
  [Volume2, "Sonnerie forte intégrée"],
  [Smartphone, "Android uniquement (Google Find Hub)"],
];

export function PackGrid({
  onChoose,
  selected,
}: {
  onChoose: (pack: Pack) => void;
  selected?: PackId;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
      {PACKS.map((p) => {
        const active = selected === p.id;
        return (
          <div key={p.id} className="card card-interactive" style={{ padding: 26, position: "relative", borderColor: p.best || active ? "rgba(16,185,129,.5)" : undefined }}>
            {p.best && <span className="chip" style={{ position: "absolute", top: -13, left: 22, background: "var(--amber)", color: "#231404", border: 0, fontWeight: 700, fontSize: 12 }}><Star size={12} /> {p.tag}</span>}
            <h3 className="font-display" style={{ fontSize: 22, fontWeight: 700, margin: "6px 0 4px" }}>{p.name}</h3>
            <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>{p.cards} carte{p.cards > 1 ? "s" : ""} SkyTrack</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
              <span className="font-display" style={{ fontSize: 30, fontWeight: 700 }}>{p.price.toLocaleString("fr-FR").replace(/ /g, " ")}</span>
              <span className="muted" style={{ fontSize: 14 }}>FCFA</span>
            </div>
            {!p.best && <div className="sig" style={{ fontSize: 12, marginBottom: 12, minHeight: 16 }}>{p.tag}</div>}
            {p.best && <div style={{ minHeight: 16, marginBottom: 12 }} />}
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.5, margin: "0 0 20px", minHeight: 42 }}>{p.desc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22 }}>
              {FEATURES.map(([Ic, t], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <Ic size={15} style={{ color: "var(--signal)", flex: "0 0 auto" }} />
                  <span className="muted" style={{ fontSize: 13 }}>{t}</span>
                </div>
              ))}
            </div>
            <Btn variant={p.best ? "primary" : "sig"} onClick={() => onChoose(p)} style={{ width: "100%" }}>
              Choisir ce pack <ChevronRight size={16} />
            </Btn>
          </div>
        );
      })}
    </div>
  );
}
