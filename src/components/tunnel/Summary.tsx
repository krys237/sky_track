"use client";

import React from "react";
import { PACKS, TAG_PRODUCTS, fcfa } from "@/lib/content";
import type { Flow } from "@/lib/types";

export function Summary({ flow }: { flow: Flow }) {
  const pack = PACKS.find((p) => p.id === flow.pack);
  if (!pack) return null;
  const product = TAG_PRODUCTS.find((t) => t.id === pack.id);
  return (
    <div className="card" style={{ padding: 20, height: "fit-content" }}>
      <div className="eyebrow" style={{ marginBottom: 14 }}>Votre commande</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        {product && (
          <span
            style={{
              width: 54, height: 54, borderRadius: 12, flex: "0 0 auto",
              background: "#fff", border: "1px solid var(--line)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 6, overflow: "hidden",
            }}
          >
            <img src={product.image} alt={`SkyTrack ${pack.name}`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} />
          </span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600 }}>SkyTrack {pack.name}</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{pack.cards} unité{pack.cards > 1 ? "s" : ""}</div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--line)", margin: "14px 0", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="muted" style={{ fontSize: 14 }}>Total</span>
        <span className="font-display" style={{ fontSize: 22, fontWeight: 700 }}>{fcfa(pack.price)}</span>
      </div>
      {flow.contact && <div className="muted2" style={{ fontSize: 12, marginTop: 6 }}>Contact : {flow.contact}</div>}
    </div>
  );
}
