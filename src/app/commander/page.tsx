"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stepper } from "@/components/tunnel/Stepper";
import { StepPack } from "@/components/tunnel/StepPack";
import { StepAccount } from "@/components/tunnel/StepAccount";
import { StepPay } from "@/components/tunnel/StepPay";
import { StepConfirm } from "@/components/tunnel/StepConfirm";
import { StepSetup } from "@/components/tunnel/StepSetup";
import { StepDownload } from "@/components/tunnel/StepDownload";
import { PACKS, normalizeRefCode } from "@/lib/content";
import { getOrderStatus } from "@/app/commander/actions";
import { clearPendingOrder, loadPendingOrder } from "@/lib/orderResume";
import { markPaidOnDevice } from "@/lib/findapp";
import type { ResumeStatus } from "@/components/tunnel/shared";
import type { Flow, OS, PackId, SaleMode } from "@/lib/types";

function isPackId(v: string | null): v is PackId {
  return !!v && PACKS.some((p) => p.id === v);
}

// Le lien qu'un agent ouvre sur le téléphone du client peut pré-remplir le mode
// (« sur-place ») et son code (« ?ref=AG-1234 ») : /commander?mode=sur-place&ref=AG-1234&pack=carte
function parseMode(v: string | null): SaleMode {
  return v === "sur-place" || v === "sur_place" ? "sur_place" : "livraison";
}

function Onboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Produit pré-sélectionné via l'URL (?pack=carte) → on démarre à l'étape « Compte ».
  const presetPack = searchParams.get("pack");
  const initialPack: PackId = isPackId(presetPack) ? presetPack : "carte";
  const initialMode = parseMode(searchParams.get("mode"));
  const presetRef = searchParams.get("ref");
  const initialStep = useMemo(() => (isPackId(presetPack) ? 1 : 0), [presetPack]);

  const [step, setStep] = useState(initialStep);
  const [detectedOS, setDetectedOS] = useState<OS | null>(null);
  const [resumeStatus, setResumeStatus] = useState<ResumeStatus | null>(null);
  const [flow, setFlow] = useState<Flow>({
    pack: initialPack, mode: initialMode, contactType: "email", contact: "", name: "", city: "", address: "",
    pay: null, refCode: presetRef ? normalizeRefCode(presetRef) : null,
    os: null, orderRef: null, commandeId: null,
  });

  useEffect(() => {
    const ua = (navigator.userAgent || "").toLowerCase();
    if (/android/.test(ua)) setDetectedOS("android");
    else if (/iphone|ipad|ipod/.test(ua)) setDetectedOS("ios");
  }, []);

  // Reprise de commande : un paiement était en cours quand la page a été
  // rechargée (ou l'onglet fermé). Le pointeur local ne fait que retrouver la
  // commande — l'état qui décide de la suite vient du serveur, qui relance au
  // passage la réconciliation auprès de l'agrégateur.
  useEffect(() => {
    const saved = loadPendingOrder();
    if (!saved?.flow.commandeId) return;
    let cancelled = false;
    (async () => {
      const r = await getOrderStatus(saved.flow.commandeId!);
      if (cancelled) return;
      if (!r.ok || !r.statut) {
        clearPendingOrder(); // commande introuvable : pointeur orphelin
        return;
      }
      if (r.statut === "initiee") {
        // Issue toujours indécise : on ré-atterrit sur l'écran d'attente, qui
        // re-sonde (surtout ne pas proposer de repayer).
        setFlow(saved.flow);
        setResumeStatus("initiee");
        setStep(2);
      } else if (r.statut === "echouee") {
        clearPendingOrder();
        setFlow({ ...saved.flow, commandeId: null, orderRef: null });
        setResumeStatus("echouee");
        setStep(2);
      } else {
        // payee / expediee / livree : le paiement a abouti pendant l'absence.
        clearPendingOrder();
        markPaidOnDevice();
        setFlow(saved.flow);
        setStep(3);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const next = () => {
    // La référence de commande est désormais générée côté serveur lors de la
    // persistance (StepPay → createOrder), plus de numéro factice ici.
    setStep((s) => Math.min(s + 1, 5));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goHome = () => router.push("/");

  return (
    <div className="z wrap" style={{ paddingTop: 40, paddingBottom: 70, maxWidth: 960 }}>
      <Stepper step={step} />
      {step === 0 && <StepPack flow={flow} setFlow={setFlow} next={next} back={back} />}
      {step === 1 && <StepAccount flow={flow} setFlow={setFlow} next={next} back={back} />}
      {step === 2 && <StepPay flow={flow} setFlow={setFlow} next={next} back={back} resumeStatus={resumeStatus} />}
      {step === 3 && <StepConfirm flow={flow} next={next} />}
      {step === 4 && <StepSetup flow={flow} setFlow={setFlow} next={next} back={back} detectedOS={detectedOS} />}
      {step === 5 && <StepDownload flow={flow} onHome={goHome} />}
    </div>
  );
}

export default function CommanderPage() {
  return (
    <Suspense fallback={<div className="z wrap" style={{ paddingTop: 40, paddingBottom: 70, minHeight: "50vh" }} />}>
      <Onboarding />
    </Suspense>
  );
}
