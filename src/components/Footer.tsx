"use client";

import React from "react";
import { Logo } from "./ui";
import { useNav } from "@/lib/useNav";
import type { PageKey } from "@/lib/nav";

export function Footer() {
  const { go, order } = useNav();

  const produit: [PageKey, string][] = [
    ["how", "Comment ça marche"],
    ["products", "Produits & tarifs"],
    ["faq", "FAQ"],
  ];
  const aide: [PageKey, string][] = [
    ["support", "Support"],
    ["faq", "Livraison"],
  ];

  return (
    <footer style={{ borderTop: "1px solid var(--line)", background: "var(--bg-alt)", marginTop: 20 }} className="z">
      <div className="wrap" style={{ padding: "44px 20px 28px" }}>
        <div className="stack-sm" style={{ display: "flex", gap: 30, justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ maxWidth: 300 }}>
            <Logo onClick={() => go("home")} />
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, marginTop: 14 }}>La carte qui retrouve vos objets de valeur, propulsée par les réseaux Find Hub (Android) et Localiser (iPhone).</p>
          </div>
          <div style={{ display: "flex", gap: 50, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>Produit</div>
              {produit.map(([k, l]) => (
                <div key={l} className="navlink" style={{ padding: "6px 0", fontSize: 14 }} onClick={() => go(k)}>{l}</div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>Aide</div>
              {aide.map(([k, l]) => (
                <div key={l} className="navlink" style={{ padding: "6px 0", fontSize: 14 }} onClick={() => go(k)}>{l}</div>
              ))}
              <div className="navlink" style={{ padding: "6px 0", fontSize: 14 }} onClick={() => order()}>Commander</div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--line)", marginTop: 30, paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <span className="muted2" style={{ fontSize: 12.5 }}>© {new Date().getFullYear()} SkyTrack · Cameroun</span>
          <span className="muted2" style={{ fontSize: 12.5 }}>Paiement : MoMo · Orange Money · Visa</span>
        </div>
      </div>
    </footer>
  );
}
