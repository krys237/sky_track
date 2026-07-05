"use client";

import React from "react";
import { Signal, Smartphone, PlayCircle, ScanLine } from "lucide-react";
import { Btn } from "@/components/ui";
import type { Flow, OS } from "@/lib/types";

function StoreBadge({ store, primary }: { store: "play" | "apple"; primary?: boolean }) {
  const isPlay = store === "play";
  return (
    <a className="reset" href={isPlay ? "https://play.google.com/store" : "https://apps.apple.com/"} target="_blank" rel="noreferrer"
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderRadius: 13, cursor: "pointer",
        border: primary ? "0" : "1px solid var(--line)",
        background: primary ? "linear-gradient(96deg,var(--amber),var(--amber-2))" : "var(--surface-2)",
        color: primary ? "#231404" : "var(--text)", minWidth: 200,
      }}>
      {isPlay ? <PlayCircle size={26} /> : <Smartphone size={26} />}
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: 10.5, opacity: .8 }}>{isPlay ? "DISPONIBLE SUR" : "TÉLÉCHARGER DANS"}</div>
        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.1 }}>{isPlay ? "Google Play" : "l'App Store"}</div>
      </div>
    </a>
  );
}

export function StepDownload({ flow, onHome }: { flow: Flow; onHome: () => void }) {
  const os: OS = flow.os || "android";
  return (
    <div className="fade" style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
      <div style={{ width: 76, height: 76, borderRadius: 20, margin: "0 auto 22px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,rgba(16,185,129,.16),rgba(245,158,11,.14))", border: "1px solid var(--line)" }}>
        <Signal size={34} style={{ color: "var(--signal)" }} />
      </div>
      <h2 className="font-display" style={{ fontSize: 28, fontWeight: 700, margin: "0 0 10px" }}>Téléchargez SkyTrack</h2>
      <p className="muted" style={{ fontSize: 16, margin: "0 auto 30px", maxWidth: 480 }}>
        {os === "ios"
          ? "Sur iPhone, le suivi se fait dans l'app Localiser (déjà installée). Ajoutez l'app compagnon SkyTrack pour les fonctions bonus."
          : "Sur Android, installez SkyTrack pour l'activation et les fonctions bonus. Le suivi se fait dans l'app Find Hub de Google."}
      </p>

      <div className="stack-sm" style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 18 }}>
        {os === "ios" ? (
          <>
            <StoreBadge store="apple" primary />
            <StoreBadge store="play" />
          </>
        ) : (
          <>
            <StoreBadge store="play" primary />
            <StoreBadge store="apple" />
          </>
        )}
      </div>

      <div className="card" style={{ padding: 18, textAlign: "left", margin: "26px auto 0", maxWidth: 520 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <ScanLine size={18} style={{ color: "var(--signal)", flex: "0 0 auto", marginTop: 2 }} />
          <span className="muted" style={{ fontSize: 13.5, lineHeight: 1.55 }}>
            <b style={{ color: "var(--text)" }}>Rappel :</b> le suivi de vos objets se fait dans {os === "ios" ? "Localiser" : "Find Hub"}. L&apos;app SkyTrack ajoute les réglages et fonctions bonus (faire sonner votre téléphone, changer la sonnerie de la carte…).
          </span>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <Btn variant="ghost" onClick={onHome}>Retour à l&apos;accueil</Btn>
      </div>
    </div>
  );
}
