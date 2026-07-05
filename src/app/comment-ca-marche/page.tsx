"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { Btn, SectionHead } from "@/components/ui";
import { STEPS_FUNC, TRUTHS } from "@/lib/content";
import { useNav } from "@/lib/useNav";

export default function HowPage() {
  const { order } = useNav();

  return (
    <div className="z wrap" style={{ paddingTop: 52, paddingBottom: 60 }}>
      <SectionHead eyebrow="Fonctionnement" title="Comment fonctionne la carte SkyTrack" sub="De l'émission du signal jusqu'à ce que vous mettiez la main sur votre objet — voici chaque étape." />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {STEPS_FUNC.map((s, i) => (
          <div key={i} className="card" style={{ padding: 22, display: "flex", gap: 18, alignItems: "flex-start" }}>
            <div style={{ flex: "0 0 auto", width: 52, height: 52, borderRadius: 14, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.25)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <s.icon size={24} style={{ color: "var(--signal)" }} />
              <span className="font-mono" style={{ position: "absolute", top: -9, left: -9, fontSize: 11, color: "var(--amber-ink)", background: "var(--card)", padding: "2px 5px", borderRadius: 6, border: "1px solid var(--line)" }}>{s.n}</span>
            </div>
            <div>
              <h3 className="font-display" style={{ fontSize: 19, fontWeight: 600, margin: "2px 0 6px" }}>{s.t}</h3>
              <p className="muted" style={{ fontSize: 15, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 50 }}>
        <SectionHead eyebrow="Bon à savoir" title="Ce qu'il faut retenir" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {TRUTHS.map((t, i) => (
            <div key={i} className="card" style={{ padding: 22 }}>
              <t.icon size={22} style={{ color: "var(--signal)", marginBottom: 14 }} />
              <h3 className="font-display" style={{ fontSize: 16.5, fontWeight: 600, margin: "0 0 8px" }}>{t.t}</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>{t.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 46 }}>
        <Btn variant="primary" onClick={() => order()}>Commander ma carte <ArrowRight size={18} /></Btn>
      </div>
    </div>
  );
}
