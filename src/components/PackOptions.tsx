"use client";

import React from "react";
import { Star, Check, Minus, Plus, ArrowRight } from "lucide-react";
import { PACK_OPTIONS, TAG_PRODUCTS, fcfa } from "@/lib/content";
import { Btn } from "./ui";
import { TransparentImage } from "./ui";

const MIN_QTY = 1;
const MAX_QTY = 5;

export function PackOptions({ onOrder }: { onOrder: () => void }) {
  // Quantité par produit — présentielle pour l'instant (non transmise à la commande, cf JOURNAL.md)
  const [qty, setQty] = React.useState<Record<string, number>>({ carte: 1, rond: 1 });
  const step = (id: string, d: number) =>
    setQty((q) => ({ ...q, [id]: Math.min(MAX_QTY, Math.max(MIN_QTY, (q[id] ?? 1) + d)) }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18, maxWidth: 760, margin: "0 auto" }}>
      {PACK_OPTIONS.map((opt) => {
        const p = TAG_PRODUCTS.find((t) => t.id === opt.productId)!;
        const q = qty[opt.productId] ?? 1;
        return (
          <div
            key={opt.productId}
            className="card card-interactive"
            style={{ padding: 24, position: "relative", display: "flex", flexDirection: "column", borderColor: opt.best ? "rgba(16,185,129,.5)" : undefined }}
          >
            {opt.best && (
              <span className="chip" style={{ position: "absolute", top: -13, left: 22, background: "var(--amber)", color: "#231404", border: 0, fontWeight: 700, fontSize: 12 }}>
                <Star size={12} /> Le plus populaire
              </span>
            )}

            <div style={{ borderRadius: 16, background: "linear-gradient(160deg,#E3EEFB,#F7FAFD)", border: "1px solid var(--line)", height: 150, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <TransparentImage src={p.image} alt={`SkyTrack ${p.name}`} style={{ maxHeight: 110, width: "auto", filter: "drop-shadow(0 16px 26px rgba(16,42,73,.3))" }} />
            </div>

            <h3 className="font-display" style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>SkyTrack {p.name}</h3>
            <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.45, margin: "0 0 16px" }}>{p.tagline}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              {p.highlights.slice(0, 3).map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                  <Check size={15} style={{ color: "var(--signal)", flex: "0 0 auto", marginTop: 2 }} />
                  <span style={{ fontSize: 13 }}>{h}</span>
                </div>
              ))}
            </div>

            {/* Quantité */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, marginTop: "auto" }}>
              <span className="muted" style={{ fontSize: 13, fontWeight: 500 }}>Quantité</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button className="qty-btn" onClick={() => step(opt.productId, -1)} disabled={q <= MIN_QTY} aria-label="Diminuer la quantité"><Minus size={15} /></button>
                <span className="font-display" style={{ minWidth: 26, textAlign: "center", fontSize: 16, fontWeight: 700 }}>{q}</span>
                <button className="qty-btn" onClick={() => step(opt.productId, 1)} disabled={q >= MAX_QTY} aria-label="Augmenter la quantité"><Plus size={15} /></button>
              </div>
            </div>

            {/* Prix */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span className="font-display" style={{ fontSize: 26, fontWeight: 700 }}>{fcfa(opt.price * q)}</span>
            </div>
            <div className="muted2" style={{ fontSize: 11.5, marginBottom: 16 }}>Tarif indicatif · {fcfa(opt.price)} l&apos;unité</div>

            <Btn variant={opt.best ? "primary" : "sig"} onClick={onOrder} style={{ width: "100%" }}>
              Commander <ArrowRight size={16} />
            </Btn>
          </div>
        );
      })}
    </div>
  );
}
