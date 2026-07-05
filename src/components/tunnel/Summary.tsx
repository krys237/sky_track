"use client";

import React from "react";
import { PACKS, fcfa } from "@/lib/content";
import type { Flow } from "@/lib/types";

export function Summary({ flow }: { flow: Flow }) {
  const pack = PACKS.find((p) => p.id === flow.pack);
  if (!pack) return null;
  return (
    <div className="card" style={{ padding: 20, height: "fit-content" }}>
      <div className="eyebrow" style={{ marginBottom: 14 }}>Votre commande</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span>Pack {pack.name}</span><span className="muted">{pack.cards} carte{pack.cards > 1 ? "s" : ""}</span>
      </div>
      <div style={{ borderTop: "1px solid var(--line)", margin: "14px 0", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="muted" style={{ fontSize: 14 }}>Total</span>
        <span className="font-display" style={{ fontSize: 22, fontWeight: 700 }}>{fcfa(pack.price)}</span>
      </div>
      {flow.contact && <div className="muted2" style={{ fontSize: 12, marginTop: 6 }}>Contact : {flow.contact}</div>}
    </div>
  );
}
