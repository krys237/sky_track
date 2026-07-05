import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { finalizePayment } from "@/lib/payments/finalize";

/**
 * Webhook de confirmation de paiement.
 *
 * C'est LE point de branchement de votre hub de paiement : configurez son
 * URL de callback sur `/api/payments/webhook`. Le payload brut est normalisé
 * par l'agrégateur actif (`parseWebhook`), puis la commande est finalisée via
 * exactement la même logique que le flux de démo (`finalizePayment`).
 *
 * ⚠️ Sécurité (à ajouter au branchement réel) : vérifier la signature du hub
 * (en-tête HMAC / secret partagé) avant de traiter le payload.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Payload JSON invalide." }, { status: 400 });
  }

  const provider = getPaymentProvider();
  const normalized = provider.parseWebhook(payload);
  if (!normalized) {
    return NextResponse.json({ ok: false, error: "Payload non reconnu." }, { status: 400 });
  }

  const result = await finalizePayment({
    ...normalized,
    agregateur: provider.name,
    rawPayload: payload,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    statut: result.statut,
    ref: result.ref,
    alreadyProcessed: result.alreadyProcessed ?? false,
  });
}
