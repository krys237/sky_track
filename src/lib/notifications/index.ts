import "server-only";
import type { NotificationProvider } from "./types";
import { mockNotifier } from "./mock";

/**
 * Sélection du canal de notification via `NOTIFY_PROVIDER` (défaut : `mock`).
 */
const NOTIFIERS: Record<string, NotificationProvider> = {
  mock: mockNotifier,
  // email: resendNotifier,
  // whatsapp: whatsappNotifier,
};

export function getNotifier(): NotificationProvider {
  const key = process.env.NOTIFY_PROVIDER || "mock";
  const notifier = NOTIFIERS[key];
  if (!notifier) {
    throw new Error(
      `Canal de notification inconnu : "${key}". Valeurs possibles : ${Object.keys(NOTIFIERS).join(", ")}.`,
    );
  }
  return notifier;
}

export type { NotificationProvider, OrderConfirmationData } from "./types";
