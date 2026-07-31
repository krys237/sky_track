import type { LucideIcon } from "lucide-react";

// Les 3 produits réels (cf. TAG_PRODUCTS) : 2 traceurs + le chargeur de la Carte.
// Le tunnel de commande et la BD partagent ces identifiants ; plus d'anciens
// packs solo/famille/business.
export type PackId = "carte" | "rond" | "chargeur";

export interface Pack {
  id: PackId;
  name: string;
  /** Quantité incluse (1 tracker par option pour l'instant). */
  cards: number;
  price: number;
  tag: string;
  desc: string;
  best: boolean;
}

export interface IconItem {
  icon: LucideIcon;
  t: string;
  d: string;
}

export interface TagSpec {
  icon: LucideIcon;
  label: string;
  value: string;
}

export interface TagProduct {
  id: PackId;
  name: string;
  tagline: string;
  image: string;
  usage: string;
  highlights: string[];
  specs: TagSpec[];
}

export interface Step {
  n: string;
  icon: LucideIcon;
  t: string;
  d: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export type ContactType = "email" | "whatsapp";
export type PayMethod = "momo" | "om" | "visa";
export type OS = "android" | "ios";

/**
 * Deux parcours de vente :
 *  • `sur_place` — client présent, remise immédiate, pas d'adresse ni de frais ;
 *  • `livraison` — à distance, expédition, frais de livraison ajoutés au total.
 */
export type SaleMode = "sur_place" | "livraison";

export interface Flow {
  pack: PackId;
  /** Parcours de vente choisi (sur place / livraison). */
  mode: SaleMode;
  contactType: ContactType;
  contact: string;
  name: string;
  city: string;
  address: string;
  pay: PayMethod | null;
  /** Code de l'agent de terrain à créditer de la vente (null si aucun). */
  refCode: string | null;
  os: OS | null;
  orderRef: string | null;
  /** UUID de la commande persistée en base (null tant que non créée). */
  commandeId: string | null;
}
