"use client";

import React from "react";
import { Signal, ScanLine } from "lucide-react";
import { Btn } from "@/components/ui";
import type { Flow, OS } from "@/lib/types";

/* Logo Google Play (marque officielle, 4 couleurs) — reproduction vectorielle. */
function GooglePlayGlyph({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: "0 0 auto" }}>
      <path fill="#00A0FF" d="M1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924z" />
      <path fill="#FFC900" d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594z" />
      <path fill="#00E676" d="M13.544 10.989l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.117l11.04 10.911z" />
      <path fill="#FF3D47" d="M13.544 13.011l-11 10.923c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.2z" />
    </svg>
  );
}

/* Logo Apple (marque officielle, monochrome) — reproduction vectorielle. */
function AppleGlyph({ size = 24, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill={color} style={{ flex: "0 0 auto" }}>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

/**
 * Liens directs vers les vraies apps de suivi (pas l'accueil des stores) :
 * — Android : « Localiser de Google » / Find Hub (package com.google.android.apps.adm)
 * — iPhone  : « Localiser » d'Apple / Find My (id1514844621)
 */
const STORE_URLS = {
  play: "https://play.google.com/store/apps/details?id=com.google.android.apps.adm",
  apple: "https://apps.apple.com/fr/app/localiser/id1514844621",
} as const;

function StoreBadge({ store, primary }: { store: "play" | "apple"; primary?: boolean }) {
  const isPlay = store === "play";
  const ink = primary ? "#231404" : "var(--text)";
  return (
    <a className="reset" href={STORE_URLS[store]} target="_blank" rel="noreferrer"
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderRadius: 13, cursor: "pointer",
        border: primary ? "0" : "1px solid var(--line)",
        background: primary ? "linear-gradient(96deg,var(--amber),var(--amber-2))" : "var(--surface-2)",
        color: ink, minWidth: 200,
      }}>
      {isPlay ? <GooglePlayGlyph size={24} /> : <AppleGlyph size={26} color={ink} />}
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: 10.5, opacity: .8 }}>{isPlay ? "SUR GOOGLE PLAY" : "SUR L'APP STORE"}</div>
        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.1 }}>{isPlay ? "Find Hub" : "Localiser"}</div>
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
      <h2 className="font-display" style={{ fontSize: 28, fontWeight: 700, margin: "0 0 10px" }}>Installez l&apos;app de suivi</h2>
      <p className="muted" style={{ fontSize: 16, margin: "0 auto 30px", maxWidth: 480 }}>
        {os === "ios"
          ? "Sur iPhone, le suivi se fait dans l'app Localiser d'Apple, déjà installée. Ouvrez-la pour retrouver votre carte SkyTrack."
          : "Sur Android, installez Find Hub de Google : c'est là que vous activez et suivez votre carte SkyTrack."}
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
            <b style={{ color: "var(--text)" }}>Rappel :</b> tout le suivi se fait dans {os === "ios" ? "Localiser" : "Find Hub"} — dernière position de votre carte, sonnerie à distance et mode « objet perdu ». Aucune autre application n&apos;est nécessaire.
          </span>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <Btn variant="ghost" onClick={onHome}>Retour à l&apos;accueil</Btn>
      </div>
    </div>
  );
}
