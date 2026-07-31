/**
 * Deux bannières fixes partagent le même emplacement (bas d'écran) : l'invite
 * PWA « Ajouter à l'écran d'accueil » et le rappel « Installez l'app de suivi ».
 * Ce petit bus garantit qu'une seule s'affiche à la fois : la première à
 * réclamer le créneau l'obtient, l'autre attend la prochaine visite. Une
 * réclamation `force` (ouverture manuelle depuis le footer) évince l'occupante.
 */

export type BannerOwner = "install" | "findapp";

let current: BannerOwner | null = null;
const listeners = new Set<(owner: BannerOwner | null) => void>();

export function claimBanner(owner: BannerOwner, force = false): boolean {
  if (current && current !== owner && !force) return false;
  current = owner;
  listeners.forEach((l) => l(current));
  return true;
}

export function releaseBanner(owner: BannerOwner) {
  if (current !== owner) return;
  current = null;
  listeners.forEach((l) => l(null));
}

export function subscribeBanner(fn: (owner: BannerOwner | null) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
