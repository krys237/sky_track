import type { PackId } from "./types";

/** Clés logiques de page (héritées du prototype) → chemins réels Next. */
export type PageKey = "home" | "how" | "products" | "faq" | "support" | "contact" | "guide";

export const PAGE_TO_PATH: Record<PageKey, string> = {
  home: "/",
  // « how » et « products » ne sont plus des pages autonomes : ce sont des ancres
  // vers les sections correspondantes de la home (voir Nav → goSection).
  how: "/#how",
  products: "/#products",
  faq: "/faq",
  support: "/support",
  contact: "/contact",
  // Guide de configuration en accès direct (hors tunnel d'achat).
  guide: "/configuration",
};

export const NAV_ITEMS: [PageKey, string][] = [
  ["home", "Accueil"],
  ["how", "Comment ça marche"],
  ["products", "Produits"],
  ["faq", "FAQ"],
  ["support", "Support"],
  ["contact", "Contact"],
  ["guide", "Configuration"],
];

/** Chemin → clé de page active (pour surligner la navigation).
 *  « how » / « products » sont des ancres de la home : pas de chemin dédié. */
export function pathToPage(pathname: string): PageKey | null {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/faq")) return "faq";
  if (pathname.startsWith("/support")) return "support";
  if (pathname.startsWith("/contact")) return "contact";
  if (pathname.startsWith("/configuration")) return "guide";
  return null;
}

/** Construit l'URL du tunnel, avec pack pré-sélectionné le cas échéant. */
export function commanderHref(pack?: PackId): string {
  return pack ? `/commander?pack=${pack}` : "/commander";
}
