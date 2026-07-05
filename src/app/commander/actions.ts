"use server";

import { randomInt } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getPaymentProvider, isMockPayments } from "@/lib/payments";
import { finalizePayment } from "@/lib/payments/finalize";
import { PACKS } from "@/lib/content";
import type { ContactType, PackId, PayMethod } from "@/lib/types";

export interface CreateOrderInput {
  pack: PackId;
  contactType: ContactType;
  contact: string;
  name: string;
  city: string;
  address: string;
  /** Moyen de paiement pressenti (informatif à ce stade). */
  pay?: PayMethod | null;
}

export interface CreateOrderResult {
  ok: boolean;
  error?: string;
  ref?: string;
  commandeId?: string;
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans I,O,0,1 (lisibilité)

function makeRef(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  return `SKY-${s}`;
}

function isPackId(v: string): v is PackId {
  return PACKS.some((p) => p.id === v);
}

/**
 * Persiste une commande (modèle « invité + compte optionnel ») :
 *  1. crée la fiche client (rattachée à l'utilisateur si une session existe) ;
 *  2. crée la commande au statut `initiee` avec une référence unique.
 *
 * Le montant et la quantité sont dérivés du pack **côté serveur** — le prix
 * envoyé par le navigateur n'est jamais utilisé (anti-falsification).
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  // Validation minimale ------------------------------------------------------
  if (!input || typeof input !== "object") return { ok: false, error: "Requête invalide." };
  if (!isPackId(input.pack)) return { ok: false, error: "Pack inconnu." };
  const name = (input.name || "").trim();
  const contact = (input.contact || "").trim();
  const city = (input.city || "").trim();
  const address = (input.address || "").trim();
  if (!name || !contact || !city || !address) {
    return { ok: false, error: "Coordonnées incomplètes." };
  }
  if (input.contactType !== "email" && input.contactType !== "whatsapp") {
    return { ok: false, error: "Type de contact invalide." };
  }

  const pack = PACKS.find((p) => p.id === input.pack)!;
  const admin = createAdminClient();

  // Utilisateur connecté ? (session portée par les cookies) ------------------
  let userId: string | null = null;
  try {
    const supa = createServerClient();
    const { data } = await supa.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {
    userId = null; // pas de session : commande invité
  }

  // 1. Fiche client ----------------------------------------------------------
  const { data: client, error: clientErr } = await admin
    .from("clients")
    .insert({
      user_id: userId,
      nom: name,
      contact_type: input.contactType,
      contact_value: contact,
      ville: city,
      adresse: address,
    })
    .select("id")
    .single();

  if (clientErr || !client) {
    return { ok: false, error: "Échec de l'enregistrement du client." };
  }

  // 2. Commande (avec réf unique, une nouvelle tentative en cas de collision) -
  for (let attempt = 0; attempt < 3; attempt++) {
    const ref = makeRef();
    const { data: commande, error: cmdErr } = await admin
      .from("commandes")
      .insert({
        ref,
        client_id: client.id,
        pack: pack.id,
        quantite: pack.cards,
        montant: pack.price,
        devise: "XAF",
        statut: "initiee",
        moyen_paiement: input.pay ?? null,
      })
      .select("id, ref")
      .single();

    if (!cmdErr && commande) {
      return { ok: true, ref: commande.ref, commandeId: commande.id };
    }
    // 23505 = unique_violation (collision de réf) → on retente
    if (cmdErr && cmdErr.code !== "23505") {
      return { ok: false, error: "Échec de l'enregistrement de la commande." };
    }
  }
  return { ok: false, error: "Impossible de générer une référence unique." };
}

// ============================================================================
// Paiement — initiation, sondage de statut, confirmation (mock)
// ============================================================================

export interface InitiatePaymentInput {
  commandeId: string;
  method: PayMethod;
  /** Numéro MoMo / OM saisi par le client (mobile money). */
  phone?: string;
}

