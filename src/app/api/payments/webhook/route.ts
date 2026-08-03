import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { finalizePayment } from "@/lib/payments/finalize";

/**
 * Webhook de confirmation de paiement — URL à déclarer dans le ServiceToken
 * du hub : `https://<domaine-prod>/api/payments/webhook`.
 *
 * Le corps est lu BRUT avant tout parse : la signature HMAC du hub porte sur
 * les octets exacts reçus (`{timestamp}.{body}`), un JSON re-sérialisé ne
 * donnerait pas le même digest. Le payload validé est ensuite normalisé par
 * l'agrégateur actif (`parseWebhook`), puis la commande est finalisée via la
 * même logique que le flux de démo (`finalizePayment`, idempotente — les
 * relivraisons du hub sont donc sans effet).
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const provider = getPaymentProvider();

  // Authenticité : signature HMAC + fenêtre anti-rejeu. Le mock n'implémente
  // pas verifyWebhook (pas de contrôle en mode démo).
  if (provider.verifyWebhook && !provider.verifyWebhook(rawBody, request.headers)) {
    return NextResponse.json({ ok: false, error: "Signature invalide." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "Payload JSON invalide." }, { status: 400 });
  }

  const normalized = provider.parseWebhook(payload);
  if (!normalized) {
    // Événement authentique mais non actionnable (ex. passage à `pending`) :
    // on l'acquitte en 2xx, sinon le hub relivrerait 5 fois pour rien.
    return NextResponse.json({ ok: true, ignored: true });
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
