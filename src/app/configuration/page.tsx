"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StepSetup } from "@/components/tunnel/StepSetup";
import { StepDownload } from "@/components/tunnel/StepDownload";
import type { Flow, OS } from "@/lib/types";

/**
 * Guide de configuration en accès direct — hors du tunnel d'achat.
 * Réutilise `StepSetup` (le parcours à écrans réels) puis `StepDownload`, avec
 * un `flow` local minimal : seul `os` est réellement lu par ces deux étapes.
 * Accessible depuis le menu « Aide » et sous la section « Comment ça marche ».
 */
export default function ConfigurationPage() {
  const router = useRouter();
  const [detectedOS, setDetectedOS] = useState<OS | null>(null);
  const [showDownload, setShowDownload] = useState(false);
  const [flow, setFlow] = useState<Flow>({
    pack: "carte", mode: "livraison", contactType: "email", contact: "", name: "", city: "", address: "",
    pay: null, refCode: null, os: null, orderRef: null, commandeId: null,
  });

  useEffect(() => {
    const ua = (navigator.userAgent || "").toLowerCase();
    if (/android/.test(ua)) setDetectedOS("android");
    else if (/iphone|ipad|ipod/.test(ua)) setDetectedOS("ios");
  }, []);

  const home = () => router.push("/");

  return (
    <div className="z wrap" style={{ paddingTop: 40, paddingBottom: 70, maxWidth: 960 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>Guide de configuration</div>
      {showDownload ? (
        <StepDownload flow={flow} onHome={home} />
      ) : (
        <StepSetup
          flow={flow}
          setFlow={setFlow}
          next={() => setShowDownload(true)}
          back={home}
          detectedOS={detectedOS}
        />
      )}
    </div>
  );
}
