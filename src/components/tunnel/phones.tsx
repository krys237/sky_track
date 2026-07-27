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
  const reduce = useReducedMotion();

  /* Le titre sert de clé : il change à chaque étape, donc AnimatePresence
     rejoue l'entrée. Sur mobile chaque diapo a son propre écran figé — la clé
     ne bouge pas et rien ne s'anime, c'est le swipe qui fait la transition. */
  const enter = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: 22, filter: "blur(3px)" },
        animate: { opacity: 1, x: 0, filter: "blur(0px)" },
        exit: { opacity: 0, x: -22, filter: "blur(3px)" },
      };

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
        {/* `mode="wait"` : l'écran sortant s'efface avant l'entrant, sinon les
            deux se superposent dans la coque. Le wrapper reprend le flex de
            .phone-screen pour que .ph-body{flex:1} continue de s'étirer. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={title}
            style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            {...enter}
          >
            {screen}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Légende posée sur le châssis sombre : var(--muted) y était illisible. */}
      <div style={{ textAlign: "center", fontSize: 11.5, color: "rgba(255,255,255,.62)", marginTop: 8, minHeight: 16 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={title}
            style={{ display: "inline-block" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.22 }}
          >
            {title}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
