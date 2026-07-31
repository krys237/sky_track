"use client";

import React from "react";
import { Star, Check, ChevronRight } from "lucide-react";
import { PACKS, TAG_PRODUCTS } from "@/lib/content";
import type { Pack, PackId } from "@/lib/types";
import { Btn } from "./ui";

// Les caractéristiques ne sont plus figées « tracker » : elles proviennent des
// highlights réels de chaque produit (TAG_PRODUCTS). Sans ça, le chargeur — ni
// tracker, ni sonore, ni lié à un OS — affichait trois affirmations fausses
// reprises telles quelles des deux traceurs.

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
        const product = TAG_PRODUCTS.find((t) => t.id === p.id);
        const isAccessory = p.id === "chargeur";
        const features = product?.highlights.slice(0, 3) ?? [];
        return (
          <div key={p.id} className="card card-interactive" style={{ padding: 26, position: "relative", borderColor: p.best || active ? "rgba(16,185,129,.5)" : undefined }}>
            {p.best && <span className="chip" style={{ position: "absolute", top: -13, left: 22, background: "var(--amber)", color: "#231404", border: 0, fontWeight: 700, fontSize: 12 }}><Star size={12} /> {p.tag}</span>}
            <h3 className="font-display" style={{ fontSize: 22, fontWeight: 700, margin: "6px 0 4px" }}>SkyTrack {p.name}</h3>
            <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>{isAccessory ? "Accessoire de recharge" : "Tracker connecté"}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
              <span className="font-display" style={{ fontSize: 30, fontWeight: 700 }}>{p.price.toLocaleString("fr-FR").replace(/ /g, " ")}</span>
              <span className="muted" style={{ fontSize: 14 }}>FCFA</span>
            </div>
            {!p.best && <div className="sig" style={{ fontSize: 12, marginBottom: 12, minHeight: 16 }}>{p.tag}</div>}
            {p.best && <div style={{ minHeight: 16, marginBottom: 12 }} />}
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.5, margin: "0 0 20px", minHeight: 42 }}>{p.desc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22 }}>
              {features.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                  <Check size={15} style={{ color: "var(--signal)", flex: "0 0 auto", marginTop: 2 }} />
                  <span className="muted" style={{ fontSize: 13 }}>{t}</span>
                </div>
              ))}
            </div>
            <Btn variant={p.best ? "primary" : "sig"} onClick={() => onChoose(p)} style={{ width: "100%" }}>
              Choisir ce produit <ChevronRight size={16} />
            </Btn>
          </div>
        );
      })}
    </div>
  );
}
