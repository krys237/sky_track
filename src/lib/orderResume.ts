import type { Flow } from "@/lib/types";

/**
 * Reprise de commande après un rafraîchissement / une fermeture d'onglet
 * pendant l'attente de confirmation du paiement.
 *
 * On ne persiste qu'un POINTEUR côté navigateur : le flow du tunnel (dont
 * `commandeId` + `orderRef`) et sa date. Le STATUT, lui, n'est jamais stocké
 * ici — c'est le serveur qui fait foi (`getOrderStatus`, qui déclenche aussi
 * la réconciliation auprès du hub). Aucune donnée de carte : elles ne quittent
 * jamais l'état local de StepPay.
 */

const KEY = "skytrack.pending-order.v1";
/** Au-delà d'une heure, la tentative est considérée abandonnée. */
const TTL_MS = 60 * 60 * 1000;

export interface PendingOrder {
  flow: Flow;
  savedAt: number;
}

export function savePendingOrder(flow: Flow): void {
  if (typeof window === "undefined" || !flow.commandeId) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ flow, savedAt: Date.now() } satisfies PendingOrder));
  } catch {
    // stockage plein / bloqué : la reprise est un confort, jamais bloquant
  }
}

export function loadPendingOrder(): PendingOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingOrder;
    if (!parsed?.flow?.commandeId || typeof parsed.savedAt !== "number") {
      localStorage.removeItem(KEY);
      return null;
    }
    if (Date.now() - parsed.savedAt > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingOrder(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // rien à faire
  }
}
