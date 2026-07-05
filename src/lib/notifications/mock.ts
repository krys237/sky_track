import "server-only";
import type { NotificationProvider, OrderConfirmationData } from "./types";

/**
 * Notifieur factice : journalise le message qui serait envoyé au client.
 * Permet de valider le déclenchement (à la confirmation du paiement) sans
 * dépendre d'un fournisseur externe. Remplacer par Resend / WhatsApp au Lot 2+.
 */
export const mockNotifier: NotificationProvider = {
  name: "mock",

  async sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
    const canal = data.contactType === "whatsapp" ? "WhatsApp" : "Email";
    const montant = new Intl.NumberFormat("fr-FR").format(data.montant);
    // eslint-disable-next-line no-console
    console.info(
      `[notifications:mock] → ${canal} à ${data.contact}\n` +
        `  Bonjour ${data.name}, votre commande ${data.ref} est confirmée.\n` +
        `  ${data.packName} · ${data.quantite} carte(s) · ${montant} FCFA\n` +
        `  Livraison : ${data.address}, ${data.city}.`,
    );
  },
};
