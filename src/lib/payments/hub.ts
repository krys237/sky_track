import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  InitiatePaymentParams,
  NormalizedWebhook,
  PaymentInitiation,
  PaymentProvider,
} from "./types";

/**
 * Agrégateur réel : hub de paiement EdoctorPaiement
 * (voir « INTEGRATION_GUIDE de payement.md » à la racine du projet).
 *
 * Cycle : POST /paiement/ → le client valide sur son téléphone → le hub
 * notifie /api/payments/webhook (signé HMAC) ; en secours, `checkStatus`
 * interroge /paiement/payment-status/ (webhook perdu, dev local sans URL
 * publique).
 */

/** provider_id du hub par moyen de paiement (doc §4 : 1 = Orange, 2 = MTN, 3 = Cybersource). */
const PROVIDER_IDS: Record<InitiatePaymentParams["method"], string> = {
  om: "1",
  momo: "2",
  visa: "3",
};

/** Fenêtre anti-rejeu des webhooks (doc §6.3 : 5 minutes). */
const WEBHOOK_MAX_AGE_S = 300;
/** L'initiation attend la réponse synchrone du provider (OM/MTN) — généreux. */
const INITIATE_TIMEOUT_MS = 25_000;
const STATUS_TIMEOUT_MS = 15_000;

function hubUrl(): string {
  return (process.env.EDOCTOR_HUB_URL || "https://payment.edoctor-tim.com/api-v1").replace(/\/+$/, "");
}

function hubToken(): string {
  const token = process.env.EDOCTOR_HUB_TOKEN;
  if (!token) throw new Error("EDOCTOR_HUB_TOKEN manquant : renseignez le ServiceToken dans .env.local.");
  return token;
}

// --- Petits extracteurs sûrs (payloads du hub non garantis) -----------------
type Json = Record<string, unknown>;
const asObj = (v: unknown): Json | null =>
  v !== null && typeof v === "object" ? (v as Json) : null;
const asStr = (v: unknown): string | null => (typeof v === "string" ? v : null);

/**
 * Statuts hub/provider → résultat normalisé. `null` = non terminal (pending)
 * ou inconnu : rien à finaliser.
 */
function mapStatus(raw: string | null | undefined): "success" | "failed" | null {
  const v = (raw || "").toLowerCase();
  if (v === "success" || v === "successful") return "success";
  if (v === "failed" || v === "cancelled" || v === "canceled" || v === "expired") return "failed";
  return null;
}

/** Le hub exige `2376XXXXXXXX` ; on accepte « 6XX… », « +237 6… », « 002376… ». */
function normalizePhone(raw: string | undefined): string | null {
  const digits = (raw || "").replace(/\D/g, "").replace(/^00/, "");
  if (/^2376\d{8}$/.test(digits)) return digits;
  if (/^6\d{8}$/.test(digits)) return `237${digits}`;
  return null;
}