export interface InitiatePaymentResult {
  ok: boolean;
  error?: string;
  transactionId?: string;
  status?: "pending" | "success" | "failed";
  redirectUrl?: string;
}

/**
 * Démarre le paiement d'une commande via l'agrégateur actif :
 *   • enregistre le moyen de paiement sur la commande ;
 *   • crée une ligne `paiements` au statut `pending` ;
 *   • renvoie l'identifiant de transaction (à confirmer par webhook).
 */
export async function initiatePayment(
  input: InitiatePaymentInput,
): Promise<InitiatePaymentResult> {
  if (!input?.commandeId) return { ok: false, error: "Commande manquante." };
  if (!["momo", "om", "visa"].includes(input.method)) {
    return { ok: false, error: "Moyen de paiement invalide." };
  }

  const admin = createAdminClient();
  const { data: commande, error } = await admin
    .from("commandes")
    .select("id, ref, montant, devise, statut, client_id, clients(nom, contact_value)")
    .eq("id", input.commandeId)
    .single();

  if (error || !commande) return { ok: false, error: "Commande introuvable." };
  if (commande.statut !== "initiee") {
    return { ok: false, error: "Cette commande n'est plus en attente de paiement." };
  }

  // Enregistre le moyen de paiement choisi
  await admin.from("commandes").update({ moyen_paiement: input.method }).eq("id", commande.id);

  const client = (commande as unknown as {
    clients: { nom: string; contact_value: string } | null;
  }).clients;

  const provider = getPaymentProvider();
  let initiation;
  try {
    initiation = await provider.initiate({
      commandeId: commande.id,
      ref: commande.ref,
      amount: commande.montant,
      currency: commande.devise,
      method: input.method,
      payer: { name: client?.nom, phone: input.phone, contact: client?.contact_value },
    });
  } catch {
    return { ok: false, error: "L'agrégateur de paiement est indisponible." };
  }

  // Trace le paiement (pending)
  const { error: payErr } = await admin.from("paiements").insert({
    commande_id: commande.id,
    agregateur: provider.name,
    transaction_id: initiation.transactionId,
    statut: initiation.status,
  });
  if (payErr) return { ok: false, error: "Échec de l'enregistrement du paiement." };

  return {
    ok: true,
    transactionId: initiation.transactionId,
    status: initiation.status,
    redirectUrl: initiation.redirectUrl,
  };
}

export interface OrderStatusResult {
  ok: boolean;
  error?: string;
  statut?: "initiee" | "payee" | "echouee" | "expediee" | "livree";
}

/** Sonde le statut d'une commande (utilisé en attente de confirmation). */
export async function getOrderStatus(commandeId: string): Promise<OrderStatusResult> {
  if (!commandeId) return { ok: false, error: "Commande manquante." };
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("commandes")
    .select("statut")
    .eq("id", commandeId)
    .single();
  if (error || !data) return { ok: false, error: "Commande introuvable." };
  return { ok: true, statut: data.statut };
}

/**
 * Confirmation de paiement SIMULÉE (uniquement quand l'agrégateur est le mock).
 * Représente « le client valide sur son téléphone » + le webhook de l'agrégateur.
 * Passe par exactement la même finalisation que la route webhook réelle, de
 * sorte que brancher le hub ne changera rien à la logique en aval.
 */
export async function confirmMockPayment(
  transactionId: string,
  result: "success" | "failed",
): Promise<{ ok: boolean; error?: string; statut?: "payee" | "echouee" }> {
  if (!isMockPayments()) {
    return { ok: false, error: "Confirmation manuelle indisponible (agrégateur réel actif)." };
  }
  if (!transactionId) return { ok: false, error: "Transaction manquante." };

  const outcome = await finalizePayment({
    transactionId,
    result,
    agregateur: "mock",
    rawPayload: { source: "mock-confirm", transactionId, result },
  });
  if (!outcome.ok) return { ok: false, error: outcome.error };
  return { ok: true, statut: outcome.statut };
}
