/**
 * Mémoire locale du parcours « après achat » (côté navigateur uniquement) :
 * - `skytrack-paid-device` : cet appareil a vu un paiement aboutir (posée à la
 *   fin du tunnel, ou dès qu'on constate en base qu'un compte connecté a payé —
 *   cache qui évite de re-interroger Supabase à chaque visite).
 * - `skytrack-findapp-done` : l'utilisateur a cliqué vers le store ou déclaré
 *   avoir déjà l'app de suivi → on ne le relance plus.
 *
 * Limite assumée : un invité qui revient depuis un autre appareil ou après un
 * nettoyage du navigateur n'est pas reconnu — le web ne permet pas mieux sans
 * compte. Impossible aussi de détecter si l'app Find Hub / Localiser est
 * réellement installée : on ne peut se fier qu'aux actions faites sur le site.
 */

const PAID_KEY = "skytrack-paid-device";
const DONE_KEY = "skytrack-findapp-done";

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

/** À appeler quand un paiement aboutit (statut `payee`) sur cet appareil. */
export function markPaidOnDevice() {
  safeSet(PAID_KEY, String(Date.now()));
}

export function hasPaidOnDevice(): boolean {
  return !!safeGet(PAID_KEY);
}

/** L'utilisateur a cliqué vers le store ou confirmé avoir l'app. */
export function markFindAppDone() {
  safeSet(DONE_KEY, String(Date.now()));
}

export function isFindAppDone(): boolean {
  return !!safeGet(DONE_KEY);
}

export type Platform = "android" | "ios" | "other";

export function detectPlatform(): Platform {
  const ua = window.navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}
