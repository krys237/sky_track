"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * InteractiveFolderGallery — adaptation de https://21st.dev (folder gallery)
 * au projet SkyTrack : pas de Tailwind (styles inline + tokens CSS du projet),
 * pochette en encre navy (le noir du modèle d'origine est banni par le design
 * system), et 5 photos d'usage réel des tags. L'interaction est conservée :
 * pile → déploiement au survol → ouverture au clic → glisser vers le bas pour
 * refermer, les photos étant manipulables une fois ouvertes.
 */

export interface GalleryPhoto {
  id: string | number;
  image: string;
  caption?: string;
}

const defaultPhotos: GalleryPhoto[] = [
  { id: "portefeuille", image: "/usage/usage-portefeuille.jpg", caption: "Votre portefeuille" },
  { id: "cles", image: "/usage/usage-cles.jpg", caption: "Votre trousseau" },
  { id: "smart", image: "/usage/usage-smart-tags.jpg", caption: "Carte & tag rond" },
  { id: "animal", image: "/usage/usage-animal.jpg", caption: "Le collier de l'animal" },
  { id: "bagages", image: "/usage/usage-bagages.jpg", caption: "Vos bagages" },
];

export interface InteractiveFolderGalleryProps {
  photos?: GalleryPhoto[];
  folderName?: string;
  dragHintText?: string;
  className?: string;
}

const SPRING = { type: "spring" as const, stiffness: 350, damping: 30 };
const CARD_W = 168;
const CARD_H = 216;
const STAGE_W = 400;
const STAGE_H = 470;
// Largeur occupée par l'éventail ouvert (± ~264px du centre) : sert de base à la
// mise à l'échelle pour que la scène tienne toujours dans sa colonne.
const DESIGN_W = 560;

