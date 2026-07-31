"use client";

import React from "react";
import { PackageCheck, Truck, Store, ArrowRight } from "lucide-react";
import { Btn } from "@/components/ui";
import { PACKS, fcfa, deliveryFeeFor, orderTotal } from "@/lib/content";
import type { Flow } from "@/lib/types";

export function StepConfirm({ flow, next }: { flow: Flow; next: () => void }) {
  const pack = PACKS.find((p) => p.id === flow.pack)!;
  const isDelivery = flow.mode === "livraison";
  const frais = deliveryFeeFor(flow.mode);
  const total = orderTotal(pack.price, flow.mode);
  return (
    <div className="fade" style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
      <div style={{ width: 76, height: 76, borderRadius: "50%", margin: "0 auto 22px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(47,230,196,.12)", border: "1px solid rgba(47,230,196,.4)" }}>
        <PackageCheck size={36} style={{ color: "var(--signal)" }} />
      </div>
      <h2 className="font-display" style={{ fontSize: 28, fontWeight: 700, margin: "0 0 10px" }}>Paiement effectué</h2>
      <p className="muted" style={{ fontSize: 16, margin: "0 0 24px" }}>
        {isDelivery ? "Merci ! Votre produit est en préparation." : "Merci ! Votre produit vous est remis sur place."}
      </p>

      <div className="card" style={{ padding: 22, textAlign: "left", marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
          <span className="muted">N° de paiement</span><span className="font-mono sig">{flow.orderRef}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
          <span className="muted">Produit</span><span>SkyTrack {pack.name} · {pack.cards} unité{pack.cards > 1 ? "s" : ""}</span>
        </div>
        {isDelivery && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
            <span className="muted">Frais de livraison</span><span>{fcfa(frais)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
          <span className="muted">Montant payé</span><span style={{ fontWeight: 600 }}>{fcfa(total)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
          <span className="muted">Contact</span><span>{flow.contact}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
          <span className="muted">{isDelivery ? "Livraison" : "Remise"}</span>
          <span>{isDelivery ? `${flow.address}, ${flow.city}` : "Sur place"}</span>
        </div>
      </div>

      <div className="chip" style={{ marginBottom: 26 }}>
        {isDelivery
          ? <><Truck size={14} /> Livraison estimée : 2 à 4 jours ouvrés</>
          : <><Store size={14} /> Produit remis sur place</>}
      </div>
      <div><Btn variant="primary" onClick={next}>Configurer ma carte <ArrowRight size={18} /></Btn></div>
    </div>
  );
}
