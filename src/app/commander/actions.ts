"use server";

import { randomInt } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getPaymentProvider, isMockPayments } from "@/lib/payments";
import { finalizePayment } from "@/lib/payments/finalize";
import { PACKS, deliveryFeeFor, normalizeRefCode, isValidRefCode } from "@/lib/content";
import type { ContactType, PackId, PayMethod, SaleMode } from "@/lib/types";

export type StatutCommande = "initiee" | "payee" | "echouee" | "expediee" | "livree";

export interface CreateOrderInput {
  pack: PackId;
  /** Parcours de vente : conditionne l'adresse et les frais de livraison. */
  mode: SaleMode;
  contactType: ContactType;
  contact: string;
  name: string;
  city: string;
  address: string;
  /** Code de l'agent de terrain (requis en sur-place, sinon facultatif). */
  refCode?: string | null;
  /** Moyen de paiement pressenti (informatif à ce stade). */
  pay?: PayMethod | null;
  /**
   * Clé d'idempotence produite par le navigateur, stable tant que l'issue de la
   * tentative reste inconnue. C'est elle qui évite le doublon quand la réponse
   * se perd en route et que le client réessaie sans savoir si la commande a été
   * créée. Le navigateur en génère une nouvelle après un échec **avéré**.
   */
  idempotencyKey: string;
}

