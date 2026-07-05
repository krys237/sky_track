"use client";

import React, { useState } from "react";
import {
  Loader, Smartphone, CreditCard, X, Shield, ChevronLeft, ArrowRight,
} from "lucide-react";
import { Btn } from "@/components/ui";
import { Summary } from "./Summary";
import { PACKS, fcfa } from "@/lib/content";
import {
  createOrder, initiatePayment, confirmMockPayment, getOrderStatus,
} from "@/app/commander/actions";
import type { StepProps } from "./shared";
import type { PayMethod } from "@/lib/types";

type Phase = "form" | "pending" | "error";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function StepPay({ flow, setFlow, next, back }: StepProps) {
  const pack = PACKS.find((p) => p.id === flow.pack)!;
  const [method, setMethod] = useState<PayMethod>(flow.pay || "momo");
  const [phase, setPhase] = useState<Phase>("form");
  const [demoResult, setDemoResult] = useState<"success" | "error">("success");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [momoNum, setMomoNum] = useState("");
  const [card, setCard] = useState({ num: "", exp: "", cvv: "", name: "" });

  const methods: { id: PayMethod; label: string; sub: string; color: string }[] = [
    { id: "momo", label: "MTN MoMo", sub: "Mobile Money", color: "var(--mtn)" },
    { id: "om", label: "Orange Money", sub: "Mobile Money", color: "var(--orange)" },
    { id: "visa", label: "Carte Visa / Mastercard", sub: "Paiement par carte", color: "var(--signal)" },
  ];

  const canPay = () => {
    if (method === "visa") return card.num.replace(/\s/g, "").length >= 15 && card.exp.length >= 4 && card.cvv.length >= 3 && !!card.name.trim();
    return /^\+?[0-9\s]{8,}$/.test(momoNum);
  };

  const fail = (msg: string) => {
    // On repart d'une commande neuve à la prochaine tentative.
    setFlow((f) => ({ ...f, commandeId: null, orderRef: null }));
    setErrMsg(msg);
    setPhase("error");
  };

  // Attend l'état terminal de la commande (webhook réel ou confirmation mock).
  const pollStatus = async (commandeId: string): Promise<string> => {
    for (let i = 0; i < 12; i++) {
      const r = await getOrderStatus(commandeId);
      if (r.ok && r.statut && r.statut !== "initiee") return r.statut;
      await sleep(1000);
    }
    return "initiee"; // délai dépassé → traité comme un échec
  };

  const pay = async () => {
    setErrMsg(null);
    setPhase("pending");

    // 1. Persiste la commande (client + commande, statut « initiee »).
    const order = await createOrder({
      pack: flow.pack, contactType: flow.contactType, contact: flow.contact,
      name: flow.name, city: flow.city, address: flow.address, pay: method,
    });
    if (!order.ok || !order.commandeId || !order.ref) {
      fail(order.error || "Impossible d'enregistrer la commande.");
      return;
    }
    const commandeId = order.commandeId;
    setFlow((f) => ({ ...f, pay: method, orderRef: order.ref!, commandeId }));

    // 2. Initie le paiement auprès de l'agrégateur (→ transaction « pending »).
    const init = await initiatePayment({
      commandeId, method, phone: method === "visa" ? undefined : momoNum,
    });
    if (!init.ok || !init.transactionId) {
      fail(init.error || "L'initiation du paiement a échoué.");
      return;
    }

    // 3. Simule la validation client + le webhook agrégateur (mock uniquement ;
    //    sans effet avec un agrégateur réel, où le webhook arrive tout seul).
    await sleep(1600);
    await confirmMockPayment(init.transactionId, demoResult === "success" ? "success" : "failed");

    // 4. Attend la confirmation (statut terminal de la commande).
    const statut = await pollStatus(commandeId);
    if (statut === "payee") next();
    else fail("La transaction a été annulée ou le solde est insuffisant.");
  };

  const fmtCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const fmtExp = (v: string) => v.replace(/\D/g, "").slice(0, 4).replace(/(.{2})(.+)/, "$1/$2");

  return (
    <div className="fade">
      <div className="stack-sm" style={{ display: "flex", gap: 26 }}>
        <div style={{ flex: "1 1 480px" }}>
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Paiement</h2>
          <p className="muted" style={{ marginBottom: 22 }}>Choisissez votre moyen de paiement préféré.</p>

          {/* demo banner */}
          <div className="card" style={{ padding: "12px 14px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", background: "rgba(255,176,32,.06)", borderColor: "rgba(255,176,32,.25)" }}>
            <span style={{ fontSize: 12.5, color: "var(--amber)" }}><b>Démo</b> — aucun paiement réel. Testez le résultat :</span>
            <div className="seg" style={{ padding: 3 }}>
              <button className={demoResult === "success" ? "on" : ""} style={{ padding: "6px 12px", fontSize: 12.5 }} onClick={() => setDemoResult("success")}>Succès</button>
              <button className={demoResult === "error" ? "on" : ""} style={{ padding: "6px 12px", fontSize: 12.5 }} onClick={() => setDemoResult("error")}>Échec</button>
            </div>
          </div>

          {phase === "pending" ? (
            <div className="card" style={{ padding: 30, textAlign: "center" }}>
              <Loader size={30} className="spin" style={{ color: "var(--signal)", marginBottom: 16 }} />
              {method === "visa" ? (
                <>
                  <h3 className="font-display" style={{ fontSize: 18, margin: "0 0 8px" }}>Vérification 3-D Secure…</h3>
                  <p className="muted" style={{ fontSize: 14, margin: 0 }}>Confirmation de votre carte en cours.</p>
                </>
              ) : (
                <>
                  <h3 className="font-display" style={{ fontSize: 18, margin: "0 0 8px" }}>Confirmez sur votre téléphone</h3>
                  <p className="muted" style={{ fontSize: 14, margin: 0 }}>Une demande de paiement a été envoyée au {momoNum || "numéro indiqué"}. Composez votre code {method === "momo" ? "MoMo" : "Orange Money"} pour valider.</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
                {methods.map((m) => (
                  <div key={m.id} className={`rowsel ${method === m.id ? "sel" : ""}`} onClick={() => { setMethod(m.id); setPhase("form"); }}>
                    <div className={`radio ${method === m.id ? "sel" : ""}`} />
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: m.color, flex: "0 0 auto" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{m.label}</div>
                      <div className="muted" style={{ fontSize: 12.5 }}>{m.sub}</div>
                    </div>
                    {m.id === "visa" ? <CreditCard size={18} className="muted" /> : <Smartphone size={18} className="muted" />}
                  </div>
                ))}
              </div>

              {/* method form */}
              <div className="card" style={{ padding: 20, marginBottom: 8 }}>
                {method === "visa" ? (
                  <div style={{ display: "grid", gap: 14 }}>
                    <div>
                      <label className="fld">Numéro de carte</label>
                      <input value={card.num} onChange={(e) => setCard({ ...card, num: fmtCard(e.target.value) })} placeholder="4242 4242 4242 4242" inputMode="numeric" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div><label className="fld">Expiration</label><input value={card.exp} onChange={(e) => setCard({ ...card, exp: fmtExp(e.target.value) })} placeholder="MM/AA" inputMode="numeric" /></div>
                      <div><label className="fld">CVV</label><input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="123" inputMode="numeric" /></div>
                    </div>
                    <div><label className="fld">Titulaire</label><input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Nom sur la carte" /></div>
                  </div>
                ) : (
                  <div>
                    <label className="fld">Numéro {method === "momo" ? "MTN MoMo" : "Orange Money"}</label>
                    <input value={momoNum} onChange={(e) => setMomoNum(e.target.value)} placeholder={method === "momo" ? "+237 6 7X XX XX XX" : "+237 6 9X XX XX XX"} inputMode="tel" />
                    <p className="muted2" style={{ fontSize: 12.5, marginTop: 10 }}>Vous recevrez une demande de paiement à valider sur votre téléphone.</p>
                  </div>
                )}
              </div>

              {phase === "error" && (
                <div className="card fade" style={{ padding: "14px 16px", marginBottom: 8, background: "rgba(255,90,90,.08)", borderColor: "rgba(255,90,90,.35)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <X size={18} style={{ color: "#ff8a8a", flex: "0 0 auto", marginTop: 1 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14.5, color: "#ffb3b3" }}>Paiement non abouti</div>
                      <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>{errMsg || "La transaction a été annulée ou le solde est insuffisant."} Réessayez, ou changez de moyen de paiement.</div>
                    </div>
                  </div>
                </div>
              )}

              <p className="muted2" style={{ fontSize: 12, marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                <Shield size={13} /> Vos informations de paiement ne transitent pas par nos serveurs.
              </p>

              <div className="stack-sm" style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <Btn variant="ghost" onClick={back}><ChevronLeft size={16} /> Retour</Btn>
                <Btn variant="primary" onClick={pay} disabled={!canPay()}>
                  {phase === "error" ? "Réessayer" : `Payer ${fcfa(pack.price)}`} <ArrowRight size={16} />
                </Btn>
              </div>
            </>
          )}
        </div>
        <div style={{ flex: "0 0 280px" }}><Summary flow={flow} /></div>
      </div>
    </div>
  );
}
