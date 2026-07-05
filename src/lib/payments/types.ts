import type { PayMethod } from "@/lib/types";

/** Résultat final d'une transaction, normalisé quel que soit l'agrégateur. */
export type PaymentResult = "success" | "failed";

/** Statut renvoyé à l'initiation (mobile money = souvent `pending`). */
export type PaymentPhase = "pending" | "success" | "failed";

export interface InitiatePaymentParams {
  commandeId: string;
  ref: string;
  /** Montant en FCFA (entier, XAF). */
  amount: number;
  currency: string;
  method: PayMethod;
  payer: {
    name?: string;
    /** Numéro MoMo / Orange Money le cas échéant. */
    phone?: string;
    /** Email / WhatsApp du client (pour les reçus). */
    contact?: string;
  };
}

export interface PaymentInitiation {
  /** Identifiant de transaction chez l'agrégateur. */
  transactionId: string;
  status: PaymentPhase;
  /** URL de redirection (paiement carte / page hébergée) si applicable. */
  redirectUrl?: string;
}

/** Résultat normalisé extrait d'un payload de webhook agrégateur. */
export interface NormalizedWebhook {
  transactionId: string;
  result: PaymentResult;
  /** Montant confirmé par l'agrégateur, si fourni. */
  amount?: number;
}

/**
 * Contrat que doit implémenter tout agrégateur (mock aujourd'hui, votre hub
 * de paiement demain). Brancher le hub = fournir une nouvelle implémentation
 * et la sélectionner via `PAYMENT_PROVIDER` — aucun autre changement requis.
 */
export interface PaymentProvider {
  readonly name: string;
  /** Démarre la transaction côté agrégateur. */
  initiate(params: InitiatePaymentParams): Promise<PaymentInitiation>;
  /** Transforme un payload de webhook brut en résultat exploitable. */
  parseWebhook(payload: unknown): NormalizedWebhook | null;
}
