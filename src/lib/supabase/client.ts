"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "./env";

/**
 * Client Supabase pour le navigateur (composants « use client »).
 * Utilise la clé publique anon ; toutes les données sont protégées par la RLS.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
