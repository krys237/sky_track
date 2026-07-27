"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeft, ArrowRight, Bluetooth, MapPin, RotateCcw, ChevronDown, MoveHorizontal,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Btn } from "@/components/ui";
import { PhonePreview } from "./phones";
import { SETUP_STEPS, resetSteps } from "./setup-guide";
import type { SetupProps } from "./shared";
import type { OS } from "@/lib/types";

/** Cadence de défilement automatique des écrans. */
const CYCLE_MS = 2_600;

/**
 * Vrai sous 760px — même bascule que `.stack-sm`. Sert à choisir la mise en
 * page : deux colonnes sur PC, carrousel swipable sur mobile/tablette. On rend
 * l'une OU l'autre (pas de duplication du contenu dans le DOM). Départ à `false`
 * pour que le rendu serveur corresponde au desktop.
 */
function useIsNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width:760px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return narrow;
}

/**
 * Logo d'OS (Android/Apple) ou de réseau (Find Hub/Localiser), servi depuis
 * `public/os`. Les sources sont des JPG à fond blanc : `mix-blend-mode:multiply`
 * les fond dans le clair de l'UI sans détourage préalable. `zoom` recadre la
 * marge du visuel (nécessaire pour Find Hub, cerné de gris dans le fichier).
 */
function OsLogo({
  src, alt, size = 16, zoom = 1, fit = "contain",
}: { src: string; alt: string; size?: number; zoom?: number; fit?: "contain" | "cover" }) {
  return (
    <span style={{ width: size, height: size, flex: "0 0 auto", display: "inline-flex", overflow: "hidden", borderRadius: 4 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%", height: "100%", objectFit: fit,
          transform: zoom === 1 ? undefined : `scale(${zoom})`,
          mixBlendMode: "multiply",
        }}
      />
    </span>
  );
}

