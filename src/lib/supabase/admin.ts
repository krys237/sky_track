import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseServiceRoleKey } from "./env";
import { resilientFetch } from "./fetch";

/**
 * Client d'administration (clé service_role) — CÔTÉ SERVEUR UNIQUEMENT.
 * Il contourne la RLS : à réserver aux opérations privilégiées (commande
 * invité, traitement des webhooks de paiement, back-office). Ne jamais
 * l'importer dans un composant navigateur.
 */
export function createAdminClient() {
  return createSupabaseClient(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
    // Timeout explicite + réessais : le réseau de production frôle
    // régulièrement le timeout de connexion par défaut (cf. ./fetch).
    global: { fetch: resilientFetch },
  });
}
