import type { LucideIcon } from "lucide-react";

// Les 2 produits réels (cf. TAG_PRODUCTS). Le tunnel de commande et la BD
// partagent désormais ces identifiants ; plus d'anciens packs solo/famille/business.
export type PackId = "carte" | "rond";

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
  id: "carte" | "rond";
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

export interface Flow {
  pack: PackId;
  contactType: ContactType;
  contact: string;
  name: string;
  city: string;
  address: string;
  pay: PayMethod | null;
  os: OS | null;
  orderRef: string | null;
  /** UUID de la commande persistée en base (null tant que non créée). */
  commandeId: string | null;
}
