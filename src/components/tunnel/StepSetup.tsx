"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft, ArrowRight, Bluetooth, MapPin, RotateCcw, ChevronDown, MoveHorizontal,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Btn } from "@/components/ui";
import { SetupScreenView } from "./phones";
import { SETUP_STEPS, resetSteps } from "./setup-guide";
import type { SetupProps } from "./shared";
import type { OS } from "@/lib/types";

/** Cadence de défilement automatique des écrans. */
const CYCLE_MS = 3_200;

/**
 * Vrai sous 760px — même bascule que `.stack-sm`. Choisit la mise en page :
 * deux colonnes sur PC, carrousel swipable sur mobile/tablette. Départ à `false`
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
 * `public/os`. Sources JPG à fond blanc : `mix-blend-mode:multiply` les fond
 * dans le clair de l'UI ; `zoom` recadre la marge (cas Find Hub, cerné de gris).
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

  /* Piste unique : tous les écrans à plat, mais on retient à quelle étape et à
     quel rang dans l'étape appartient chaque diapo. Un seul axe de navigation. */
  const flat = useMemo(
    () => steps.flatMap((s, si) => s.screens.map((sc, ci) => ({ si, ci, sc }))),
    [steps],
  );
  const stepStart = useMemo(() => {
    const out: number[] = [];
    let n = 0;
    steps.forEach((s, si) => { out[si] = n; n += s.screens.length; });
    return out;
  }, [steps]);

  const [active, setActive] = useState(0); // index dans `flat`
  const [auto, setAuto] = useState(true);
  const [resetOpen, setResetOpen] = useState(false);

  const activeStep = flat[active]?.si ?? 0;
  const activeSub = flat[active]?.ci ?? 0;

  const setOS = (v: OS) => {
    setFlow((f) => ({ ...f, os: v }));
    setActive(0);
  };

  useEffect(() => {
    if (!flow.os) setFlow((f) => ({ ...f, os: detectedOS || "android" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setActive((x) => (x + 1) % flat.length), CYCLE_MS);
    return () => clearInterval(t);
  }, [auto, flat.length, os]);

  /** Sélectionne une diapo (clic pastille / point / liste) et coupe l'auto. */
  const pick = (i: number) => { setAuto(false); setActive(i); };
  /** Saute au 1er écran d'une étape (clic sur le décompte). */
  const gotoStep = (si: number) => pick(stepStart[si]);

  const reduce = useReducedMotion();
  const narrow = useIsNarrow();
  const trackRef = useRef<HTMLDivElement>(null);
  const lastSync = useRef(0);
  const activeRef = useRef(active);
  activeRef.current = active;

  // Sens 1 — la diapo active pousse le carrousel (cible déterministe : index × largeur).
  useEffect(() => {
    if (!narrow) return;
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    const target = active * el.clientWidth;
    if (Math.abs(el.scrollLeft - target) < 4) return;
    lastSync.current = Date.now();
    el.scrollTo({ left: target, behavior: reduce ? "auto" : "smooth" });
  }, [active, narrow, os, reduce]);

  // Sens 2 — le swipe remonte la diapo active (et coupe l'auto). Deux détecteurs
  // redondants (scroll + IntersectionObserver) pour tenir sur tout navigateur.
  useEffect(() => {
    if (!narrow) return;
    const el = trackRef.current;
    if (!el) return;

    const commit = (i: number) => {
      if (Date.now() - lastSync.current < 700) return;
      if (i >= 0 && i < flat.length && i !== activeRef.current) { setAuto(false); setActive(i); }
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
  }, [narrow, flat.length, os]);

  /* ── Blocs partagés ─────────────────────────────────────────────────────── */
  const networkChip = (
    <div className="chip" style={{ marginBottom: 20 }}>
      {os === "ios" ? (
        <><OsLogo src="/os/apple-find-my.jpg" alt="" size={18} zoom={1.1} />Réseau Localiser (Apple)</>
      ) : (
        <><OsLogo src="/os/find-hub.jpg" alt="" size={18} zoom={1.75} fit="cover" />Réseau Find Hub (Google)</>
      )}
    </div>
  );

  /* Décompte des étapes : gros repère d'avancement, cliquable pour sauter. */
  const stepsRow = (
    <div className="setup-steps-row" role="tablist" aria-label="Étapes de configuration">
      {steps.map((s, si) => (
        <button
          key={si}
          role="tab"
          aria-selected={si === activeStep}
          className={`setup-step-pill${si === activeStep ? " on" : ""}${si < activeStep ? " done" : ""}`}
          onClick={() => gotoStep(si)}
        >
          <span className="setup-step-pill-num font-mono">{si + 1}</span>
          <span className="setup-step-pill-label">{s.title}</span>
        </button>
      ))}
    </div>
  );

  /* Points des sous-écrans de l'étape courante (n'apparaissent que si >1 écran). */
  const subDots = steps[activeStep].screens.length > 1 && (
    <div className="setup-subdots" aria-label={`Écran ${activeSub + 1} sur ${steps[activeStep].screens.length}`}>
      {steps[activeStep].screens.map((_, ci) => (
        <button
          key={ci}
          className="reset"
          onClick={() => pick(stepStart[activeStep] + ci)}
          aria-label={`Écran ${ci + 1}`}
          style={{ width: 7, height: 7, borderRadius: "50%", cursor: "pointer", background: ci === activeSub ? "var(--signal)" : "var(--line)" }}
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

      {/* Prérequis : conditions à réunir avant de commencer, pas une étape. */}
      <div className="card" style={{ padding: "10px 14px", marginBottom: 24, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <span className="muted2" style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".08em" }}>Avant de commencer</span>
        <span style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 13 }}>
          <Bluetooth size={14} style={{ color: "var(--primary)" }} /> Bluetooth activé
        </span>
        <span style={{ display: "flex", gap: 7, alignItems: "center", fontSize: 13 }}>
          <MapPin size={14} style={{ color: "var(--primary)" }} /> Localisation (GPS) activée
        </span>
      </div>

      {networkChip}
      {stepsRow}

      {narrow ? (
        /* Mobile / tablette — carrousel piste-unique : une diapo = un écran réel
           + sa consigne, solidaires pendant le swipe. */
        <div className="setup-narrow">
          <div
            className="setup-carousel"
            ref={trackRef}
            role="group"
            aria-label="Écrans de configuration — faites défiler horizontalement"
          >
            {flat.map((f, i) => (
              <div className="setup-slide" key={`${f.si}-${f.ci}`} aria-hidden={i !== active}>
                <SetupScreenView screen={f.sc} />
                <div className="setup-slide-text">{f.sc.caption}</div>
              </div>
            ))}
          </div>

          {subDots}
          <p className="setup-swipe-hint">
            <MoveHorizontal size={13} /> Glissez pour l&apos;écran suivant
          </p>
        </div>
      ) : (
        /* PC — deux colonnes : guide détaillé à gauche, écran actif à droite. */
        <div className="stack-sm" style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
          <div className="setup-guide-col">
            <div className="setup-steplist">
              {steps.map((s, si) => (
                <div className="setup-steplist-group" key={si}>
                  <button
                    className={`setup-steplist-head${si === activeStep ? " on" : ""}`}
                    onClick={() => gotoStep(si)}
                    aria-current={si === activeStep}
                  >
                    <span className="setup-step-num font-mono">{si + 1}</span>
                    <span>{s.title}</span>
                  </button>
                  {si === activeStep && (
                    <div className="setup-steplist-sub">
                      {s.screens.map((sc, ci) => (
                        <button
                          key={ci}
                          className={`setup-substep${stepStart[si] + ci === active ? " on" : ""}`}
                          onClick={() => pick(stepStart[si] + ci)}
                        >
                          <span className="setup-substep-dot" />
                          <span>{sc.caption}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {resetCard}
          </div>

          <div className="setup-phone-col">
            <div style={{ textAlign: "center", width: "100%" }}>
              <SetupScreenView screen={flat[active].sc} />
              <div className="setup-slide-text setup-slide-text--center">{flat[active].sc.caption}</div>
              {subDots}
            </div>
          </div>
        </div>
      )}

      {narrow && resetCard}

      <div className="stack-sm" style={{ display: "flex", gap: 12, marginTop: 30 }}>
        <Btn variant="ghost" onClick={back}><ChevronLeft size={16} /> Retour</Btn>
        <Btn variant="primary" onClick={next}>Télécharger l&apos;application <ArrowRight size={16} /></Btn>
      </div>
    </div>
  );
}
