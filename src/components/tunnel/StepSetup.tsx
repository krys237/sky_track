"use client";

import React, { useEffect } from "react";
import { Smartphone, Nfc, ChevronLeft, ArrowRight } from "lucide-react";
import { Btn } from "@/components/ui";
import { SetupPhonePreview } from "./phones";
import type { SetupProps } from "./shared";
import type { OS } from "@/lib/types";

export function StepSetup({ flow, setFlow, next, back, detectedOS }: SetupProps) {
  const os: OS = flow.os || detectedOS || "android";
  const setOS = (v: OS) => setFlow((f) => ({ ...f, os: v }));

  useEffect(() => {
    if (!flow.os) setFlow((f) => ({ ...f, os: detectedOS || "android" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stepsA = [
    "Chargez puis appuyez sur le bouton de la carte pour l'activer.",
    "Le pop-up Fast Pair apparaît sur votre téléphone : touchez « Connecter ».",
    "Liez la carte à votre compte Google et acceptez l'usage responsable.",
    "La carte apparaît dans Find Hub. Installez l'app SkyTrack pour les fonctions bonus.",
  ];
  const stepsI = [
    "Ouvrez l'app Localiser, puis l'onglet « Objets ».",
    "Touchez « + » → « Ajouter un autre objet », appuyez sur le bouton de la carte.",
    "La carte est détectée : touchez « Connecter », nommez-la et choisissez un emoji.",
    "Confirmez avec votre identifiant Apple, puis « Terminer ». C'est prêt.",
  ];
  const steps = os === "ios" ? stepsI : stepsA;

  return (
    <div className="fade">
      <h2 className="font-display" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Connectez votre carte</h2>
      <p className="muted" style={{ marginBottom: 20 }}>On a détecté votre téléphone — vous pouvez aussi choisir manuellement.</p>

      <div className="seg" style={{ marginBottom: 26 }}>
        <button className={os === "android" ? "on" : ""} onClick={() => setOS("android")}><Smartphone size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />Android</button>
        <button className={os === "ios" ? "on" : ""} onClick={() => setOS("ios")}><Smartphone size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />iPhone</button>
      </div>

      <div className="stack-sm" style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 380px" }}>
          <div className="chip" style={{ marginBottom: 20 }}>
            {os === "ios" ? "Réseau Localiser (Apple)" : "Réseau Find Hub (Google)"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div className="font-mono" style={{ flex: "0 0 auto", width: 28, height: 28, borderRadius: 8, background: "rgba(47,230,196,.12)", border: "1px solid rgba(47,230,196,.3)", color: "var(--signal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{i + 1}</div>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, margin: "3px 0 0" }}>{s}</p>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: "12px 14px", marginTop: 20, display: "flex", gap: 10, alignItems: "flex-start", background: "rgba(255,176,32,.06)", borderColor: "rgba(255,176,32,.22)" }}>
            <Nfc size={16} style={{ color: "var(--amber)", flex: "0 0 auto", marginTop: 2 }} />
            <span className="muted" style={{ fontSize: 12.5 }}>Une carte se connecte à <b style={{ color: "var(--text)" }}>un seul réseau à la fois</b>. Pour changer, réinitialisez la carte puis reconnectez-la sur l&apos;autre téléphone.</span>
          </div>
        </div>

        <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "center", width: "100%", maxWidth: 260, margin: "0 auto" }}>
          <SetupPhonePreview os={os} />
        </div>
      </div>

      <div className="stack-sm" style={{ display: "flex", gap: 12, marginTop: 30 }}>
        <Btn variant="ghost" onClick={back}><ChevronLeft size={16} /> Retour</Btn>
        <Btn variant="primary" onClick={next}>Télécharger l&apos;application <ArrowRight size={16} /></Btn>
      </div>
    </div>
  );
}
