"use client";

import React from "react";
import type { SetupScreen } from "./setup-guide";

/**
 * Affiche UN écran du guide : soit une capture réelle plein-cadre (coque déjà
 * dans l'image) surmontée d'un repère de tap animé sur le bouton à toucher,
 * soit un écran dessiné en code (l'allumage). Ne connaît ni l'étape ni l'OS —
 * tout vient de `setup-guide.tsx`, source unique du parcours.
 *
 * Le repère se positionne en % du .setup-shot-inner, qui épouse exactement
 * l'image (hauteur 100 %, largeur auto) : les % du repère = % de l'image.
 */
export function SetupScreenView({ screen }: { screen: SetupScreen }) {
  const isNode = !!screen.node;
  return (
    <div className={`setup-shot${isNode ? " setup-shot--node" : ""}`}>
      <div className="setup-shot-inner">
        {isNode ? (
          screen.node
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="setup-shot-img" src={screen.img} alt={screen.alt || ""} draggable={false} />
            {screen.hint && (
              <span
                className="setup-tap"
                style={{ left: `${screen.hint.x}%`, top: `${screen.hint.y}%` }}
                aria-hidden
              >
                <span className="setup-tap-ring" />
                <span className="setup-tap-dot" />
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
