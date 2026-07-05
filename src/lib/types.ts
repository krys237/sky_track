import type { LucideIcon } from "lucide-react";

export type PackId = "solo" | "famille" | "business";

export interface Pack {
  id: PackId;
  name: string;
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
