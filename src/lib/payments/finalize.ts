import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getNotifier } from "@/lib/notifications";
import { PACKS } from "@/lib/content";
import type { ContactType, PackId, PayMethod } from "@/lib/types";
import type { NormalizedWebhook } from "./types";

export interface FinalizeResult {
  ok: boolean;
  error?: string;
  /** Statut final de la commande (`payee` | `echouee`). */
  statut?: "payee" | "echouee";
  ref?: string;
  /** true si le webhook a déjà été traité (rejeu). */
  alreadyProcessed?: boolean;
}

/**
 * Applique le résultat d'un paiement de bout en bout :
 *   1. met à jour la ligne `paiements` (statut, montant vérifié, payload) ;
 *   2. bascule la `commande` en `payee` / `echouee` ;
 *   3. déclenche la notification de confirmation en cas de succès.
 *
 * Idempotent : un rejeu du webhook sur une commande déjà finalisée est ignoré.
 * Utilisé à la fois par la route webhook réelle et par la confirmation mock.
 */
export async function finalizePayment(
  data: NormalizedWebhook & { agregateur?: string; rawPayload?: unknown },
): Promise<FinalizeResult> {
  const admin = createAdminClient();

  // 1. Retrouver le paiement + la commande + le client rattachés -------------
  const { data: paiement, error: payErr } = await admin
    .from("paiements")
    .select("id, commande_id, statut, commandes(id, ref, pack, quantite, montant, statut, moyen_paiement, clients(nom, contact_type, contact_value, ville, adresse))")
    .eq("transaction_id", data.transactionId)
    .single();

  if (payErr || !paiement) {
    return { ok: false, error: "Transaction inconnue." };
  }

  // `commandes` peut être renvoyé comme objet unique (relation to-one)
  const commande = (paiement as unknown as {
    commandes: {
      id: string; ref: string; pack: PackId; quantite: number; montant: number;
      statut: string; moyen_paiement: string | null;
      clients: {
        nom: string; contact_type: ContactType; contact_value: string;
        ville: string; adresse: string;
      } | null;
    } | null;
  }).commandes;

  if (!commande) return { ok: false, error: "Commande introuvable." };

  // Idempotence : déjà finalisée → on ne retraite pas -----------------------
  if (commande.statut === "payee" || commande.statut === "echouee") {
    return {
      ok: true,
      alreadyProcessed: true,
      statut: commande.statut,
      ref: commande.ref,
    };
  }

  const success = data.result === "success";
  const statutCommande: "payee" | "echouee" = success ? "payee" : "echouee";

  // 2. Mise à jour du paiement ----------------------------------------------
  await admin
    .from("paiements")
    .update({
      statut: success ? "success" : "failed",
      montant_verifie: data.amount ?? commande.montant,
      agregateur: data.agregateur ?? null,
      webhook_payload: data.rawPayload ?? null,
    })
    .eq("id", paiement.id);

  // 3. Mise à jour de la commande -------------------------------------------
  await admin.from("commandes").update({ statut: statutCommande }).eq("id", commande.id);

  // 4. Notification (succès uniquement) -------------------------------------
  if (success && commande.clients) {
    try {
      const packName = PACKS.find((p) => p.id === commande.pack)?.name ?? commande.pack;
      await getNotifier().sendOrderConfirmation({
        ref: commande.ref,
        pack: commande.pack,
        packName,
        quantite: commande.quantite,
        montant: commande.montant,
        contactType: commande.clients.contact_type,
        contact: commande.clients.contact_value,
        name: commande.clients.nom,
        city: commande.clients.ville,
        address: commande.clients.adresse,
        pay: (commande.moyen_paiement as PayMethod | null) ?? null,
      });
    } catch {
      // Une notification qui échoue ne doit pas invalider le paiement.
    }
  }

  return { ok: true, statut: statutCommande, ref: commande.ref };
}
