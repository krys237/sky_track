"use client";

import React from "react";
import { Signal, Battery } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Coque de téléphone servant de cadre aux écrans du guide de configuration.
 *
 * Composant volontairement « bête » : il ne connaît ni les étapes ni l'OS. Les
 * écrans et leur enchaînement vivent dans `setup-guide.tsx`, seule source du
 * parcours — c'est ce qui empêche textes et visuels de se désynchroniser.
 */
export function PhonePreview({ screen, title }: { screen: React.ReactNode; title: string }) {
  return (
    <div className="phone">
      <div className="phone-screen">
        <div className="ph-status">
          <span>9:41</span>
          <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <Signal size={11} />
            <Battery size={13} />
          </span>
        </div>
        {screen}
      </div>
      {/* Légende posée sur le châssis sombre : var(--muted) y était illisible. */}
      <div style={{ textAlign: "center", fontSize: 11.5, color: "rgba(255,255,255,.62)", marginTop: 8 }}>{title}</div>
    </div>
  );
}
