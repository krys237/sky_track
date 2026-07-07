"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Fond animé du hero — motif « radar / ondes de signal » DÉCENTRÉ à droite
 * (derrière le visuel produit), posé sur une carte atténuée, avec un pin de
 * géolocalisation au centre. Thème géolocalisation.
 *
 * Adapté de kokonutd/background-circles (21st.dev) : réécrit en styles inline
 * (le projet n'utilise ni Tailwind ni clsx) et recoloré sur la triade SkyTrack —
 * bleu (fiabilité) / vert (signal « localisé ») / ambre (chaleur).
 *
 * Composition (du fond vers l'avant) :
 *   carte floutée → lavis canvas → grille de balayage → anneaux radar → pin.
 * La carte est volontairement basse en opacité + masquée pour NE PAS masquer
 * le radar, qui reste dessiné par-dessus.
 *
 * Purement décoratif → aria-hidden, pointer-events:none, z-index 0.
 */

// Centre du radar (décentré vers la droite, sous le visuel produit)
const CX = "70%";
const CY = "48%";

// Anneaux concentriques, du plus externe au plus interne (rgb bruts des tokens de marque)
const RINGS = [
  { rgb: "37,99,235", inset: "0%" },    // --primary  (bleu)
  { rgb: "5,150,105", inset: "13%" },   // --signal   (vert)
  { rgb: "245,158,11", inset: "26%" },  // --amber    (ambre)
];

export function HeroBackground() {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* Carte en arrière-plan (atténuée + masquée pour laisser voir le radar) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: CX,
          transform: "translate(-50%,-50%)",
          width: "min(720px, 105vw)",
          aspectRatio: "3 / 2",
          backgroundImage: "url(/map-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.32,
          filter: "grayscale(0.25) blur(1.2px)",
          maskImage:
            "radial-gradient(ellipse 62% 70% at 50% 48%, #000 26%, transparent 74%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 62% 70% at 50% 48%, #000 26%, transparent 74%)",
        }}
      />

      {/* Lavis « canvas » : ramène la carte vers la teinte du fond + halo bleu/vert doux */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 55% 60% at " + CX + " " + CY + ", rgba(244,248,252,0.35), transparent 70%), radial-gradient(ellipse 50% 55% at " + CX + " " + CY + ", rgba(37,99,235,0.05), transparent 72%)",
        }}
      />

      {/* Grille en balayage (lignes navy très pâles, masquée au centre) */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          maskImage:
            "radial-gradient(ellipse 45% 55% at " + CX + " " + CY + ", transparent 24%, black 72%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 45% 55% at " + CX + " " + CY + ", transparent 24%, black 72%, transparent 90%)",
        }}
        animate={reduce ? undefined : { backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            backgroundImage:
              "repeating-linear-gradient(100deg, rgba(16,42,73,.55) 0, rgba(16,42,73,.55) 1px, transparent 1px, transparent 4%)",
            opacity: 0.07,
          }}
        />
      </motion.div>

      {/* Cercles concentriques (radar) + ping + pin — décentrés à droite */}
      <div
        style={{
          position: "absolute",
          top: CY,
          left: CX,
          transform: "translate(-50%,-50%)",
          width: "min(520px, 82vw)",
          aspectRatio: "1 / 1",
        }}
      >
        {RINGS.map((r, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              inset: r.inset,
              borderRadius: "50%",
              border: `1.5px solid rgba(${r.rgb},0.30)`,
              background: `radial-gradient(ellipse at center, rgba(${r.rgb},0.05), transparent 68%)`,
            }}
            animate={
              reduce
                ? undefined
                : {
                    rotate: 360,
                    scale: [1, 1.03 + i * 0.02, 1],
                    opacity: [0.55, 0.85, 0.55],
                  }
            }
            transition={{
              rotate: { duration: 26 + i * 6, repeat: Infinity, ease: "linear" },
              scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            {/* Repère sur l'anneau (petit point façon « balise ») */}
            <span
              style={{
                position: "absolute",
                top: "-4px",
                left: "50%",
                width: 8,
                height: 8,
                marginLeft: -4,
                borderRadius: "50%",
                background: `rgb(${r.rgb})`,
                boxShadow: `0 0 12px 2px rgba(${r.rgb},0.55)`,
              }}
            />
          </motion.div>
        ))}

        {/* Ondes « ping » qui se propagent depuis le point localisé (vert = signal) */}
        {!reduce &&
          [0, 1].map((i) => (
            <motion.div
              key={`ping-${i}`}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "30%",
                aspectRatio: "1 / 1",
                translateX: "-50%",
                translateY: "-50%",
                borderRadius: "50%",
                border: "1.5px solid rgba(16,185,129,0.5)",
              }}
              animate={{ scale: [0.5, 2], opacity: [0.6, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 2,
              }}
            />
          ))}

        {/* Pin de géolocalisation (goutte rouge, pointe ancrée au centre du radar) */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-100%)",
          }}
        >
          {/* Ombre au sol (au niveau de la pointe = base de l'ancre) */}
          <motion.div
            style={{
              position: "absolute",
              left: "50%",
              bottom: -3,
              width: 26,
              height: 8,
              marginLeft: -13,
              borderRadius: "50%",
              background: "rgba(14,30,51,0.28)",
              filter: "blur(2.5px)",
            }}
            animate={reduce ? undefined : { scaleX: [1, 0.8, 1], opacity: [0.9, 0.55, 0.9] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* La goutte elle-même (léger rebond) */}
          <motion.div
            style={{ transformOrigin: "bottom center" }}
            animate={reduce ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg
              width="42"
              height="59"
              viewBox="0 0 24 34"
              fill="none"
              style={{ display: "block", filter: "drop-shadow(0 6px 8px rgba(193,23,11,0.35))" }}
            >
              <defs>
                <linearGradient id="skPin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#F0453A" />
                  <stop offset="1" stopColor="#C1170B" />
                </linearGradient>
              </defs>
              <path
                d="M12 0C6.2 0 1.5 4.7 1.5 10.5 1.5 18.4 12 34 12 34S22.5 18.4 22.5 10.5C22.5 4.7 17.8 0 12 0Z"
                fill="url(#skPin)"
              />
              <circle cx="12" cy="10.5" r="3.8" fill="#FFFFFF" />
            </svg>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
