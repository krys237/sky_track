"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Loader, X, Shield, ChevronLeft, ArrowRight, Clock, RefreshCw, UserCheck,
} from "lucide-react";
import { Btn } from "@/components/ui";
import { PhoneField } from "@/components/PhoneField";
import { Summary } from "./Summary";
import { PACKS, fcfa, orderTotal, normalizeRefCode, isValidRefCode } from "@/lib/content";
import {
  createOrder, initiatePayment, confirmMockPayment, getOrderStatus, isDemoPayment,
} from "@/app/commander/actions";
import type { StepProps } from "./shared";
import type { PayMethod } from "@/lib/types";
import { markPaidOnDevice } from "@/lib/findapp";

/** `unknown` : issue non tranchée — surtout pas présentée comme un échec. */
type Phase = "form" | "pending" | "error" | "unknown";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fenêtre de sondage. L'ancienne valeur (12 × 1 s) était calée sur le mock, qui
 * répond en ~1,6 s. Un vrai webhook d'agrégateur mobile money met couramment
 * plus longtemps : au-delà des 12 s, le tunnel annonçait « paiement non abouti »
 * alors que la commande basculait `payee` juste après — et le client repayait.
 */
const POLL_INTERVAL_MS = 2_000;
const POLL_ATTEMPTS = 45; // ≈ 90 s

/**
 * Marge haute du titre de colonne. Le `h2` n'annulait pas le `margin-top` par
 * défaut du navigateur (0.83em ≈ 20px à 24px) : « Paiement » descendait
 * d'autant, tandis que le récapitulatif restait collé en haut de la ligne flex
 * — d'où la carte qui flottait ~20px trop haut. On rend le décalage explicite
 * ici, et `.tunnel-aside` (globals.css) applique la même valeur à droite.
 */
const HEAD_OFFSET = 20;

