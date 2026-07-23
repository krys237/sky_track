"use client";

import React, { useEffect, useState } from "react";
import {
  Smartphone, ChevronLeft, ArrowRight, Bluetooth, MapPin, RotateCcw, ChevronDown,
} from "lucide-react";
import { Btn } from "@/components/ui";
import { PhonePreview } from "./phones";
import { SETUP_STEPS, resetSteps } from "./setup-guide";
import type { SetupProps } from "./shared";
import type { OS } from "@/lib/types";

/** Cadence de défilement automatique des écrans. */
const CYCLE_MS = 2_600;

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

  return (
    <div className="fade">
      <h2 className="font-display" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Connectez votre carte</h2>
      <p className="muted" style={{ marginBottom: 20 }}>On a détecté votre téléphone — vous pouvez aussi choisir manuellement.</p>

      <div className="seg" style={{ marginBottom: 18 }}>
        <button className={os === "android" ? "on" : ""} onClick={() => setOS("android")}><Smartphone size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />Android</button>
        <button className={os === "ios" ? "on" : ""} onClick={() => setOS("ios")}><Smartphone size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />iPhone</button>
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

      <div className="stack-sm" style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 380px", minWidth: 0 }}>
          <div className="chip" style={{ marginBottom: 20 }}>
            {os === "ios" ? "Réseau Localiser (Apple)" : "Réseau Find Hub (Google)"}
          </div>

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
          <div className="card" style={{ marginTop: 22, padding: 0, overflow: "hidden" }}>
            <button
              className="setup-toggle"
              onClick={() => setResetOpen((v) => !v)}
              aria-expanded={resetOpen}
            >
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
        </div>

        <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "center", width: "100%", maxWidth: 260, margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>
            <PhonePreview screen={steps[active].screen} title={steps[active].title} />
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
          </div>
        </div>
      </div>

      <div className="stack-sm" style={{ display: "flex", gap: 12, marginTop: 30 }}>
        <Btn variant="ghost" onClick={back}><ChevronLeft size={16} /> Retour</Btn>
        <Btn variant="primary" onClick={next}>Télécharger l&apos;application <ArrowRight size={16} /></Btn>
      </div>
    </div>
  );
}
