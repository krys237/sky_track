import "server-only";

/**
 * `fetch` durci pour les appels Supabase côté serveur.
 *
 * Le réseau de production est lent et irrégulier : un connect TCP vers le front
 * Cloudflare de Supabase a été mesuré à ~9 s, pour un timeout undici par défaut
 * de 10 s. On tombait donc en `UND_ERR_CONNECT_TIMEOUT` de façon aléatoire, sans
 * le moindre réessai.
 *
 * Deux garde-fous :
 *   1. un timeout explicite (plus large que celui d'undici, mais borné) ;
 *   2. des réessais avec backoff — dont la politique dépend de l'idempotence
 *      de la requête (voir `isRetryable`).
 */

const TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [400, 1_200];

/** Méthodes sans effet de bord : réessayables sans risque de doublon. */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Codes d'erreur qui prouvent que la requête n'a **jamais atteint** le serveur.
 * Seuls ceux-là autorisent le réessai d'un POST/PATCH/DELETE : rejouer une
 * écriture qui a peut-être abouti créerait précisément les doublons qu'on
 * cherche à éliminer.
 */
const PRE_FLIGHT_CODES = new Set([
  "UND_ERR_CONNECT_TIMEOUT",
  "ENOTFOUND",
  "ECONNREFUSED",
  "EAI_AGAIN",
  "EHOSTUNREACH",
  "ENETUNREACH",
]);

/** Déplie la chaîne `cause` d'undici (et les AggregateError) pour en tirer les codes. */
function errorCodes(err: unknown, depth = 0): string[] {
  if (!err || typeof err !== "object" || depth > 5) return [];
  const e = err as { code?: unknown; cause?: unknown; errors?: unknown };
  const out: string[] = [];
  if (typeof e.code === "string") out.push(e.code);
  if (Array.isArray(e.errors)) {
    for (const sub of e.errors) out.push(...errorCodes(sub, depth + 1));
  }
  if (e.cause) out.push(...errorCodes(e.cause, depth + 1));
  return out;
}

function isPreFlightFailure(err: unknown): boolean {
  return errorCodes(err).some((c) => PRE_FLIGHT_CODES.has(c));
}

/**
 * Le corps peut-il être rejoué ? Les flux (`ReadableStream`) sont consommés au
 * premier essai — les rejouer enverrait un corps vide. Supabase envoie du JSON
 * sérialisé, donc en pratique on passe toujours.
 */
function isReplayable(body: BodyInit | null | undefined): boolean {
  return body == null || typeof body === "string";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function resilientFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const method = (init?.method || "GET").toUpperCase();
  const safe = SAFE_METHODS.has(method);
  const replayable = isReplayable(init?.body);

  let lastErr: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(input, {
        ...init,
        signal: init?.signal ?? AbortSignal.timeout(TIMEOUT_MS),
      });

      // 5xx / 429 : l'écriture a pu être appliquée côté serveur → on ne rejoue
      // que les méthodes sûres.
      if (safe && replayable && (res.status >= 500 || res.status === 429)) {
        if (attempt < MAX_ATTEMPTS - 1) {
          await sleep(BACKOFF_MS[attempt]);
          continue;
        }
      }
      return res;
    } catch (err) {
      lastErr = err;

      // Un abort déclenché par l'appelant n'est pas une panne réseau.
      if (init?.signal?.aborted) throw err;

      const retryable = replayable && (safe || isPreFlightFailure(err));
      if (!retryable || attempt === MAX_ATTEMPTS - 1) break;

      console.warn(
        `[supabase] ${method} — tentative ${attempt + 1}/${MAX_ATTEMPTS} échouée ` +
          `(${errorCodes(err).join(", ") || "erreur inconnue"}), nouvel essai…`,
      );
      await sleep(BACKOFF_MS[attempt]);
    }
  }

  throw lastErr;
}