export const hubProvider: PaymentProvider = {
  name: "hub",

  async initiate(params: InitiatePaymentParams): Promise<PaymentInitiation> {
    if (params.method === "visa") {
      // Cybersource renvoie une page HTML auto-soumise, pas une URL de
      // redirection : nécessite une intégration frontend dédiée (phase 2).
      throw new Error("Le paiement par carte arrive bientôt. Utilisez MTN MoMo ou Orange Money.");
    }

    const telephone = normalizePhone(params.payer.phone);
    if (!telephone) {
      throw new Error("Numéro mobile money invalide. Format attendu : 6XX XX XX XX (Cameroun).");
    }

    // PAS de champ `reference` : une référence personnalisée fait planter
    // l'initiation MoMo côté hub (500 « MoMo init failed », vérifié le
    // 2026-08-03 — il la relaie à MTN qui exige un UUID). On adopte à la place
    // la référence UUID générée par le hub (`payment.reference` dans la
    // réponse) : c'est elle qui revient dans le webhook et qui indexe la ligne
    // `paiements` — et elle reste unique par tentative. Le lien avec la
    // commande est conservé via `external_user_id` + description.
    const res = await fetch(`${hubUrl()}/paiement/`, {
      method: "POST",
      headers: {
        Authorization: `HubToken ${hubToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency || "XAF",
        provider_id: PROVIDER_IDS[params.method],
        module_origin: "skytrack",
        telephone,
        external_user_id: params.commandeId,
        description: `SkyTrack ${params.ref}`,
      }),
      signal: AbortSignal.timeout(INITIATE_TIMEOUT_MS),
      cache: "no-store",
    });

    const rawText = await res.text();
    let body: Json | null = null;
    try {
      body = asObj(JSON.parse(rawText));
    } catch {
      body = null;
    }

    if (!res.ok || !body) {
      console.error("[hub] initiation refusée :", res.status, rawText.slice(0, 600));
      throw new Error(
        res.status === 401 || res.status === 403
          ? "Accès au hub de paiement refusé (token invalide ou permissions insuffisantes)."
          : "Le hub de paiement est momentanément indisponible. Réessayez.",
      );
    }

    // `status: false` = le hub n'a pas pu créer le paiement (aucune ligne à
    // tracer) → on remonte son message tel quel.
    if (body.status === false) {
      const msg = asStr(body.message);
      console.error("[hub] initiation en échec :", rawText.slice(0, 600));
      throw new Error(msg || "L'initiation du paiement a été refusée par le hub.");
    }

    // « toujours verifier le status » : un refus provider peut être immédiat
    // (ex. 60019 solde insuffisant) — inutile alors d'attendre un webhook.
    const payment = asObj(body.payment);
    const providerPayload = asObj(body.provider_payload);
    const data = asObj(providerPayload?.data);
    const immediate = mapStatus(asStr(data?.status) ?? asStr(payment?.status));

    // La référence générée par le hub = notre transaction_id (elle revient
    // telle quelle dans le webhook et sert au polling payment-status).
    const hubReference =
      asStr(payment?.reference) ?? asStr(payment?.momo_session_id) ?? asStr(payment?.id);
    if (!hubReference) {
      console.error("[hub] réponse d'initiation sans référence :", rawText.slice(0, 600));
      throw new Error("Réponse du hub illisible (référence de transaction absente).");
    }

    // Paiement carte / page hébergée le cas échéant.
    const redirectUrl =
      asStr(data?.payment_url) ?? asStr(body.checkout_url) ?? undefined;

    return {
      transactionId: hubReference,
      status: immediate === "failed" ? "failed" : "pending",
      redirectUrl,
    };
  },

  parseWebhook(payload: unknown): NormalizedWebhook | null {
    const p = asObj(payload);
    if (!p || p.event !== "payment.status_changed") return null;
    const data = asObj(p.data);
    if (!data) return null;

    const reference = asStr(data.reference);
    const result = mapStatus(asStr(data.status));
    // `pending` / statut inconnu → non actionnable, la route acquitte sans traiter.
    if (!reference || !result) return null;

    const amountNum =
      typeof data.amount === "number" ? data.amount : parseFloat(asStr(data.amount) || "");
    return {
      transactionId: reference,
      result,
      amount: Number.isFinite(amountNum) ? amountNum : undefined,
    };
  },

  verifyWebhook(rawBody: string, headers: Headers): boolean {
    const secret = process.env.EDOCTOR_HUB_WEBHOOK_SECRET;
    if (!secret) {
      console.error("[hub] EDOCTOR_HUB_WEBHOOK_SECRET manquant : webhook rejeté.");
      return false;
    }
    const ts = headers.get("x-hub-timestamp") || "";
    const received = headers.get("x-hub-signature-256") || "";

    const tsInt = Number.parseInt(ts, 10);
    if (!Number.isFinite(tsInt)) return false;
    if (Math.abs(Date.now() / 1000 - tsInt) > WEBHOOK_MAX_AGE_S) return false; // anti-rejeu

    // Doc §6.3 : HMAC-SHA256 sur `{timestamp}.{body}` avec le webhook_secret.
    const expected =
      "sha256=" + createHmac("sha256", secret).update(`${ts}.${rawBody}`).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(received);
    return a.length === b.length && timingSafeEqual(a, b);
  },

  async checkStatus(transactionId: string): Promise<NormalizedWebhook | null> {
    // Interroge le provider en temps réel (doc §5.2) ; le hub met aussi à jour
    // son propre état et redéclenche un webhook si le statut a changé.
    const res = await fetch(
      `${hubUrl()}/paiement/payment-status/?reference=${encodeURIComponent(transactionId)}`,
      {
        headers: { Authorization: `HubToken ${hubToken()}` },
        signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
        cache: "no-store",
      },
    );
    if (!res.ok) {
      console.error("[hub] payment-status en échec :", res.status, transactionId);
      return null;
    }

    const body = asObj(await res.json().catch(() => null));
    const result = mapStatus(asStr(body?.status));
    if (!result) return null; // toujours pending → on repassera
    return { transactionId, result };
  },
};