export function InteractiveFolderGallery({
  photos = defaultPhotos,
  folderName = "Vos essentiels",
  dragHintText = "Glissez une photo vers le bas — ou cliquez ici pour refermer",
  className,
}: InteractiveFolderGalleryProps) {
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [hoverFolder, setHoverFolder] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);
  const reduce = useReducedMotion();
  const mid = (photos.length - 1) / 2;

  // Mise à l'échelle responsive : la scène est dessinée à taille fixe puis
  // réduite pour tenir dans la largeur disponible (colonne hero / mobile).
  const rootRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      setScale(Math.min(1, el.clientWidth / DESIGN_W));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const openFolder = () => setIsFolderOpen(true);
  const closeFolder = () => {
    setIsFolderOpen(false);
    setHoverFolder(false);
  };

  return (
    <div
      ref={rootRef}
      className={`ifg-root${className ? " " + className : ""}`}
      style={{
        width: "100%",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        height: STAGE_H * scale,
      }}
    >
      <div
        style={{
          position: "relative",
          width: STAGE_W,
          height: STAGE_H,
          display: "flex",
          justifyContent: "center",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        {/* Ombre / socle de la pochette */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 26,
            width: 300,
            height: 190,
            borderRadius: 20,
            filter: "drop-shadow(0 30px 40px rgba(16,42,73,.28))",
            pointerEvents: "none",
          }}
          initial={false}
          animate={{ opacity: isFolderOpen ? 0 : 1, scale: isFolderOpen ? 0.9 : 1 }}
        >
          <div
            style={{
              position: "absolute", top: 0, left: 0, width: 118, height: 34,
              background: "linear-gradient(to top,#16283f,#22364f)",
              borderRadius: "12px 12px 0 0",
              borderTop: "1px solid rgba(255,255,255,.12)",
              borderLeft: "1px solid rgba(255,255,255,.12)",
              borderRight: "1px solid rgba(255,255,255,.12)",
            }}
          />
          <div
            style={{
              position: "absolute", top: 28, left: 0, right: 0, bottom: 0,
              background: "linear-gradient(to bottom,#16283f,#0b1626)",
              borderRadius: "0 12px 12px 12px",
              border: "1px solid rgba(255,255,255,.10)",
              boxShadow: "inset 0 0 40px rgba(0,0,0,.55)",
            }}
          />
          <div
            style={{
              position: "absolute", top: 38, left: 8, right: 8, bottom: 8,
              background: "#0a1320", borderRadius: 10,
              boxShadow: "inset 0 2px 8px rgba(0,0,0,.6)",
            }}
          />
        </motion.div>

        {/* Pile de photos */}
        <div style={{ position: "absolute", bottom: 40, display: "flex", justifyContent: "center" }}>
          {photos.map((photo, i) => {
            const offset = i - mid;

            const stackY = hoverFolder ? offset * -10 - 34 : offset * -5;
            const stackX = hoverFolder ? offset * 26 : offset * 3;
            const stackRotate = hoverFolder ? offset * 7 : offset * 3;
            const stackScale = 1 - Math.abs(offset) * 0.03;

            // Éventail en arc : les cartes extérieures pivotent et descendent légèrement.
            const openTarget = {
              y: -128 + Math.abs(offset) * 7,
              x: offset * 90,
              rotate: offset * 6,
              scale: 1.04,
              zIndex: 40 - Math.abs(offset),
            };
            const closedTarget = { y: stackY, x: stackX, rotate: stackRotate, scale: stackScale, zIndex: i + 10 };
            const showCaption = isFolderOpen && (hoveredId === photo.id || (hoveredId === null && offset === 0));

            return (
              <motion.div
                key={photo.id}
                drag={isFolderOpen}
                dragSnapToOrigin
                dragElastic={0.4}
                onHoverStart={() => isFolderOpen && setHoveredId(photo.id)}
                onHoverEnd={() => setHoveredId((cur) => (cur === photo.id ? null : cur))}
                onDragEnd={(_e, info) => {
                  if (isFolderOpen && info.offset.y > 100) closeFolder();
                }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: CARD_W,
                  height: CARD_H,
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,.7)",
                  boxShadow: "0 20px 40px rgba(16,42,73,.35)",
                  transformOrigin: "bottom center",
                  cursor: isFolderOpen ? "grab" : "default",
                  pointerEvents: isFolderOpen ? "auto" : "none",
                }}
                animate={isFolderOpen ? openTarget : closedTarget}
                whileHover={isFolderOpen ? { scale: 1.1, zIndex: 100 } : undefined}
                whileDrag={{ scale: 1.16, zIndex: 150, cursor: "grabbing" }}
                transition={SPRING}
              >
                <img
                  src={photo.image}
                  alt={photo.caption || "Usage SkyTrack"}
                  draggable={false}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none", userSelect: "none" }}
                />
                {photo.caption && (
                  <motion.div
                    initial={false}
                    animate={{ opacity: showCaption ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute", left: 0, right: 0, bottom: 0,
                      padding: "26px 12px 11px",
                      background: "linear-gradient(to top, rgba(9,18,32,.85), transparent)",
                      color: "#fff", fontSize: 12.5, fontWeight: 600, letterSpacing: "-.01em",
                      pointerEvents: "none",
                    }}
                  >
                    {photo.caption}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Rabat avant cliquable de la pochette */}
        <motion.div
          role="button"
          tabIndex={isFolderOpen ? -1 : 0}
          aria-label={`Ouvrir : ${folderName}`}
          style={{
            position: "absolute", bottom: 0, width: 322, height: 128,
            transformOrigin: "bottom", cursor: "pointer", zIndex: 20,
            filter: "drop-shadow(0 -16px 34px rgba(16,42,73,.30))",
          }}
          initial={false}
          animate={{
            opacity: isFolderOpen ? 0 : 1,
            rotateX: hoverFolder ? -24 : 0,
            y: hoverFolder ? 8 : 0,
            pointerEvents: isFolderOpen ? "none" : "auto",
          }}
          transition={SPRING}
          onMouseEnter={() => setHoverFolder(true)}
          onMouseLeave={() => setHoverFolder(false)}
          onClick={openFolder}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openFolder();
            }
          }}
        >
          <div
            style={{
              width: "100%", height: "100%",
              background: "linear-gradient(to bottom,#22364f,#101d30)",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,.18)",
              boxShadow: "inset 0 2px 10px rgba(255,255,255,.10)",
              position: "relative", overflow: "hidden",
              display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 26,
            }}
          >
            <div
              style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 1,
                background: "linear-gradient(to right, transparent, rgba(255,255,255,.45), transparent)",
              }}
            />
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 9,
                padding: "9px 16px", borderRadius: 999,
                background: "#fff", boxShadow: "0 6px 16px -8px rgba(16,42,73,.5)",
              }}
            >
              <span
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "var(--signal-bright, #10B981)",
                  boxShadow: "0 0 0 4px rgba(16,185,129,.18)",
                }}
              />
              <span style={{ color: "var(--text,#0E1E33)", fontSize: 13.5, fontWeight: 600, letterSpacing: "-.01em" }}>
                {folderName}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Indice / bouton de fermeture (glisser vers le bas OU cliquer) */}
        <motion.button
          type="button"
          initial={false}
          animate={{ opacity: isFolderOpen ? 1 : 0, y: isFolderOpen ? 0 : 40 }}
          transition={reduce ? { duration: 0 } : undefined}
          onClick={() => isFolderOpen && closeFolder()}
          style={{
            position: "absolute", bottom: 6, padding: "8px 18px", borderRadius: 999,
            background: "var(--surface-2,#F7FAFD)", border: "1px solid var(--line,rgba(16,42,73,.1))",
            color: "var(--muted,#55708A)", fontSize: 11.5, fontWeight: 600, fontFamily: "inherit",
            textTransform: "uppercase", letterSpacing: ".08em", whiteSpace: "nowrap",
            cursor: isFolderOpen ? "pointer" : "default", pointerEvents: isFolderOpen ? "auto" : "none",
          }}
        >
          {dragHintText}
        </motion.button>
      </div>
    </div>
  );
}

export { InteractiveFolderGallery as Component };
export default InteractiveFolderGallery;
