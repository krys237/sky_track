import type { ContactType } from "@/lib/types";

/**
 * Profil client stocké dans les métadonnées utilisateur Supabase
 * (`user_metadata`) — pas de table dédiée. Sert à alimenter l'espace
 * « Mon compte » et à pré-remplir le tunnel de commande.
 */
export interface Profile {
  name: string;
  contactType: ContactType;
  contact: string;
  city: string;
  address: string;
}

type Meta = Record<string, unknown> | undefined | null;

export function profileFromMetadata(meta: Meta): Profile {
  const m = (meta ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  return {
    name: str(m.nom),
    contactType: m.contact_type === "whatsapp" ? "whatsapp" : "email",
    contact: str(m.contact),
    city: str(m.ville),
    address: str(m.adresse),
  };
}

export function profileToMetadata(p: Profile): Record<string, string> {
  return {
    nom: p.name,
    contact_type: p.contactType,
    contact: p.contact,
    ville: p.city,
    adresse: p.address,
  };
}

/** Le profil contient-il au moins une coordonnée exploitable ? */
export function profileHasData(p: Profile): boolean {
  return Boolean(p.name || p.contact || p.city || p.address);
}
