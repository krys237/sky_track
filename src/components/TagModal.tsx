"use client";

import React from "react";
import { X, ArrowRight, Check } from "lucide-react";
import type { TagProduct } from "@/lib/types";
import { Btn, TransparentImage } from "./ui";

export function TagModal({
  product,
  onClose,
  onOrder,
}: {
  product: TagProduct | null;
  onClose: () => void;
  onOrder: () => void;
}) {
  // Fermeture au clavier (Échap) + verrouillage du scroll du body tant que la modale est ouverte
  React.useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div className="tag-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="tag-modal card"
        role="dialog"
        aria-modal="true"
        aria-label={`SkyTrack ${product.name}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="tag-modal-close" onClick={onClose} aria-label="Fermer">
          <X size={18} />
        </button>

        <div className="tag-modal-grid">
          {/* Visuel */}
          <div className="tag-modal-art">
            <TransparentImage src={product.image} alt={`SkyTrack ${product.name}`} />
          </div>

          {/* Contenu */}
          <div className="tag-modal-body">
            <div className="eyebrow" style={{ marginBottom: 10 }}>SkyTrack · {product.name}</div>
            <h3 className="font-display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.02em", margin: "0 0 8px" }}>
              {product.tagline}
            </h3>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.5, margin: "0 0 18px" }}>
              <b style={{ color: "var(--text)" }}>Idéal pour :</b> {product.usage}
            </p>

            <div className="tag-modal-highlights">
              {product.highlights.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Check size={16} style={{ color: "var(--signal)", flex: "0 0 auto", marginTop: 2 }} />
                  <span style={{ fontSize: 13.5, lineHeight: 1.45 }}>{h}</span>
                </div>
              ))}
            </div>

            <div className="tag-modal-specs">
              {product.specs.map((s, i) => (
                <div key={i} className="tag-modal-spec">
                  <s.icon size={16} style={{ color: "var(--signal)", flex: "0 0 auto" }} />
                  <span className="muted" style={{ fontSize: 12.5 }}>{s.label}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, textAlign: "right", marginLeft: "auto" }}>{s.value}</span>
                </div>
              ))}
            </div>

            <Btn variant="primary" onClick={onOrder} style={{ width: "100%", marginTop: 22 }}>
              Commander <ArrowRight size={18} />
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
