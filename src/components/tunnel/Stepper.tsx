"use client";

import React from "react";
import { Check } from "lucide-react";

export const OB_STEPS = ["Pack", "Compte", "Paiement", "Confirmation", "Configuration", "Application"];

export function Stepper({ step }: { step: number }) {
  return (
    <div className="stepline" style={{ marginBottom: 34 }}>
      {OB_STEPS.map((label, i) => (
        <React.Fragment key={i}>
          <div className="stepnode">
            <div className={`stepbadge ${i === step ? "on" : i < step ? "done" : ""}`}>
              {i < step ? <Check size={15} /> : i + 1}
            </div>
            <div className={`steptxt ${i === step ? "on" : ""}`}>{label}</div>
          </div>
          {i < OB_STEPS.length - 1 && <div className={`stepbar ${i < step ? "done" : ""}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}
