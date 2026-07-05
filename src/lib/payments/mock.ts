import "server-only";
import { randomInt } from "node:crypto";
import type {
  InitiatePaymentParams,
  NormalizedWebhook,
  PaymentInitiation,
  PaymentProvider,
} from "./types";

/**
 * Agrégateur factice — reproduit fidèlement le cycle mobile money :
 * l'initiation renvoie `pending`, puis un webhook confirme le succès ou l'échec.
 * Il permet de valider tout le workflow (base, statuts, notifications) avec des
 * valeurs prédéfinies, avant de brancher le hub de paiement réel.
 */
export const mockProvider: PaymentProvider = {
  name: "mock",

  async initiate(params: InitiatePaymentParams): Promise<PaymentInitiation> {
    const suffix = randomInt(0x10000000, 0x7fffffff).toString(16).toUpperCase();
    const transactionId = `MOCK-${params.ref}-${suffix}`;
    // Toujours `pending` : la confirmation arrive via le webhook simulé.
    return { transactionId, status: "pending" };
  },

  parseWebhook(payload: unknown): NormalizedWebhook | null {
    if (!payload || typeof payload !== "object") return null;
    const p = payload as Record<string, unknown>;
    const transactionId = typeof p.transactionId === "string" ? p.transactionId : null;
    const result = p.result === "success" || p.result === "failed" ? p.result : null;
    if (!transactionId || !result) return null;
    return {
      transactionId,
      result,
      amount: typeof p.amount === "number" ? p.amount : undefined,
    };
  },
};