export interface CreateOrderResult {
  ok: boolean;
  error?: string;
  ref?: string;
  commandeId?: string;
  /** Statut courant — le tunnel s'en sert pour ne pas faire repayer une commande déjà réglée. */
  statut?: StatutCommande;
  /** Vrai si la commande existait déjà : réessai après une réponse perdue. */
  reused?: boolean;
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

/** Le doublon porte-t-il sur la clé d'idempotence, ou sur la référence ? */
function isIdempotencyConflict(err: { message?: string; details?: string }): boolean {
  return `${err.message ?? ""} ${err.details ?? ""}`.includes("idempotency");
}

/**
 * Persiste une commande (modèle « invité + compte optionnel ») :
 *  1. crée la fiche client (rattachée à l'utilisateur si une session existe) ;
 *  2. crée la commande au statut `initiee` avec une référence unique.
 *
 * Le montant et la quantité sont dérivés du pack **côté serveur** — le prix
 * envoyé par le navigateur n'est jamais utilisé (anti-falsification).
 *
 * **Idempotent** : rappelée avec la même `idempotencyKey`, elle retrouve la
 * commande déjà créée au lieu d'en fabriquer une seconde. Indispensable ici,
 * car un timeout réseau laisse le navigateur dans l'ignorance de ce qui a été
 * écrit — il réessayait alors en dupliquant client et commande.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  // Validation minimale ------------------------------------------------------
  if (!input || typeof input !== "object") return { ok: false, error: "Requête invalide." };
  if (!isPackId(input.pack)) return { ok: false, error: "Pack inconnu." };
  const name = (input.name || "").trim();
  const contact = (input.contact || "").trim();
  const idemKey = (input.idempotencyKey || "").trim();

  const mode: SaleMode = input.mode === "sur_place" ? "sur_place" : "livraison";
  const isDelivery = mode === "livraison";
  // Adresse : requise et conservée uniquement en livraison.
  const city = isDelivery ? (input.city || "").trim() : "";
  const address = isDelivery ? (input.address || "").trim() : "";

  if (!name || !contact) return { ok: false, error: "Coordonnées incomplètes." };
  if (isDelivery && (!city || !address)) {
    return { ok: false, error: "Adresse de livraison incomplète." };
  }
  if (input.contactType !== "email" && input.contactType !== "whatsapp") {
    return { ok: false, error: "Type de contact invalide." };
  }
  if (!idemKey || idemKey.length > 100) {
    return { ok: false, error: "Requête invalide (clé de tentative)." };
  }

  // Code agent : requis en sur-place, sinon facultatif ; format validé s'il est
  // présent. Aucune vérification d'existence (pas encore de référentiel agents).
  const refCode = input.refCode ? normalizeRefCode(input.refCode) : "";
  if (refCode && !isValidRefCode(refCode)) {
    return { ok: false, error: "Code agent invalide." };
  }
  if (!isDelivery && !refCode) {
    return { ok: false, error: "Code agent requis pour une vente sur place." };
  }

  const pack = PACKS.find((p) => p.id === input.pack)!;
  // Montant recalculé côté serveur (anti-falsification) : produit + frais du mode.
  const frais = deliveryFeeFor(mode);
  const montant = pack.price + frais;
  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error("[createOrder] configuration Supabase absente :", e);
    return { ok: false, error: "Service de commande indisponible (configuration)." };
  }

  // Utilisateur connecté ? (session portée par les cookies) ------------------
  let userId: string | null = null;
  try {
    const supa = createServerClient();
    const { data } = await supa.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {
    userId = null; // pas de session : commande invité
  }

  const coords = {
    user_id: userId,
    nom: name,
    contact_type: input.contactType,
    contact_value: contact,
    ville: isDelivery ? city : null,
    adresse: isDelivery ? address : null,
  };

  // 0. Cette tentative a-t-elle déjà abouti ? ---------------------------------
  // Cas typique : la requête précédente a créé la commande, mais la réponse
  // s'est perdue (timeout). On rend la commande existante au lieu d'en créer
  // une seconde — et on rafraîchit les données modifiables au passage.
  const { data: existing, error: lookupErr } = await admin
    .from("commandes")
    .select("id, ref, statut, client_id")
    .eq("idempotency_key", idemKey)
    .maybeSingle();

  if (lookupErr) {
    console.error("[createOrder] lecture par clé d'idempotence échouée :", {
      code: lookupErr.code,
      message: lookupErr.message,
      details: lookupErr.details,
      hint: lookupErr.hint,
    });
    return { ok: false, error: "Service de commande momentanément indisponible." };
  }

  if (existing) {
    // Une commande déjà payée (ou expédiée) ne se remet pas en jeu : on la
    // renvoie telle quelle, le tunnel enchaînera sur la confirmation.
    if (existing.statut === "initiee") {
      await admin.from("clients").update(coords).eq("id", existing.client_id);
      await admin
        .from("commandes")
        .update({
          pack: pack.id,
          quantite: pack.cards,
          montant,
          mode,
          frais_livraison: frais,
          code_referent: refCode || null,
          moyen_paiement: input.pay ?? null,
        })
        .eq("id", existing.id);
    }
    return {
      ok: true,
      ref: existing.ref,
      commandeId: existing.id,
      statut: existing.statut,
      reused: true,
    };
  }

  // 1. Fiche client ----------------------------------------------------------
  const { data: client, error: clientErr } = await admin
    .from("clients")
    .insert(coords)
    .select("id")
    .single();

  if (clientErr || !client) {
    // Sans cette trace, toute panne (réseau, clé invalide, RLS, schéma) se
    // présente au client comme le même message générique — indébogable.
    console.error("[createOrder] insert clients échoué :", {
      code: clientErr?.code,
      message: clientErr?.message,
      details: clientErr?.details,
      hint: clientErr?.hint,
    });
    return { ok: false, error: "Échec de l'enregistrement du client." };
  }

  // La fiche vient d'être créée : si la commande n'aboutit pas, elle ne doit
  // pas survivre. Sans cette compensation (il n'y a pas de transaction entre
  // deux appels PostgREST), chaque échec laissait un client orphelin en base.
  const dropOrphanClient = async () => {
    const { error } = await admin.from("clients").delete().eq("id", client.id);
    if (error) {
      console.error("[createOrder] client orphelin non supprimé :", client.id, error.message);
    }
  };

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
        montant,
        devise: "XAF",
        statut: "initiee",
        mode,
        frais_livraison: frais,
        code_referent: refCode || null,
        moyen_paiement: input.pay ?? null,
        idempotency_key: idemKey,
      })
      .select("id, ref, statut")
      .single();

    if (!cmdErr && commande) {
      return {
        ok: true,
        ref: commande.ref,
        commandeId: commande.id,
        statut: commande.statut,
      };
    }

    // 23505 = unique_violation. Deux contraintes peuvent la déclencher :
    if (cmdErr && cmdErr.code === "23505") {
      // • la clé d'idempotence → une requête concurrente a gagné la course ;
      //   on adopte sa commande plutôt que d'en créer une deuxième.
      if (isIdempotencyConflict(cmdErr)) {
        await dropOrphanClient();
        const { data: raced } = await admin
          .from("commandes")
          .select("id, ref, statut")
          .eq("idempotency_key", idemKey)
          .maybeSingle();
        if (raced) {
          return {
            ok: true,
            ref: raced.ref,
            commandeId: raced.id,
            statut: raced.statut,
            reused: true,
          };
        }
        return { ok: false, error: "Échec de l'enregistrement de la commande." };
      }
      continue; // • la référence → simple collision, on en tire une autre.
    }

    if (cmdErr) {
      console.error("[createOrder] insert commandes échoué :", {
        code: cmdErr.code,
        message: cmdErr.message,
        details: cmdErr.details,
        hint: cmdErr.hint,
      });
      await dropOrphanClient();
      return { ok: false, error: "Échec de l'enregistrement de la commande." };
    }
  }

  await dropOrphanClient();
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
  /**
   * Statut de la commande au moment du refus. Il permet au tunnel de
   * distinguer « déjà payée » (→ on enchaîne sur la confirmation) d'une vraie
   * erreur — sans quoi un client dont le paiement a abouti pendant un timeout
   * se voit proposer de payer une seconde fois.
   */
  statut?: StatutCommande;
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
    return {
      ok: false,
      error: "Cette commande n'est plus en attente de paiement.",
      statut: commande.statut,
    };
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
  } catch (e) {
    console.error("[initiatePayment] agrégateur en échec :", e);
    return { ok: false, error: "L'agrégateur de paiement est indisponible." };
  }

  // Trace le paiement (pending)
  const { error: payErr } = await admin.from("paiements").insert({
    commande_id: commande.id,
    agregateur: provider.name,
    transaction_id: initiation.transactionId,
    statut: "pending",
  });
  if (payErr) {
    console.error("[initiatePayment] insert paiements échoué :", {
      code: payErr.code,
      message: payErr.message,
      details: payErr.details,
      hint: payErr.hint,
    });
    return { ok: false, error: "Échec de l'enregistrement du paiement." };
  }

  // Refus immédiat du provider (ex. solde insuffisant détecté à l'initiation) :
  // aucun webhook ne viendra, on finalise tout de suite — le tunnel verra
  // `echouee` dès son premier sondage.
  if (initiation.status === "failed") {
    await finalizePayment({
      transactionId: initiation.transactionId,
      result: "failed",
      agregateur: provider.name,
      rawPayload: { source: "initiation-failed", transactionId: initiation.transactionId },
    });
  }

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
  statut?: StatutCommande;
}

