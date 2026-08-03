import "server-only";
import type { PaymentProvider } from "./types";
import { mockProvider } from "./mock";
import { hubProvider } from "./hub";

/**
 * Sélection de l'agrégateur actif via `PAYMENT_PROVIDER` (défaut : `mock`).
 * `hub` = hub de paiement EdoctorPaiement (OM / MoMo réels) — requiert
 * EDOCTOR_HUB_TOKEN et EDOCTOR_HUB_WEBHOOK_SECRET dans .env.local.
 */
const PROVIDERS: Record<string, PaymentProvider> = {
  mock: mockProvider,
  hub: hubProvider,
};

export function getPaymentProvider(): PaymentProvider {
  const key = process.env.PAYMENT_PROVIDER || "mock";
  const provider = PROVIDERS[key];
  if (!provider) {
    throw new Error(
      `Agrégateur de paiement inconnu : "${key}". Valeurs possibles : ${Object.keys(PROVIDERS).join(", ")}.`,
    );
  }
  return provider;
}

/** Le provider courant est-il le mock (workflow de démo/test) ? */
export function isMockPayments(): boolean {
  return (process.env.PAYMENT_PROVIDER || "mock") === "mock";
}

export type { PaymentProvider } from "./types";
