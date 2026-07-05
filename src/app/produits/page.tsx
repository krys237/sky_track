"use client";

import React from "react";
import { SectionHead } from "@/components/ui";
import { PackGrid } from "@/components/PackGrid";
import { useNav } from "@/lib/useNav";

export default function ProductsPage() {
  const { order } = useNav();

  return (
    <div className="z wrap" style={{ paddingTop: 52, paddingBottom: 60 }}>
      <SectionHead center eyebrow="Produits & tarifs" title="Choisissez votre pack SkyTrack" sub="Toutes les cartes fonctionnent avec le réseau Google Find Hub, sur Android." />
      <PackGrid onChoose={(p) => order(p)} />
      <p className="muted2" style={{ textAlign: "center", fontSize: 12.5, marginTop: 26 }}>Prix indicatifs · livraison au Cameroun · paiement MoMo, Orange Money ou carte Visa/Mastercard.</p>
    </div>
  );
}
