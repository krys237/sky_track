import "server-only";
import type { PaymentProvider } from "./types";
import { mockProvider } from "./mock";

/**
 * Sélection de l'agrégateur actif via `PAYMENT_PROVIDER` (défaut : `mock`).
 * Pour brancher votre hub : ajoutez `./hub.ts` implémentant `PaymentProvider`,
 * enregistrez-le ci-dessous, puis passez `PAYMENT_PROVIDER=hub` dans .env.local.
 */
const PROVIDERS: Record<string, PaymentProvider> = {
  mock: mockProvider,
  // hub: hubProvider,
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
