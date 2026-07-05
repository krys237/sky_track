"use client";

import React, { useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Btn, SectionHead } from "@/components/ui";
import { FAQS } from "@/lib/content";
import { useNav } from "@/lib/useNav";

export default function FaqPage() {
  const { order } = useNav();
  const [open, setOpen] = useState(0);

  return (
    <div className="z wrap" style={{ paddingTop: 52, paddingBottom: 60, maxWidth: 800 }}>
      <SectionHead eyebrow="Questions fréquentes" title="Tout ce que vous vous demandez" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {FAQS.map((f, i) => (
          <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
            <button className="reset" onClick={() => setOpen(open === i ? -1 : i)} style={{ width: "100%", cursor: "pointer", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
              <span className="font-display" style={{ fontSize: 16, fontWeight: 600, textAlign: "left" }}>{f.q}</span>
              <ChevronRight size={18} style={{ color: "var(--signal)", flex: "0 0 auto", transform: open === i ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
            </button>
            {open === i && <div className="muted fade" style={{ padding: "0 20px 20px", fontSize: 14.5, lineHeight: 1.65 }}>{f.a}</div>}
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Btn variant="primary" onClick={() => order()}>Commander ma carte <ArrowRight size={18} /></Btn>
      </div>
    </div>
  );
}
