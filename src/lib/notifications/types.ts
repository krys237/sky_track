import type { ContactType, PackId, PayMethod } from "@/lib/types";

export interface OrderConfirmationData {
  ref: string;
  pack: PackId;
  packName: string;
  quantite: number;
  montant: number; // FCFA
  contactType: ContactType;
  contact: string;
  name: string;
  city: string;
  address: string;
  pay: PayMethod | null;
}

/**
 * Contrat d'envoi de notifications (mock aujourd'hui ; email via Resend et/ou
 * WhatsApp Cloud API demain). Brancher un vrai canal = fournir une nouvelle
 * implémentation et la sélectionner via `NOTIFY_PROVIDER`.
 */
export interface NotificationProvider {
  readonly name: string;
  sendOrderConfirmation(data: OrderConfirmationData): Promise<void>;
}
