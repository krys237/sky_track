/**
 * Types de données (miroir du schéma SQL — migration 0001_init.sql).
 * À terme, remplaçables par une génération automatique :
 *   supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
 */
import type { ContactType, PackId, PayMethod } from "@/lib/types";

export type StatutCommande = "initiee" | "payee" | "echouee" | "expediee" | "livree";
export type ReseauCarte = "findhub" | "localiser";

export interface ClientRow {
  id: string;
  user_id: string | null;
  nom: string;
  contact_type: ContactType;
  contact_value: string;
  ville: string;
  adresse: string;
  created_at: string;
}

export interface CommandeRow {
  id: string;
  ref: string;
  client_id: string;
  pack: PackId;
  quantite: number;
  montant: number;
  devise: string;
  statut: StatutCommande;
  moyen_paiement: PayMethod | null;
  created_at: string;
}

export interface PaiementRow {
  id: string;
  commande_id: string;
  agregateur: string | null;
  transaction_id: string | null;
  statut: string | null;
  montant_verifie: number | null;
  webhook_payload: unknown | null;
  created_at: string;
}

export interface CarteRow {
  id: string;
  numero_serie: string;
  commande_id: string | null;
  statut_activation: string;
  reseau: ReseauCarte | null;
  created_at: string;
}