export function StepSetup({ flow, setFlow, next, back, detectedOS }: SetupProps) {
  const os: OS = flow.os || detectedOS || "android";
  const steps = SETUP_STEPS[os];

  const [active, setActive] = useState(0);
  /** Le défilement s'arrête dès que l'utilisateur choisit une étape lui-même. */
  const [auto, setAuto] = useState(true);
  const [resetOpen, setResetOpen] = useState(false);

  const setOS = (v: OS) => {
    setFlow((f) => ({ ...f, os: v }));
    setActive(0); // les parcours n'ont pas les mêmes écrans
  };

  useEffect(() => {
    if (!flow.os) setFlow((f) => ({ ...f, os: detectedOS || "android" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setActive((x) => (x + 1) % steps.length), CYCLE_MS);
    return () => clearInterval(t);
  }, [auto, steps.length, os]);

  const pick = (i: number) => { setAuto(false); setActive(i); };

  /* ── Carrousel mobile ────────────────────────────────────────────────────
     Deux sens de synchronisation : l'étape active pousse le carrousel (défilement
     auto, clic sur une pastille) et le swipe de l'utilisateur remonte l'étape.
     `syncing` empêche le défilement programmé de se faire relire comme un swipe. */
  const reduce = useReducedMotion();
  const narrow = useIsNarrow();
  const trackRef = useRef<HTMLDivElement>(null);
  /** Horodatage du dernier défilement que NOUS déclenchons, pour ne pas le relire comme un swipe. */
  const lastSync = useRef(0);
  const activeRef = useRef(active);
  activeRef.current = active;

  // Sens 1 — l'étape active pousse le carrousel. Les diapos font exactement
  // 100% de la piste, donc la cible est déterministe : index × largeur.
  useEffect(() => {
    if (!narrow) return;
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    const target = active * el.clientWidth;
    if (Math.abs(el.scrollLeft - target) < 4) return;
    lastSync.current = Date.now();
    el.scrollTo({ left: target, behavior: reduce ? "auto" : "smooth" });
  }, [active, narrow, os, reduce]);

  // Sens 2 — le swipe de l'utilisateur remonte l'étape (et coupe le défilement auto).
  // Deux détecteurs redondants (événement 'scroll' + IntersectionObserver) : ils
  // convergent vers le même index, donc en activer deux est sans effet de bord et
  // met à l'abri d'un navigateur où l'un des deux se montre capricieux.
  useEffect(() => {
    if (!narrow) return;
    const el = trackRef.current;
    if (!el) return;

    const commit = (i: number) => {
      if (Date.now() - lastSync.current < 700) return; // notre propre défilement
      if (i >= 0 && i < steps.length && i !== activeRef.current) { setAuto(false); setActive(i); }
    };

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (el.clientWidth) commit(Math.round(el.scrollLeft / el.clientWidth));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });

    const slides = Array.from(el.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) commit(slides.indexOf(best.target as HTMLElement));
      },
      { root: el, threshold: 0.6 },
    );
    slides.forEach((s) => io.observe(s));

    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [narrow, steps.length, os]);

  /* Blocs partagés par les deux mises en page (évite de dupliquer le JSX). */
  const networkChip = (
    <div className="chip" style={{ marginBottom: 20 }}>
      {os === "ios" ? (
        <><OsLogo src="/os/apple-find-my.jpg" alt="" size={18} zoom={1.1} />Réseau Localiser (Apple)</>
      ) : (
        <><OsLogo src="/os/find-hub.jpg" alt="" size={18} zoom={1.75} fit="cover" />Réseau Find Hub (Google)</>
      )}
    </div>
  );

  const dots = (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 12 }}>
      {steps.map((s, d) => (
        <button
          key={s.title}
          className="reset"
          onClick={() => pick(d)}
          aria-label={`Étape ${d + 1} : ${s.title}`}
          style={{ width: 7, height: 7, borderRadius: "50%", cursor: "pointer", background: d === active ? "var(--signal)" : "var(--line)" }}
        />
      ))}
    </div>
  );

  const resetCard = (
    <div className="card" style={{ marginTop: 22, padding: 0, overflow: "hidden" }}>
      <button className="setup-toggle" onClick={() => setResetOpen((v) => !v)} aria-expanded={resetOpen}>
        <RotateCcw size={16} style={{ color: "var(--amber)", flex: "0 0 auto" }} />
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>Changer de téléphone, ou la carte refuse de se connecter ?</span>
        <ChevronDown size={16} className="muted" style={{ flex: "0 0 auto", transform: resetOpen ? "rotate(180deg)" : "none", transition: "transform .18s ease" }} />
      </button>
      {resetOpen && (
        <div className="fade" style={{ padding: "0 15px 15px" }}>
          <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.55, margin: "0 0 14px" }}>
            Une carte se connecte à <b style={{ color: "var(--text)" }}>un seul réseau à la fois</b>.
            Pour la rattacher ailleurs, réinitialisez-la :
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {resetSteps(os).map((r, i) => (
              <div key={r.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span className="font-mono" style={{ flex: "0 0 auto", width: 24, height: 24, borderRadius: 7, background: "rgba(245,158,11,.12)", border: "1px solid rgba(245,158,11,.3)", color: "var(--amber-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, fontWeight: 700 }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>{r.title}</div>
                  <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fade">
      <h2 className="font-display" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Connectez votre carte</h2>
      <p className="muted" style={{ marginBottom: 20 }}>On a détecté votre téléphone — vous pouvez aussi choisir manuellement.</p>

      <div className="seg" style={{ marginBottom: 18 }}>
        <button className={os === "android" ? "on" : ""} onClick={() => setOS("android")}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <OsLogo src="/os/android.jpg" alt="" size={16} zoom={1.15} />Android
          </span>
        </button>
        <button className={os === "ios" ? "on" : ""} onClick={() => setOS("ios")}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <OsLogo src="/os/apple.png" alt="" size={16} zoom={1.55} />iPhone
          </span>
        </button>
      </div>

      {/* Prérequis : conditions à réunir avant de commencer, pas une étape du
          parcours — d'où le bandeau plutôt qu'un numéro. */}
      <div className="card" style={{ padding: "10px 14px", marginBottom: 24, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <span className="muted2" style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".08em" }}>Avant de commencer</span>
        <span style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 13 }}>
          <Bluetooth size={14} style={{ color: "var(--primary)" }} /> Bluetooth activé
        </span>
        <span style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 13 }}>
          <MapPin size={14} style={{ color: "var(--primary)" }} /> Localisation (GPS) activée
        </span>
      </div>

      {narrow ? (
        /* Mobile / tablette — carrousel : une diapo = un écran + sa consigne,
           pour que le texte et le visuel restent solidaires pendant le swipe. */
        <div>
          {networkChip}

          <div
            className="setup-carousel"
            ref={trackRef}
            role="group"
            aria-label="Étapes de configuration — faites défiler horizontalement"
          >
            {steps.map((s, i) => (
              <div className="setup-slide" key={s.title} aria-hidden={i !== active}>
                <PhonePreview screen={s.screen} title={s.title} />
                <div className="setup-slide-text">
                  <span className="setup-step-num font-mono">{i + 1}</span>
                  <span className="setup-step-txt" style={{ opacity: 1 }}>{s.text}</span>
                </div>
              </div>
            ))}
          </div>

          {dots}
          <p className="setup-swipe-hint">
            <MoveHorizontal size={13} /> Glissez pour voir l&apos;étape suivante
          </p>

          {resetCard}
        </div>
      ) : (
        /* PC — mise en page d'origine : guide à gauche, écran animé à droite. */
        <div className="stack-sm" style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
          <div className="setup-guide-col">
            {networkChip}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {steps.map((s, i) => {
                const on = i === active;
                return (
                  <button
                    key={s.title}
                    className={`setup-step ${on ? "on" : ""}`}
                    onClick={() => pick(i)}
                    aria-current={on}
                  >
                    <span className="setup-step-num font-mono">{i + 1}</span>
                    <span className="setup-step-txt">{s.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Réinitialisation — dépannage, replié par défaut. */}
            {resetCard}
          </div>

          <div className="setup-phone-col">
            <div style={{ textAlign: "center" }}>
              <PhonePreview screen={steps[active].screen} title={steps[active].title} />
              {dots}
            </div>
          </div>
        </div>
      )}

      <div className="stack-sm" style={{ display: "flex", gap: 12, marginTop: 30 }}>
        <Btn variant="ghost" onClick={back}><ChevronLeft size={16} /> Retour</Btn>
        <Btn variant="primary" onClick={next}>Télécharger l&apos;application <ArrowRight size={16} /></Btn>
      </div>
    </div>
  );
}
