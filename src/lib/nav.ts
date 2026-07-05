import type { PackId } from "./types";

/** Clés logiques de page (héritées du prototype) → chemins réels Next. */
export type PageKey = "home" | "how" | "products" | "faq" | "support";

export const PAGE_TO_PATH: Record<PageKey, string> = {
  home: "/",
  how: "/comment-ca-marche",
  products: "/produits",
  faq: "/faq",
  support: "/support",
};

export const NAV_ITEMS: [PageKey, string][] = [
  ["home", "Accueil"],
  ["how", "Comment ça marche"],
  ["products", "Produits"],
  ["faq", "FAQ"],
  ["support", "Support"],
];

/** Chemin → clé de page active (pour surligner la navigation). */
export function pathToPage(pathname: string): PageKey | null {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/comment-ca-marche")) return "how";
  if (pathname.startsWith("/produits")) return "products";
  if (pathname.startsWith("/faq")) return "faq";
  if (pathname.startsWith("/support")) return "support";
  return null;
}

/** Construit l'URL du tunnel, avec pack pré-sélectionné le cas échéant. */
export function commanderHref(pack?: PackId): string {
  return pack ? `/commander?pack=${pack}` : "/commander";
}
