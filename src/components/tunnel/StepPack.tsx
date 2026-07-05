"use client";

import React from "react";
import { PackGrid } from "@/components/PackGrid";
import type { StepProps } from "./shared";

export function StepPack({ flow, setFlow, next }: StepProps) {
  return (
    <div className="fade">
      <h2 className="font-display" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Choisissez votre pack</h2>
      <p className="muted" style={{ marginBottom: 26 }}>Vous pourrez ajuster à l&apos;étape suivante.</p>
      <PackGrid selected={flow.pack} onChoose={(p) => { setFlow((f) => ({ ...f, pack: p.id })); next(); }} />
    </div>
  );
}