export function StepPay({ flow, setFlow, next, back }: StepProps) {
  const pack = PACKS.find((p) => p.id === flow.pack)!;
  const [method, setMethod] = useState<PayMethod>(flow.pay || "momo");
  const [phase, setPhase] = useState<Phase>("form");
  const [demoResult, setDemoResult] = useState<"success" | "error">("success");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [momoNum, setMomoNum] = useState("");
  const [card, setCard] = useState({ num: "", exp: "", cvv: "", name: "" });
  // Code de l'agent de terrain. Pré-rempli si le client est arrivé via un lien
  // agent (?ref=…). Obligatoire en sur-place (c'est la vente de l'agent),
  // facultatif en livraison.
  const [refCode, setRefCode] = useState(flow.refCode ?? "");
  // `null` tant que le serveur n'a pas répondu : la bannière Démo et le
  // sélecteur Succès/Échec n'apparaissent qu'une fois le mode mock confirmé.
  const [demo, setDemo] = useState<boolean | null>(null);

  useEffect(() => {
    isDemoPayment().then(setDemo).catch(() => setDemo(false));
  }, []);

  const total = orderTotal(pack.price, flow.mode);
  const refRequired = flow.mode === "sur_place";
  const refFilled = refCode.trim() !== "";
  const refOk = refRequired ? isValidRefCode(refCode) : (!refFilled || isValidRefCode(refCode));

  const methods: { id: PayMethod; label: string; sub: string; img: string }[] = [
    { id: "momo", label: "MTN MoMo", sub: "Mobile Money", img: "/payments/mtn-mobile-money.jpg" },
    { id: "om", label: "Orange Money", sub: "Mobile Money", img: "/payments/orange-money.png" },
    { id: "visa", label: "Carte Visa / Mastercard", sub: "Paiement par carte", img: "/payments/visa-mastercard.webp" },
  ];

  const canPay = () => {
    if (method === "visa") return card.num.replace(/\s/g, "").length >= 15 && card.exp.length >= 4 && card.cvv.length >= 3 && !!card.name.trim();
    return /^\+?[0-9\s]{8,}$/.test(momoNum);
  };

  /**
   * Clé d'idempotence : identifie **une tentative de paiement**, pas un clic.
   * Elle survit aux réessais tant que l'issue reste inconnue — c'est ce qui
   * permet au serveur de retrouver la commande déjà créée au lieu d'en
   * fabriquer une seconde. Générée à la demande (jamais pendant le rendu SSR).
   */
  const idemKeyRef = useRef<string | null>(null);
  const attemptKey = () => (idemKeyRef.current ??= crypto.randomUUID());
  const newAttempt = () => { idemKeyRef.current = null; };

  /**
   * Échec non tranché (réseau, agrégateur injoignable) : la commande est
   * peut-être déjà en base. On conserve la clé et l'identifiant pour que le
   * prochain essai retombe sur la même commande.
   */
  const failRetryable = (msg: string) => {
    setErrMsg(msg);
    setPhase("error");
  };

  /** Échec avéré (transaction refusée) : la prochaine tentative repart à neuf. */
  const failDefinitive = (msg: string) => {
    newAttempt();
    setFlow((f) => ({ ...f, commandeId: null, orderRef: null }));
    setErrMsg(msg);
    setPhase("error");
  };

  // Attend l'état terminal de la commande (webhook réel ou confirmation mock).
  // `null` = toujours `initiee` au bout de la fenêtre : indécis, pas échoué.
  const pollStatus = async (commandeId: string): Promise<string | null> => {
    for (let i = 0; i < POLL_ATTEMPTS; i++) {
      const r = await getOrderStatus(commandeId);
      if (r.ok && r.statut && r.statut !== "initiee") return r.statut;
      await sleep(POLL_INTERVAL_MS);
    }
    return null;
  };

  /** Suite du parcours selon l'état terminal observé. */
  const settle = (statut: string | null) => {
    if (statut === null) { setPhase("unknown"); return; }
    if (statut === "echouee") {
      failDefinitive("La transaction a été annulée ou le solde est insuffisant.");
      return;
    }
    markPaidOnDevice(); // cet appareil a payé → alimente le rappel « app de suivi »
    next(); // payee (ou déjà expediee/livree)
  };

  const pay = async () => {
    setErrMsg(null);
    setPhase("pending");

    // 1. Persiste la commande (client + commande, statut « initiee »).
    //    Idempotent : un réessai après timeout retombe sur la même commande.
    const normalizedRef = refFilled ? normalizeRefCode(refCode) : null;
    const order = await createOrder({
      pack: flow.pack, mode: flow.mode, contactType: flow.contactType, contact: flow.contact,
      name: flow.name, city: flow.city, address: flow.address, pay: method,
      refCode: normalizedRef, idempotencyKey: attemptKey(),
    });
    if (!order.ok || !order.commandeId || !order.ref) {
      failRetryable(order.error || "Impossible d'enregistrer la commande.");
      return;
    }
    const commandeId = order.commandeId;
    setFlow((f) => ({ ...f, pay: method, refCode: normalizedRef, orderRef: order.ref!, commandeId }));

    // La tentative précédente avait en fait abouti (réponse perdue en route) :
    // on reprend le parcours à son état réel plutôt que d'encaisser deux fois.
    if (order.statut && order.statut !== "initiee") {
      settle(order.statut);
      return;
    }

    // 2. Initie le paiement auprès de l'agrégateur (→ transaction « pending »).
    const init = await initiatePayment({
      commandeId, method, phone: method === "visa" ? undefined : momoNum,
    });
    if (!init.ok || !init.transactionId) {
      // Refus parce que la commande a changé d'état entre-temps → même logique.
      if (init.statut && init.statut !== "initiee") {
        settle(init.statut);
        return;
      }
      failRetryable(init.error || "L'initiation du paiement a échoué.");
      return;
    }

    // 3. Simule la validation client + le webhook agrégateur (mock uniquement ;
    //    avec le hub réel, la confirmation arrive par webhook ou réconciliation).
    const isDemo = demo ?? (await isDemoPayment().catch(() => false));
    if (isDemo) {
      await sleep(1600);
      await confirmMockPayment(init.transactionId, demoResult === "success" ? "success" : "failed");
    }

    // 4. Attend la confirmation (statut terminal de la commande).
    settle(await pollStatus(commandeId));
  };

  /** Depuis l'écran « issue inconnue » : on resonde, sans jamais repayer. */
  const recheck = async () => {
    if (!flow.commandeId) return;
    setPhase("pending");
    settle(await pollStatus(flow.commandeId));
  };

  const fmtCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const fmtExp = (v: string) => v.replace(/\D/g, "").slice(0, 4).replace(/(.{2})(.+)/, "$1/$2");

  return (
    <div className="fade">
      <div className="stack-sm" style={{ display: "flex", gap: 26, alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 480px", minWidth: 0 }}>
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 700, margin: `${HEAD_OFFSET}px 0 8px` }}>Paiement</h2>
          <p className="muted" style={{ marginBottom: 22 }}>Choisissez votre moyen de paiement préféré.</p>

          {/* Bannière démo — uniquement quand l'agrégateur mock est actif. */}
          {demo === true && (
            <div className="card" style={{ padding: "12px 14px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", background: "rgba(255,176,32,.06)", borderColor: "rgba(255,176,32,.25)" }}>
              <span style={{ fontSize: 12.5, color: "var(--amber)" }}><b>Démo</b> — aucun paiement réel. Testez le résultat :</span>
              <div className="seg" style={{ padding: 3 }}>
                <button className={demoResult === "success" ? "on" : ""} style={{ padding: "6px 12px", fontSize: 12.5 }} onClick={() => setDemoResult("success")}>Succès</button>
                <button className={demoResult === "error" ? "on" : ""} style={{ padding: "6px 12px", fontSize: 12.5 }} onClick={() => setDemoResult("error")}>Échec</button>
              </div>
            </div>
          )}

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
          ) : phase === "unknown" ? (
            /* Issue non tranchée : le paiement a pu aboutir côté agrégateur.
               Surtout ne pas proposer « Réessayer » — ce serait la porte
               ouverte au double débit. On resonde, et on garde la référence
               affichée pour que le client puisse nous la citer. */
            <div className="card" style={{ padding: 26, background: "rgba(255,176,32,.06)", borderColor: "rgba(255,176,32,.25)" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                <Clock size={20} style={{ color: "var(--amber)", flex: "0 0 auto", marginTop: 2 }} />
                <div>
                  <h3 className="font-display" style={{ fontSize: 18, margin: "0 0 8px" }}>Confirmation en attente</h3>
                  <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                    Nous n&apos;avons pas encore reçu la confirmation de votre paiement. Il peut
                    s&apos;agir d&apos;un simple délai du réseau — <b>ne relancez pas le paiement</b>,
                    vous risqueriez d&apos;être débité deux fois.
                  </p>
                  {flow.orderRef && (
                    <p className="muted2" style={{ fontSize: 13, marginTop: 10 }}>
                      Votre référence de commande : <b className="font-mono">{flow.orderRef}</b>
                    </p>
                  )}
                </div>
              </div>
              <Btn variant="primary" onClick={recheck}><RefreshCw size={16} /> Vérifier à nouveau</Btn>
              <p className="muted2" style={{ fontSize: 12, marginTop: 14, marginBottom: 0 }}>
                Si le statut ne change pas, contactez-nous avec cette référence : nous
                retrouverons votre commande.
              </p>
            </div>
          ) : (
            <>
              {/* Code agent — attribution de la vente à un vendeur de terrain. */}
              <div style={{ marginBottom: 20 }}>
                <label className="fld" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <UserCheck size={14} /> Code agent {refRequired ? "(obligatoire)" : "(optionnel)"}
                </label>
                <input
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                  placeholder="AG-1234"
                  autoCapitalize="characters"
                  spellCheck={false}
                />
                {refFilled && !isValidRefCode(refCode) ? (
                  <p style={{ color: "var(--amber)", fontSize: 12.5, marginTop: 6 }}>Format attendu : AG- suivi de chiffres ou lettres (ex. AG-1234).</p>
                ) : (
                  <p className="muted2" style={{ fontSize: 12, marginTop: 6 }}>
                    {refRequired ? "Renseigné par l'agent qui réalise la vente." : "Si un agent vous a orienté, indiquez son code."}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
                {methods.map((m) => (
                  <div key={m.id} className={`rowsel ${method === m.id ? "sel" : ""}`} onClick={() => { setMethod(m.id); setPhase("form"); }}>
                    <div className={`radio ${method === m.id ? "sel" : ""}`} />
                    <span style={{ width: 48, height: 32, borderRadius: 8, background: "#fff", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", padding: 4, flex: "0 0 auto", overflow: "hidden" }}>
                      <img src={m.img} alt={m.label} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} />
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{m.label}</div>
                      <div className="muted" style={{ fontSize: 12.5 }}>{m.sub}</div>
                    </div>
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
                    <PhoneField value={momoNum} onChange={setMomoNum} placeholder={method === "momo" ? "6 7X XX XX XX" : "6 9X XX XX XX"} />
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
                <Btn variant="primary" onClick={pay} disabled={!canPay() || !refOk}>
                  {phase === "error" ? "Réessayer" : `Payer ${fcfa(total)}`} <ArrowRight size={16} />
                </Btn>
              </div>
            </>
          )}
        </div>
        <div className="tunnel-aside" style={{ flex: "0 0 280px" }}><Summary flow={flow} /></div>
      </div>
    </div>
  );
}