/**
 * Filet anti-webhook-perdu : au-delà de ce délai sans confirmation, le sondage
 * interroge directement l'agrégateur (throttlé pour ne pas marteler le hub à
 * chaque tick du tunnel). En mémoire process : un cold start remet juste les
 * compteurs à zéro, sans conséquence.
 */
const RECONCILE_AFTER_MS = 45_000;
const RECONCILE_EVERY_MS = 15_000;
const lastReconcileAt = new Map<string, number>();

/**
 * Si un paiement `pending` traîne, demande son état réel à l'agrégateur et
 * finalise le cas échéant. Couvre le webhook perdu — et le dev local, où le
 * hub ne peut pas joindre localhost. Sans effet avec le mock (pas de
 * `checkStatus`).
 */
async function reconcilePendingPayment(
  admin: ReturnType<typeof createAdminClient>,
  commandeId: string,
): Promise<StatutCommande | null> {
  const provider = getPaymentProvider();
  if (!provider.checkStatus) return null;

  const { data: paiement } = await admin
    .from("paiements")
    .select("transaction_id, created_at")
    .eq("commande_id", commandeId)
    .eq("statut", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!paiement?.transaction_id) return null;

  const age = Date.now() - new Date(paiement.created_at).getTime();
  if (age < RECONCILE_AFTER_MS) return null;

  const last = lastReconcileAt.get(paiement.transaction_id) ?? 0;
  if (Date.now() - last < RECONCILE_EVERY_MS) return null;
  lastReconcileAt.set(paiement.transaction_id, Date.now());

  try {
    const outcome = await provider.checkStatus(paiement.transaction_id);
    if (!outcome) return null; // toujours en attente côté provider
    const finalized = await finalizePayment({
      ...outcome,
      agregateur: provider.name,
      rawPayload: { source: "status-poll", transactionId: paiement.transaction_id },
    });
    if (finalized.ok && finalized.statut) {
      lastReconcileAt.delete(paiement.transaction_id);
      return finalized.statut;
    }
  } catch (e) {
    console.error("[getOrderStatus] réconciliation agrégateur échouée :", e);
  }
  return null;
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

  if (data.statut === "initiee") {
    const reconciled = await reconcilePendingPayment(admin, commandeId);
    if (reconciled) return { ok: true, statut: reconciled };
  }
  return { ok: true, statut: data.statut };
}

/**
 * Le tunnel n'affiche la bannière « Démo » et ne simule le webhook que si
 * l'agrégateur actif est le mock — avec le hub réel, tout ceci disparaît.
 */
export async function isDemoPayment(): Promise<boolean> {
  return isMockPayments();
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
